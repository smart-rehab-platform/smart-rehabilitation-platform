#!/usr/bin/env node
/**
 * End-to-end validation helper for Family Pattern Detection.
 * Run: node backend/scripts/validate-family-patterns-e2e.js [--setup] [--auth]
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const pool = require("../src/database/db");

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const DEMO_PASSWORD = "Test123456!";

const SEED = {
  parentEmail: "fatima.parent@test.com",
  parentId: "de000001-0001-4001-8001-000000000004",
  specialistEmail: "bana.specialist@test.com",
  specialistId: "de000001-0001-4001-8001-000000000002",
  patientA: {
    id: "de000002-0001-4001-8001-000000000001",
    name: "Omar Al-Rashid"
  },
  patientB: {
    id: "de000002-0001-4001-8001-000000000002",
    name: "Layla Al-Rashid"
  },
  speechCategoryId: "de000010-0001-4001-8001-000000000001"
};

async function inspectData() {
  const siblings = await pool.query(`
    SELECT pg.parent_id, u.email AS parent_email, u.full_name AS parent_name,
           COUNT(DISTINCT pg.patient_id) AS child_count,
           array_agg(DISTINCT p.id::text ORDER BY p.id::text) AS patient_ids,
           array_agg(DISTINCT p.full_name ORDER BY p.full_name) AS patient_names
    FROM patient_guardians pg
    JOIN users u ON u.id = pg.parent_id
    JOIN patients p ON p.id = pg.patient_id
    GROUP BY pg.parent_id, u.email, u.full_name
    HAVING COUNT(DISTINCT pg.patient_id) >= 2
    ORDER BY child_count DESC
  `);

  console.log("\n=== PARENTS WITH 2+ CHILDREN ===");
  console.log(JSON.stringify(siblings.rows, null, 2));

  for (const row of siblings.rows) {
    for (const pid of row.patient_ids) {
      const details = await pool.query(
        `
        SELECT p.id, p.full_name,
          COALESCE(
            (SELECT json_agg(json_build_object('title', d.diagnosis_title))
             FROM diagnoses d WHERE d.patient_id = p.id),
            '[]'::json
          ) AS diagnoses,
          (SELECT family_history FROM patient_medical_info pmi WHERE pmi.patient_id = p.id) AS family_history,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'category', cc.name,
              'category_id', cir.category_id,
              'observed_difficulties', cir.observed_difficulties,
              'previous_diagnosis_details', cir.previous_diagnosis_details,
              'patient_id', cir.patient_id,
              'status', cir.status
            ))
             FROM case_intake_requests cir
             JOIN case_categories cc ON cc.id = cir.category_id
             WHERE cir.patient_id = p.id),
            '[]'::json
          ) AS intake,
          COALESCE(
            (SELECT json_agg(u.email)
             FROM patient_specialists ps
             JOIN users u ON u.id = ps.specialist_id
             WHERE ps.patient_id = p.id),
            '[]'::json
          ) AS specialists
        FROM patients p
        WHERE p.id = $1
        `,
        [pid]
      );
      console.log("\n--- PATIENT ---");
      console.log(JSON.stringify(details.rows[0], null, 2));
    }
  }
}

async function setupHighEvidenceData() {
  const specialist = await pool.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [SEED.specialistEmail]
  );
  const specialistId = specialist.rows[0]?.id || SEED.specialistId;

  const category = await pool.query(
    `SELECT id, name FROM case_categories
     WHERE lower(trim(name)) LIKE '%speech%language%'
     ORDER BY name LIMIT 1`
  );
  const categoryId = category.rows[0]?.id || SEED.speechCategoryId;
  const categoryName = category.rows[0]?.name || "Speech & Language Therapy";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const patient of [SEED.patientA, SEED.patientB]) {
      await client.query(`DELETE FROM diagnoses WHERE patient_id = $1`, [
        patient.id
      ]);
    }

    await client.query(
      `INSERT INTO diagnoses (patient_id, diagnosed_by, diagnosis_title, description)
       VALUES ($1, $3, $2, 'Local family pattern validation seed')
       ON CONFLICT DO NOTHING`,
      [SEED.patientA.id, "Speech and Language Delay", specialistId]
    );
    await client.query(
      `INSERT INTO diagnoses (patient_id, diagnosed_by, diagnosis_title, description)
       VALUES ($1, $3, $2, 'Local family pattern validation seed')
       ON CONFLICT DO NOTHING`,
      [SEED.patientB.id, "Delayed Speech", specialistId]
    );

    for (const [patient, difficulties] of [
      [SEED.patientA, "Speech delay and articulation problems"],
      [SEED.patientB, "Delayed speech with articulation difficulties"]
    ]) {
      const existing = await client.query(
        `SELECT id FROM case_intake_requests WHERE patient_id = $1 LIMIT 1`,
        [patient.id]
      );

      if (existing.rows[0]) {
        await client.query(
          `UPDATE case_intake_requests
           SET category_id = $2,
               observed_difficulties = $3,
               previous_diagnosis_details = COALESCE(previous_diagnosis_details, 'Prior speech evaluation noted')
           WHERE patient_id = $1`,
          [patient.id, categoryId, difficulties]
        );
      } else {
        await client.query(
          `INSERT INTO case_intake_requests (
             parent_id, child_name, date_of_birth, gender, category_id,
             case_description, observed_difficulties, previous_diagnosis_details,
             preferred_contact_period, status, patient_id, converted_at
           )
           SELECT $4, p.full_name, p.date_of_birth, p.gender, $2,
                  'Family pattern validation intake', $3, 'Prior speech evaluation noted',
                  'morning'::preferred_time_period, 'converted_to_patient'::case_intake_status, p.id, now()
           FROM patients p WHERE p.id = $1`,
          [patient.id, categoryId, difficulties, SEED.parentId]
        );
      }
    }

    await client.query(
      `INSERT INTO patient_specialists (patient_id, specialist_id, is_primary)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (patient_id, specialist_id) DO NOTHING`,
      [SEED.patientA.id, specialistId]
    );
    await client.query(
      `INSERT INTO patient_specialists (patient_id, specialist_id, is_primary)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (patient_id, specialist_id) DO NOTHING`,
      [SEED.patientB.id, specialistId]
    );

    await client.query("COMMIT");
    console.log("\n=== SETUP COMPLETE ===");
    console.log(
      JSON.stringify(
        {
          indexPatientId: SEED.patientA.id,
          siblingPatientId: SEED.patientB.id,
          categoryId,
          categoryName
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function login(email) {
  const response = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: DEMO_PASSWORD })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${payload.message}`);
  }
  return payload.data.token;
}

async function callFamilyPatterns(token, patientId) {
  const response = await fetch(`${BASE}/patients/${patientId}/family-patterns`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function runAuthTests(patientId) {
  const assignedToken = await login(SEED.specialistEmail);
  const parentToken = await login(SEED.parentEmail);

  const otherSpecialist = await pool.query(
    `SELECT email FROM users WHERE role = 'specialist' AND email <> $1 LIMIT 1`,
    [SEED.specialistEmail]
  );
  const otherParent = await pool.query(
    `SELECT email FROM users WHERE role = 'parent' AND email <> $1 LIMIT 1`,
    [SEED.parentEmail]
  );

  const otherSpecialistToken = otherSpecialist.rows[0]
    ? await login(otherSpecialist.rows[0].email)
    : null;
  const otherParentToken = otherParent.rows[0]
    ? await login(otherParent.rows[0].email)
    : null;

  const results = {
    assignedSpecialist: await callFamilyPatterns(assignedToken, patientId),
    linkedParent: await callFamilyPatterns(parentToken, patientId),
    unassignedSpecialist: otherSpecialistToken
      ? await callFamilyPatterns(otherSpecialistToken, patientId)
      : { status: "skipped" },
    unrelatedParent: otherParentToken
      ? await callFamilyPatterns(otherParentToken, patientId)
      : { status: "skipped" },
    missingToken: await callFamilyPatterns(null, patientId)
  };

  console.log("\n=== AUTH TEST RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  return results;
}

async function main() {
  const args = new Set(process.argv.slice(2));

  await inspectData();

  if (args.has("--setup")) {
    await setupHighEvidenceData();
    await inspectData();
  }

  if (args.has("--auth")) {
    const health = await fetch(`${BASE}/health`).catch(() => null);
    if (!health?.ok) {
      console.error("\nBackend not reachable at", BASE);
      process.exit(1);
    }
    const endpoint = await callFamilyPatterns(
      await login(SEED.specialistEmail),
      SEED.patientA.id
    );
    console.log("\n=== ENDPOINT RESPONSE (assigned specialist) ===");
    console.log(JSON.stringify(endpoint, null, 2));
    await runAuthTests(SEED.patientA.id);
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
