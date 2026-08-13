/**
 * Isolated 5-complaint warning threshold verification.
 * Run: node scripts/test-complaints-warning-threshold.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../src/database/db");
const complaintsService = require("../src/modules/complaints/complaints.service");

const TEST_PASSWORD = "Test123456!";
const TEST_ADMIN_EMAIL = "complaints.warning.admin@test.local";
const TEST_PARENT_EMAIL = "complaints.warning.parent@test.local";
const TEST_SPECIALIST_EMAIL = "complaints.warning.specialist@test.local";
const TEST_PATIENT_NAME = "Complaint Threshold Test Child";

const DESCRIPTION =
  "Threshold verification complaint with enough characters for validation.";

const CATEGORIES = [
  "specialist_not_responding",
  "poor_follow_up",
  "repeated_session_cancellations",
  "delayed_exercise_feedback",
  "inappropriate_communication",
  "other",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function upsertUser({ email, role, fullName }) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, is_email_verified, is_active)
     VALUES ($1, $2, $3, '0599111222', $4, true, true)
     ON CONFLICT (email)
     DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       is_active = true,
       is_email_verified = true
     RETURNING id, email, role, is_active`,
    [fullName, email, passwordHash, role]
  );
  return result.rows[0];
}

async function setupFixture() {
  const admin = await upsertUser({
    email: TEST_ADMIN_EMAIL,
    role: "admin",
    fullName: "Complaint Threshold Admin",
  });
  const parent = await upsertUser({
    email: TEST_PARENT_EMAIL,
    role: "parent",
    fullName: "Complaint Threshold Parent",
  });
  const specialist = await upsertUser({
    email: TEST_SPECIALIST_EMAIL,
    role: "specialist",
    fullName: "Complaint Threshold Specialist",
  });

  const patientResult = await pool.query(
    `INSERT INTO patients (full_name, date_of_birth, gender, created_by)
     VALUES ($1, '2018-01-01', 'male', $2)
     RETURNING id`,
    [TEST_PATIENT_NAME, admin.id]
  );
  const patientId = patientResult.rows[0].id;

  await pool.query(
    `INSERT INTO patient_guardians (patient_id, parent_id, relationship, is_primary_contact)
     VALUES ($1, $2, 'mother', true)
     ON CONFLICT (patient_id, parent_id) DO NOTHING`,
    [patientId, parent.id]
  );
  await pool.query(
    `INSERT INTO patient_specialists (patient_id, specialist_id, is_primary)
     VALUES ($1, $2, true)
     ON CONFLICT (patient_id, specialist_id) DO NOTHING`,
    [patientId, specialist.id]
  );

  await pool.query(
    `DELETE FROM notifications
     WHERE related_entity_type IN ('complaint', 'specialist_warning')
       AND (
         user_id = $1
         OR user_id IN (SELECT id FROM users WHERE role = 'admin')
       )`,
    [specialist.id]
  );
  await pool.query(`DELETE FROM specialist_warnings WHERE specialist_id = $1`, [
    specialist.id,
  ]);
  await pool.query(`DELETE FROM complaints WHERE specialist_id = $1`, [
    specialist.id,
  ]);

  return { admin, parent, specialist, patientId };
}

async function countAutomaticWarnings(specialistId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM specialist_warnings
     WHERE specialist_id = $1
       AND is_automatic = true
       AND confirmed_complaints_count >= 5
       AND created_at >= now() - interval '90 days'`,
    [specialistId]
  );
  return result.rows[0].total;
}

async function countSpecialistWarningNotifications(specialistId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM notifications
     WHERE user_id = $1
       AND type = 'specialist_warning_issued'
       AND created_at >= now() - interval '1 hour'`,
    [specialistId]
  );
  return result.rows[0].total;
}

async function countAdminWarningNotifications() {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM notifications n
     JOIN users u ON u.id = n.user_id
     WHERE u.role = 'admin'
       AND n.type = 'specialist_warning_issued'
       AND n.created_at >= now() - interval '1 hour'`
  );
  return result.rows[0].total;
}

async function resolveComplaintFlow({ complaintId, adminId }) {
  await complaintsService.startComplaintReview({ complaintId, adminId });
  return complaintsService.resolveComplaint({
    complaintId,
    adminId,
    adminNotes: "Threshold verification resolve.",
    parentResponse: "Review completed.",
  });
}

(async () => {
  const fixture = await setupFixture();
  const { admin, parent, specialist, patientId } = fixture;
  const complaintIds = [];

  console.log("Fixture:", {
    admin: admin.email,
    parent: parent.email,
    specialist: specialist.email,
    patientId,
  });

  for (let index = 0; index < 5; index += 1) {
    const created = await complaintsService.createComplaint({
      parentId: parent.id,
      patientId,
      specialistId: specialist.id,
      category: CATEGORIES[index],
      description: `${DESCRIPTION} #${index + 1}`,
    });
    complaintIds.push(created.id);
    const resolved = await resolveComplaintFlow({
      complaintId: created.id,
      adminId: admin.id,
    });

    const summary = await complaintsService.getSpecialistComplaintsSummary(
      specialist.id
    );
    const warnings = await countAutomaticWarnings(specialist.id);
    const specialistWarningNotifications =
      await countSpecialistWarningNotifications(specialist.id);
    const resolvedCount = summary.confirmed_complaints_last_90_days;

    console.log(`After complaint ${index + 1}:`, {
      resolvedCount,
      adminAttention: summary.admin_attention_required,
      warningThresholdReached: summary.warning_threshold_reached,
      warnings,
      specialistWarningNotifications,
      warningCreated: Boolean(resolved.warning),
    });

    if (index <= 1) {
      assert(warnings === 0, `Complaint ${index + 1}: no warning record`);
      assert(
        specialistWarningNotifications === 0,
        `Complaint ${index + 1}: no specialist warning notification`
      );
      assert(!resolved.warning, `Complaint ${index + 1}: service warning null`);
    }

    if (index === 2) {
      assert(resolvedCount === 3, "Complaint 3 should have 3 resolved complaints");
      assert(
        summary.admin_attention_required === true,
        "Complaint 3 should activate admin attention"
      );
      assert(
        summary.warning_threshold_reached === false,
        "Complaint 3 should not reach warning threshold"
      );
      assert(warnings === 0, "Complaint 3: no warning record");
      assert(
        specialistWarningNotifications === 0,
        "Complaint 3: no specialist warning notification"
      );
    }

    if (index === 3) {
      assert(resolvedCount === 4, "Complaint 4 should have 4 resolved complaints");
      assert(warnings === 0, "Complaint 4: still no official warning");
      assert(
        specialistWarningNotifications === 0,
        "Complaint 4: no specialist warning notification"
      );
    }

    if (index === 4) {
      assert(resolvedCount === 5, "Complaint 5 should have 5 resolved complaints");
      assert(warnings === 1, "Complaint 5: exactly one warning record");
      assert(resolved.warning, "Complaint 5: service should return warning");
      assert(
        resolved.warning.confirmed_complaints_count === 5,
        "Complaint 5: warning count must be 5"
      );
      assert(
        specialistWarningNotifications >= 1,
        "Complaint 5: specialist warning notification required"
      );
      assert(
        (await countAdminWarningNotifications()) >= 1,
        "Complaint 5: admin warning notification required"
      );
      const specialistActive = await pool.query(
        `SELECT is_active FROM users WHERE id = $1`,
        [specialist.id]
      );
      assert(
        specialistActive.rows[0].is_active === true,
        "Specialist must remain active"
      );
    }
  }

  const warningsBeforeRefetch = await countAutomaticWarnings(specialist.id);
  const specialistNotificationsBefore =
    await countSpecialistWarningNotifications(specialist.id);
  for (let i = 0; i < 5; i += 1) {
    await complaintsService.getSpecialistComplaintsSummary(specialist.id);
  }
  const warningsAfterRefetch = await countAutomaticWarnings(specialist.id);
  const specialistNotificationsAfter =
    await countSpecialistWarningNotifications(specialist.id);
  assert(
    warningsAfterRefetch === warningsBeforeRefetch,
    "Refetch must not create duplicate warnings"
  );
  assert(
    specialistNotificationsAfter === specialistNotificationsBefore,
    "Refetch must not duplicate specialist warning notifications"
  );
  console.log("PASS refetch does not duplicate warnings/notifications");

  const complaint6 = await complaintsService.createComplaint({
    parentId: parent.id,
    patientId,
    specialistId: specialist.id,
    category: CATEGORIES[5],
    description: `${DESCRIPTION} #6`,
  });
  const resolved6 = await resolveComplaintFlow({
    complaintId: complaint6.id,
    adminId: admin.id,
  });
  const warningsAfterSixth = await countAutomaticWarnings(specialist.id);
  assert(
    warningsAfterSixth === 1,
    "Complaint 6 must not recreate the 5-complaint threshold warning"
  );
  assert(!resolved6.warning, "Complaint 6 resolve should not issue new warning");
  console.log("PASS complaint 6 does not recreate threshold warning");

  console.log("All warning threshold checks passed.");
  await pool.end();
})().catch(async (error) => {
  console.error("FAIL", error.message);
  await pool.end();
  process.exit(1);
});
