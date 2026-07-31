#!/usr/bin/env node
/**
 * Treatment Journey validation (service + optional HTTP).
 *
 * Usage (from repo root):
 *   node backend/scripts/test-treatment-journey.js
 *
 * Optional: start API server first for HTTP auth checks.
 * Demo password: Test123456!
 */

const assert = require("assert");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../src/database/db");
const treatmentJourneyService = require("../src/modules/progress/treatmentJourney.service");
const {
  canAccessPatient,
  isParentLinkedToPatient,
  isSpecialistAssignedToPatient,
} = require("../src/utils/patientAccess");

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const PASSWORD = "Test123456!";

let passed = 0;
let failed = 0;

function pass(label) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label, error) {
  failed += 1;
  console.error(`  ✗ ${label}`);
  console.error(`    ${error.message || error}`);
}

async function login(email) {
  const response = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${payload.message}`);
  }
  return payload.data.token;
}

async function apiGet(path, token) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function loadDemoLinkage() {
  const result = await pool.query(`
    SELECT
      parent.id AS parent_id,
      parent.email AS parent_email,
      specialist.id AS specialist_id,
      specialist.email AS specialist_email,
      admin.id AS admin_id,
      admin.email AS admin_email,
      linked.id AS linked_patient_id,
      linked.full_name AS linked_patient_name,
      unlinked.id AS unlinked_patient_id
    FROM users parent
    JOIN patient_guardians pg ON pg.parent_id = parent.id
    JOIN patients linked ON linked.id = pg.patient_id
    JOIN patient_specialists ps ON ps.patient_id = linked.id
    JOIN users specialist ON specialist.id = ps.specialist_id
    CROSS JOIN users admin
    CROSS JOIN LATERAL (
      SELECT p.id, p.full_name
      FROM patients p
      WHERE NOT EXISTS (
        SELECT 1
        FROM patient_guardians pg2
        WHERE pg2.patient_id = p.id AND pg2.parent_id = parent.id
      )
      LIMIT 1
    ) unlinked
    WHERE parent.email = 'fatima.parent@test.com'
      AND linked.full_name ILIKE '%Omar%'
      AND admin.email = 'admin@test.com'
    LIMIT 1
  `);

  if (!result.rows[0]) {
    throw new Error(
      "Demo linkage not found. Run seed-local-data.js and seed-treatment-journey-demo.js."
    );
  }

  return result.rows[0];
}

function assertAscending(points) {
  for (let index = 1; index < points.length; index += 1) {
    const previous = new Date(points[index - 1].date);
    const current = new Date(points[index].date);
    assert.ok(
      current >= previous,
      `Chart points not ascending at index ${index}`
    );
  }
}

async function runServiceTests(linkage) {
  console.log("\nService-layer tests");

  const patientId = linkage.linked_patient_id;

  try {
    const weekly = await treatmentJourneyService.getTreatmentJourney(
      patientId,
      "weekly"
    );
    assert.ok(weekly, "weekly journey missing");
    assert.equal(weekly.period, "weekly");
    assert.equal(weekly.data_source, "progress_snapshots");
    assert.ok(weekly.chart_points.length >= 1, "weekly chart points expected");
    assertAscending(weekly.chart_points);
    assert.equal(weekly.starting_score, weekly.chart_points[0].score);
    assert.equal(
      weekly.current_score,
      weekly.chart_points[weekly.chart_points.length - 1].score
    );
    pass("weekly snapshot response with ascending chart points");
  } catch (error) {
    fail("weekly snapshot response", error);
  }

  try {
    const monthly = await treatmentJourneyService.getTreatmentJourney(
      patientId,
      "monthly"
    );
    assert.ok(monthly.chart_points.length >= 1, "monthly chart points expected");
    assert.equal(monthly.period, "monthly");
    pass("monthly snapshot response");
  } catch (error) {
    fail("monthly snapshot response", error);
  }

  try {
    const full = await treatmentJourneyService.getTreatmentJourney(
      patientId,
      "full"
    );
    assert.ok(full.chart_points.length >= 1, "full chart points expected");
    assert.equal(full.period, "full");
    pass("full treatment response");
  } catch (error) {
    fail("full treatment response", error);
  }

  try {
    const parentUser = { id: linkage.parent_id, role: "parent" };
    const specialistUser = { id: linkage.specialist_id, role: "specialist" };
    const adminUser = { id: linkage.admin_id, role: "admin" };

    assert.equal(
      await canAccessPatient(patientId, parentUser),
      true,
      "parent should access linked child"
    );
    assert.equal(
      await canAccessPatient(linkage.unlinked_patient_id, parentUser),
      false,
      "parent should not access unlinked child"
    );
    assert.equal(
      await canAccessPatient(patientId, specialistUser),
      true,
      "specialist should access assigned patient"
    );
    assert.equal(
      await canAccessPatient(linkage.unlinked_patient_id, specialistUser),
      false,
      "specialist should not access unassigned patient"
    );
    assert.equal(
      await canAccessPatient(patientId, adminUser),
      true,
      "admin should access patient"
    );
    pass("authorization matrix for parent/specialist/admin");
  } catch (error) {
    fail("authorization matrix", error);
  }

  try {
    const weekly = await treatmentJourneyService.getTreatmentJourney(
      patientId,
      "weekly"
    );
    if (weekly.chart_points.length >= 2) {
      const last = weekly.chart_points[weekly.chart_points.length - 1].score;
      const prev = weekly.chart_points[weekly.chart_points.length - 2].score;
      const diff = last - prev;
      const expectedTrend =
        diff > 3 ? "improving" : diff < -3 ? "declining" : "stable";
      assert.equal(weekly.trend, expectedTrend, "trend mapping mismatch");
    }
    pass("trend mapping uses last two points");
  } catch (error) {
    fail("trend mapping", error);
  }

  try {
    const emptyPatientId = "00000000-0000-4000-8000-0000000000e1";
    await pool.query(
      `
      INSERT INTO patients (id, full_name, date_of_birth, gender, created_by)
      VALUES ($1, 'Empty Journey Test', '2018-01-01', 'male', $2)
      ON CONFLICT (id) DO NOTHING
      `,
      [emptyPatientId, linkage.parent_id]
    );

    const emptyJourney = await treatmentJourneyService.getTreatmentJourney(
      emptyPatientId,
      "weekly"
    );
    assert.ok(emptyJourney, "existing patient with no data should return payload");
    assert.equal(emptyJourney.chart_points.length, 0);
    assert.equal(emptyJourney.data_source, "exercise_reviews");
    assert.equal(emptyJourney.starting_score, null);
    pass("empty patient returns successful empty payload");
  } catch (error) {
    fail("empty patient payload", error);
  }

  try {
    const missingPatientId = "00000000-0000-4000-8000-000000000099";
    const missingJourney = await treatmentJourneyService.getTreatmentJourney(
      missingPatientId,
      "weekly"
    );
    assert.equal(missingJourney, null, "missing patient should return null");
    pass("missing patient returns null");
  } catch (error) {
    fail("missing patient", error);
  }
}

async function runFallbackTest(linkage) {
  console.log("\nReview fallback test (isolated temp patient)");

  const client = await pool.connect();
  const tempPatientId = "00000000-0000-4000-8000-0000000000f1";
  const tempSubmissionOneId = "00000000-0000-4000-8000-0000000000f2";
  const tempSubmissionTwoId = "00000000-0000-4000-8000-0000000000f6";
  const tempReviewOneId = "00000000-0000-4000-8000-0000000000f3";
  const tempReviewTwoId = "00000000-0000-4000-8000-0000000000f4";
  const tempAssignedExerciseId = "00000000-0000-4000-8000-0000000000f5";
  const tempPlanId = "00000000-0000-4000-8000-0000000000f7";

  async function cleanup() {
    await client.query(
      `DELETE FROM exercise_reviews WHERE id IN ($1, $2)`,
      [tempReviewOneId, tempReviewTwoId]
    );
    await client.query(
      `DELETE FROM exercise_submissions WHERE id IN ($1, $2)`,
      [tempSubmissionOneId, tempSubmissionTwoId]
    );
    await client.query(`DELETE FROM assigned_exercises WHERE id = $1`, [
      tempAssignedExerciseId,
    ]);
    await client.query(`DELETE FROM treatment_plans WHERE id = $1`, [tempPlanId]);
    await client.query(`DELETE FROM patients WHERE id = $1`, [tempPatientId]);
  }

  try {
    await cleanup();

    const assigned = await client.query(
      `
      SELECT ae.id, ae.patient_id, ae.assigned_by, ae.plan_id
      FROM assigned_exercises ae
      WHERE ae.patient_id = $1
      LIMIT 1
      `,
      [linkage.linked_patient_id]
    );

    if (!assigned.rows[0]) {
      throw new Error("No assigned exercise found for fallback setup");
    }

    const source = assigned.rows[0];

    await client.query(
      `
      INSERT INTO patients (id, full_name, date_of_birth, gender, created_by)
      VALUES ($1, 'Fallback Journey Test', '2018-01-01', 'male', $2)
      `,
      [tempPatientId, linkage.parent_id]
    );

    await client.query(
      `
      INSERT INTO treatment_plans (
        id, patient_id, specialist_id, based_on_assessment_id, title, status, start_date, end_date
      )
      SELECT
        $1,
        $2,
        specialist_id,
        based_on_assessment_id,
        'Fallback Journey Test Plan',
        'active',
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE
      FROM treatment_plans
      WHERE patient_id = $3
      LIMIT 1
      `,
      [tempPlanId, tempPatientId, linkage.linked_patient_id]
    );

    await client.query(
      `
      INSERT INTO assigned_exercises (
        id, exercise_id, plan_id, patient_id, assigned_by,
        frequency, start_date, due_date, is_active
      )
      SELECT
        $1,
        exercise_id,
        $4,
        $2,
        assigned_by,
        frequency,
        start_date,
        due_date,
        is_active
      FROM assigned_exercises
      WHERE id = $3
      `,
      [tempAssignedExerciseId, tempPatientId, source.id, tempPlanId]
    );

    await client.query(
      `
      INSERT INTO exercise_submissions (
        id, assigned_exercise_id, submitted_by, parent_notes, status, submitted_at
      )
      VALUES
        ($1, $2, $3, 'fallback test one', 'reviewed', now() - INTERVAL '10 days'),
        ($4, $2, $3, 'fallback test two', 'reviewed', now() - INTERVAL '2 days')
      `,
      [
        tempSubmissionOneId,
        tempAssignedExerciseId,
        linkage.parent_id,
        tempSubmissionTwoId,
      ]
    );

    await client.query(
      `
      INSERT INTO exercise_reviews (
        id, submission_id, specialist_id, performance_rating, feedback, requires_retry, reviewed_at
      )
      VALUES
        ($1, $3, $2, 7.5, 'fallback one', FALSE, now() - INTERVAL '9 days'),
        ($4, $5, $2, 8.0, 'fallback two', FALSE, now() - INTERVAL '1 day')
      `,
      [
        tempReviewOneId,
        linkage.specialist_id,
        tempSubmissionOneId,
        tempReviewTwoId,
        tempSubmissionTwoId,
      ]
    );

    const journey = await treatmentJourneyService.getTreatmentJourney(
      tempPatientId,
      "weekly"
    );

    assert.ok(journey, "fallback journey expected");
    assert.equal(journey.data_source, "exercise_reviews");
    assert.ok(journey.chart_points.length >= 1, "fallback chart points expected");
    assert.ok(
      journey.chart_points.some((point) => point.score === 75),
      "expected 7.5 rating normalized to 75"
    );
    assert.ok(
      journey.chart_points.some((point) => point.score === 80),
      "expected 8.0 rating normalized to 80"
    );

    pass("review fallback with normalized scores 75 and 80");
  } catch (error) {
    fail("review fallback", error);
  } finally {
    await cleanup();
    client.release();
  }
}

async function runHttpTests(linkage) {
  console.log("\nHTTP auth + validation tests");

  let parentToken;
  try {
    parentToken = await login(linkage.parent_email);
  } catch (error) {
    throw new Error(`HTTP server unavailable: ${error.message}`);
  }

  try {
    const specialistToken = await login(linkage.specialist_email);
    const adminToken = await login(linkage.admin_email);

    const linked = await apiGet(
      `/patients/${linkage.linked_patient_id}/treatment-journey?period=weekly`,
      parentToken
    );
    assert.equal(linked.status, 200);
    assert.equal(linked.payload.success, true);
    pass("parent can access linked child via HTTP");

    const unlinked = await apiGet(
      `/patients/${linkage.unlinked_patient_id}/treatment-journey?period=weekly`,
      parentToken
    );
    assert.equal(unlinked.status, 403);
    pass("parent receives 403 for unlinked child");

    const specialistLinked = await apiGet(
      `/patients/${linkage.linked_patient_id}/treatment-journey?period=monthly`,
      specialistToken
    );
    assert.equal(specialistLinked.status, 200);
    pass("specialist can access assigned patient");

    const specialistUnlinked = await apiGet(
      `/patients/${linkage.unlinked_patient_id}/treatment-journey?period=monthly`,
      specialistToken
    );
    assert.equal(specialistUnlinked.status, 403);
    pass("specialist receives 403 for unassigned patient");

    const adminLinked = await apiGet(
      `/patients/${linkage.linked_patient_id}/treatment-journey?period=full`,
      adminToken
    );
    assert.equal(adminLinked.status, 200);
    pass("admin can access patient");

    const invalidPeriod = await apiGet(
      `/patients/${linkage.linked_patient_id}/treatment-journey?period=yearly`,
      parentToken
    );
    assert.equal(invalidPeriod.status, 400);
    pass("invalid period returns validation error");

    const invalidUuid = await apiGet(
      "/patients/not-a-uuid/treatment-journey?period=weekly",
      parentToken
    );
    assert.equal(invalidUuid.status, 400);
    pass("invalid UUID returns validation error");
  } catch (error) {
    fail("HTTP auth + validation", error);
  }
}

async function main() {
  console.log("Treatment Journey validation");
  console.log("============================");

  const linkage = await loadDemoLinkage();
  console.log(
    `Using patient ${linkage.linked_patient_name} (${linkage.linked_patient_id})`
  );

  await runServiceTests(linkage);
  await runFallbackTest(linkage);

  try {
    await runHttpTests(linkage);
  } catch (error) {
    console.log("\nHTTP tests skipped (server unreachable or login failed).");
    console.log(`  Reason: ${error.message}`);
    console.log("  Start backend server and re-run for full HTTP coverage.");
  }

  console.log("\nSummary");
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Validation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
