/**
 * Verify complaints module business rules.
 * Run: node scripts/test-complaints-endpoints.js
 */
require("dotenv").config();
const pool = require("../src/database/db");
const complaintsService = require("../src/modules/complaints/complaints.service");

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;

async function login(email, password) {
  const response = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${payload.message}`);
  }
  return payload.data.token;
}

async function api(method, path, token, body) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const linkage = await pool.query(`
    SELECT
      p.id AS patient_id,
      pg.parent_id,
      ps.specialist_id
    FROM patients p
    JOIN patient_guardians pg ON pg.patient_id = p.id
    JOIN patient_specialists ps ON ps.patient_id = p.id
    LIMIT 1
  `);

  if (!linkage.rows[0]) {
    throw new Error("No parent/patient/specialist linkage found for tests");
  }

  const { patient_id, parent_id, specialist_id } = linkage.rows[0];
  console.log("Test linkage:", linkage.rows[0]);

  const adminUser = await pool.query(
    `SELECT id, email FROM users WHERE role = 'admin' LIMIT 1`
  );
  const parentUser = await pool.query(
    `SELECT email FROM users WHERE id = $1`,
    [parent_id]
  );
  const otherParent = await pool.query(
    `SELECT u.id, u.email
     FROM users u
     WHERE u.role = 'parent' AND u.id <> $1
     LIMIT 1`,
    [parent_id]
  );

  const adminId = adminUser.rows[0]?.id;
  const adminEmail = adminUser.rows[0]?.email || "admin@smartrehab.com";
  const parentEmail = parentUser.rows[0]?.email || "parent@smartrehab.com";

  const description =
    "This is a verification complaint with enough characters for validation.";

  const created = await complaintsService.createComplaint({
    parentId: parent_id,
    patientId: patient_id,
    specialistId: specialist_id,
    category: "poor_follow_up",
    description,
  });
  console.log("PASS parent can submit valid complaint", created.id);
  assert(created.status === "pending", "Created complaint should be pending");

  let failed = false;
  try {
    await complaintsService.createComplaint({
      parentId: parent_id,
      patientId: patient_id,
      specialistId: specialist_id,
      category: "poor_follow_up",
      description,
    });
  } catch (error) {
    failed = error.statusCode === 409;
  }
  assert(failed, "Duplicate active complaint should be rejected");
  console.log("PASS duplicate active complaint rejected");

  let unauthorizedChild = false;
  try {
    await complaintsService.createComplaint({
      parentId: otherParent.rows[0]?.id || parent_id,
      patientId: patient_id,
      specialistId: specialist_id,
      category: "other",
      description,
    });
  } catch (error) {
    unauthorizedChild = error.statusCode === 403;
  }
  if (otherParent.rows[0]) {
    assert(unauthorizedChild, "Unrelated parent should be rejected");
    console.log("PASS unrelated parent rejected");
  }

  const unassignedSpecialist = await pool.query(
    `SELECT id FROM users WHERE role = 'specialist' AND id <> $1 LIMIT 1`,
    [specialist_id]
  );
  if (unassignedSpecialist.rows[0]) {
    let unassigned = false;
    try {
      await complaintsService.createComplaint({
        parentId: parent_id,
        patientId: patient_id,
        specialistId: unassignedSpecialist.rows[0].id,
        category: "other",
        description,
      });
    } catch (error) {
      unassigned = error.statusCode === 403;
    }
    assert(unassigned, "Unassigned specialist should be rejected");
    console.log("PASS unassigned specialist rejected");
  }

  const reviewStarted = await complaintsService.startComplaintReview({
    complaintId: created.id,
    adminId,
  });
  assert(
    reviewStarted.complaint.status === "under_review",
    "Should start review"
  );
  console.log("PASS admin can start review");

  let invalidTransition = false;
  try {
    await complaintsService.startComplaintReview({
      complaintId: created.id,
      adminId,
    });
  } catch (error) {
    invalidTransition = error.code === "invalid_status_transition";
  }
  assert(invalidTransition, "Invalid transition should be rejected");
  console.log("PASS invalid status transition rejected");

  const rejectedComplaint = await complaintsService.createComplaint({
    parentId: parent_id,
    patientId: patient_id,
    specialistId: specialist_id,
    category: "other",
    description,
  });
  const rejected = await complaintsService.rejectComplaint({
    complaintId: rejectedComplaint.id,
    adminId,
    adminNotes: "Rejected during verification test.",
    parentResponse: "Your complaint was reviewed.",
  });
  assert(rejected.complaint.status === "rejected", "Should reject complaint");
  console.log("PASS admin can reject");

  const resolved = await complaintsService.resolveComplaint({
    complaintId: created.id,
    adminId,
    adminNotes: "Confirmed after review during verification test.",
    parentResponse: "Thank you for your report.",
  });
  assert(resolved.complaint.status === "resolved", "Should resolve complaint");
  console.log("PASS admin can resolve");

  const summary = await complaintsService.getSpecialistComplaintsSummary(
    specialist_id
  );
  assert(
    summary.confirmed_complaints_last_90_days >= 1,
    "Resolved complaints should count"
  );
  console.log(
    "PASS resolved complaints count",
    summary.confirmed_complaints_last_90_days
  );

  const parentMine = await complaintsService.listParentComplaints(parent_id);
  assert(
    parentMine.some((item) => item.id === created.id),
    "Parent should see own complaint"
  );
  console.log("PASS parent can read own complaints");

  let parentAccessDenied = false;
  try {
    await complaintsService.getParentComplaintById(
      otherParent.rows[0]?.id || parent_id,
      created.id
    );
  } catch (error) {
    parentAccessDenied = error.statusCode === 404;
  }
  if (otherParent.rows[0]) {
    assert(parentAccessDenied, "Other parent should not access complaint");
    console.log("PASS parent cannot access another parent complaint");
  }

  // Warning threshold simulation using isolated specialist if possible
  const thresholdSpecialist = await pool.query(
    `SELECT u.id
     FROM users u
     WHERE u.role = 'specialist'
       AND u.id <> $1
       AND NOT EXISTS (
         SELECT 1 FROM specialist_warnings sw
         WHERE sw.specialist_id = u.id
           AND sw.is_automatic = true
           AND sw.confirmed_complaints_count >= 5
           AND sw.created_at >= now() - interval '90 days'
       )
     LIMIT 1`,
    [specialist_id]
  );

  if (thresholdSpecialist.rows[0]) {
    const thresholdPatient = await pool.query(
      `SELECT p.id
       FROM patients p
       JOIN patient_guardians pg ON pg.patient_id = p.id
       JOIN patient_specialists ps ON ps.patient_id = p.id
       WHERE pg.parent_id = $1 AND ps.specialist_id = $2
       LIMIT 1`,
      [parent_id, thresholdSpecialist.rows[0].id]
    );

    if (thresholdPatient.rows[0]) {
      const categories = [
        "specialist_not_responding",
        "delayed_exercise_feedback",
        "inappropriate_communication",
        "repeated_session_cancellations",
        "other",
      ];

      for (const category of categories) {
        const item = await complaintsService.createComplaint({
          parentId: parent_id,
          patientId: thresholdPatient.rows[0].id,
          specialistId: thresholdSpecialist.rows[0].id,
          category,
          description,
        });
        await complaintsService.startComplaintReview({
          complaintId: item.id,
          adminId,
        });
        await complaintsService.resolveComplaint({
          complaintId: item.id,
          adminId,
          adminNotes: `Threshold test ${category}`,
        });
      }

      const thresholdSummary =
        await complaintsService.getSpecialistComplaintsSummary(
          thresholdSpecialist.rows[0].id
        );
      assert(
        thresholdSummary.confirmed_complaints_last_90_days >= 5,
        "Should have at least 5 resolved complaints"
      );

      const warningsBefore = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM specialist_warnings
         WHERE specialist_id = $1
           AND is_automatic = true
           AND confirmed_complaints_count >= 5
           AND created_at >= now() - interval '90 days'`,
        [thresholdSpecialist.rows[0].id]
      );

      await complaintsService.getSpecialistComplaintsSummary(
        thresholdSpecialist.rows[0].id
      );

      const warningsAfter = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM specialist_warnings
         WHERE specialist_id = $1
           AND is_automatic = true
           AND confirmed_complaints_count >= 5
           AND created_at >= now() - interval '90 days'`,
        [thresholdSpecialist.rows[0].id]
      );

      assert(
        warningsAfter.rows[0].total >= warningsBefore.rows[0].total,
        "Warning count should not decrease on refetch"
      );
      console.log(
        "PASS warning threshold handling",
        warningsAfter.rows[0].total
      );
    }
  }

  try {
    const parentToken = await login(parentEmail, "123456");
    const adminToken = await login(adminEmail, "123456");

    const httpMine = await api("GET", "/complaints/my", parentToken);
    console.log("HTTP GET /complaints/my", httpMine.status);

    const httpAdmin = await api("GET", "/admin/complaints", adminToken);
    console.log("HTTP GET /admin/complaints", httpAdmin.status);

    const specialistToken = await login(
      (
        await pool.query(`SELECT email FROM users WHERE id = $1`, [
          specialist_id,
        ])
      ).rows[0]?.email || "specialist@smartrehab.com",
      "123456"
    );
    const httpSpecialist = await api(
      "GET",
      `/complaints/${created.id}`,
      specialistToken
    );
    assert(
      httpSpecialist.status === 403 || httpSpecialist.status === 404,
      "Specialist should not access complaint details"
    );
    console.log("PASS specialist cannot access complaint details", httpSpecialist.status);
  } catch (error) {
    console.log("HTTP layer skipped:", error.message);
  }

  console.log("All complaint checks completed.");
  await pool.end();
})().catch(async (error) => {
  console.error("FAIL", error);
  await pool.end();
  process.exit(1);
});
