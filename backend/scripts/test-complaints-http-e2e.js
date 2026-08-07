/**
 * HTTP-level complaints API verification with temporary test users.
 * Requires backend listening on PORT (default 5000).
 * Run: node scripts/test-complaints-http-e2e.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../src/database/db");
const { generateAccessToken } = require("../src/modules/auth/auth.tokens");

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const TEST_PASSWORD = "Test123456!";
const RUN_ID = Date.now().toString(36);
const TEST_ADMIN_EMAIL = `complaints.http.admin.${RUN_ID}@example.com`;
const TEST_PARENT_A_EMAIL = `complaints.http.parent.a.${RUN_ID}@example.com`;
const TEST_PARENT_B_EMAIL = `complaints.http.parent.b.${RUN_ID}@example.com`;
const TEST_SPECIALIST_EMAIL = `complaints.http.specialist.${RUN_ID}@example.com`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed += 1;
    throw new Error(message);
  }
  passed += 1;
}

async function tokenForUser(user) {
  return generateAccessToken(user);
}

async function api(method, path, token, body, isFormData = false) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function upsertUser({ email, role, fullName }) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, is_email_verified, is_active)
     VALUES ($1, $2, $3, '0599333444', $4, true, true)
     RETURNING id, email, role`,
    [fullName, email, passwordHash, role]
  );
  return result.rows[0];
}

async function setupFixture() {
  const admin = await upsertUser({
    email: TEST_ADMIN_EMAIL,
    role: "admin",
    fullName: "HTTP Complaints Admin",
  });
  const parentA = await upsertUser({
    email: TEST_PARENT_A_EMAIL,
    role: "parent",
    fullName: "HTTP Complaints Parent A",
  });
  const parentB = await upsertUser({
    email: TEST_PARENT_B_EMAIL,
    role: "parent",
    fullName: "HTTP Complaints Parent B",
  });
  const specialist = await upsertUser({
    email: TEST_SPECIALIST_EMAIL,
    role: "specialist",
    fullName: "HTTP Complaints Specialist",
  });

  const patientResult = await pool.query(
    `INSERT INTO patients (full_name, date_of_birth, gender, created_by)
     VALUES ('HTTP Complaints Child', '2017-05-05', 'female', $1)
     RETURNING id`,
    [admin.id]
  );
  const patientId = patientResult.rows[0].id;

  await pool.query(
    `INSERT INTO patient_guardians (patient_id, parent_id, relationship, is_primary_contact)
     VALUES ($1, $2, 'mother', true)`,
    [patientId, parentA.id]
  );
  await pool.query(
    `INSERT INTO patient_specialists (patient_id, specialist_id, is_primary)
     VALUES ($1, $2, true)`,
    [patientId, specialist.id]
  );

  return { admin, parentA, parentB, specialist, patientId };
}

async function cleanupFixture(ids) {
  await pool.query(`DELETE FROM complaints WHERE specialist_id = $1`, [
    ids.specialist.id,
  ]);
  await pool.query(`DELETE FROM specialist_warnings WHERE specialist_id = $1`, [
    ids.specialist.id,
  ]);
  await pool.query(`DELETE FROM notifications WHERE user_id = ANY($1::uuid[])`, [
    [ids.admin.id, ids.parentA.id, ids.parentB.id, ids.specialist.id],
  ]);
  await pool.query(`DELETE FROM audit_logs WHERE user_id = ANY($1::uuid[])`, [
    [ids.admin.id, ids.parentA.id, ids.parentB.id, ids.specialist.id],
  ]);
  await pool.query(`DELETE FROM patient_specialists WHERE patient_id = $1`, [
    ids.patientId,
  ]);
  await pool.query(`DELETE FROM patient_guardians WHERE patient_id = $1`, [
    ids.patientId,
  ]);
  await pool.query(`DELETE FROM patients WHERE id = $1`, [ids.patientId]);
  for (const userId of [
    ids.admin.id,
    ids.parentA.id,
    ids.parentB.id,
    ids.specialist.id,
  ]) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  }
}

(async () => {
  let health;
  try {
    health = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "health-check@example.com", password: "x" }),
    });
  } catch (error) {
    throw new Error(`Backend must be reachable on ${BASE}: ${error.message}`);
  }
  assert(Boolean(health), "Backend must be reachable on /api/v1");

  const fixture = await setupFixture();
  const description =
    "HTTP end-to-end complaint description with enough characters.";

  try {
    const parentToken = await tokenForUser({
      id: fixture.parentA.id,
      email: fixture.parentA.email,
      role: "parent",
      full_name: "HTTP Complaints Parent A",
    });
    const parentBToken = await tokenForUser({
      id: fixture.parentB.id,
      email: fixture.parentB.email,
      role: "parent",
      full_name: "HTTP Complaints Parent B",
    });
    const adminToken = await tokenForUser({
      id: fixture.admin.id,
      email: fixture.admin.email,
      role: "admin",
      full_name: "HTTP Complaints Admin",
    });
    const specialistToken = await tokenForUser({
      id: fixture.specialist.id,
      email: fixture.specialist.email,
      role: "specialist",
      full_name: "HTTP Complaints Specialist",
    });

    const invalidCreate = await api("POST", "/complaints", parentToken, {
      patient_id: fixture.patientId,
      specialist_id: fixture.specialist.id,
      category: "invalid_category",
      description,
    });
    assert(invalidCreate.status === 400, "Invalid category returns 400");

    const shortDescription = await api("POST", "/complaints", parentToken, {
      patient_id: fixture.patientId,
      specialist_id: fixture.specialist.id,
      category: "other",
      description: "too short",
    });
    assert(shortDescription.status === 400, "Short description returns 400");

    const create = await api("POST", "/complaints", parentToken, {
      patient_id: fixture.patientId,
      specialist_id: fixture.specialist.id,
      category: "poor_follow_up",
      description,
    });
    assert(create.status === 201, "Parent POST /complaints returns 201");
    const complaintId = create.payload.data.id;

    const duplicate = await api("POST", "/complaints", parentToken, {
      patient_id: fixture.patientId,
      specialist_id: fixture.specialist.id,
      category: "poor_follow_up",
      description,
    });
    assert(duplicate.status === 409, "Duplicate active complaint returns 409");

    const mine = await api("GET", "/complaints/my", parentToken);
    assert(mine.status === 200, "Parent GET /complaints/my returns 200");
    assert(
      Array.isArray(mine.payload.data) &&
        mine.payload.data.some((item) => item.id === complaintId),
      "Created complaint appears in parent list"
    );

    const detail = await api("GET", `/complaints/${complaintId}`, parentToken);
    assert(detail.status === 200, "Parent GET /complaints/:id returns 200");

    const otherParentDetail = await api(
      "GET",
      `/complaints/${complaintId}`,
      parentBToken
    );
    assert(
      otherParentDetail.status === 404,
      "Other parent cannot access complaint detail"
    );

    const parentAdminList = await api(
      "GET",
      "/admin/complaints",
      parentToken
    );
    assert(
      parentAdminList.status === 403,
      "Parent cannot access admin complaints list"
    );

    const specialistDetail = await api(
      "GET",
      `/complaints/${complaintId}`,
      specialistToken
    );
    assert(
      specialistDetail.status === 403,
      "Specialist cannot access parent complaint detail"
    );

    const adminList = await api("GET", "/admin/complaints", adminToken);
    assert(adminList.status === 200, "Admin GET /admin/complaints returns 200");

    const adminDetail = await api(
      "GET",
      `/admin/complaints/${complaintId}`,
      adminToken
    );
    assert(
      adminDetail.status === 200,
      "Admin GET /admin/complaints/:id returns 200"
    );

    const invalidResolve = await api(
      "PATCH",
      `/admin/complaints/${complaintId}/resolve`,
      adminToken,
      { admin_notes: "Trying invalid transition." }
    );
    assert(
      invalidResolve.status === 409,
      "Resolve from pending returns invalid transition"
    );

    const startReview = await api(
      "PATCH",
      `/admin/complaints/${complaintId}/start-review`,
      adminToken
    );
    assert(startReview.status === 200, "Admin start-review returns 200");

    const rejectMissingNotes = await api(
      "PATCH",
      `/admin/complaints/${complaintId}/reject`,
      adminToken,
      {}
    );
    assert(
      rejectMissingNotes.status === 400,
      "Reject without admin notes returns 400"
    );

    const resolve = await api(
      "PATCH",
      `/admin/complaints/${complaintId}/resolve`,
      adminToken,
      {
        admin_notes: "Resolved during HTTP verification.",
        parent_response: "Your complaint was reviewed.",
      }
    );
    assert(resolve.status === 200, "Admin resolve returns 200");
    assert(
      resolve.payload.data.complaint.status === "resolved",
      "Resolved status returned in payload"
    );

    const rejectComplaintCreate = await api("POST", "/complaints", parentToken, {
      patient_id: fixture.patientId,
      specialist_id: fixture.specialist.id,
      category: "other",
      description: `${description} Reject path.`,
    });
    const rejectId = rejectComplaintCreate.payload.data.id;
    const reject = await api(
      "PATCH",
      `/admin/complaints/${rejectId}/reject`,
      adminToken,
      { admin_notes: "Rejected during HTTP verification." }
    );
    assert(reject.status === 200, "Admin reject returns 200");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([Buffer.from("%PDF-1.4 test")], { type: "application/pdf" }),
      "complaint-test.pdf"
    );
    const upload = await api(
      "POST",
      "/uploads/complaint-attachment",
      parentToken,
      formData,
      true
    );
    assert(
      upload.status === 200 || upload.status === 201,
      "Parent complaint attachment upload succeeds"
    );

    console.log(`HTTP E2E complete: ${passed} checks passed.`);
  } finally {
    await cleanupFixture(fixture);
    await pool.end();
  }
})().catch(async (error) => {
  console.error("FAIL", error.message);
  console.error(`Passed before failure: ${passed}, failed: ${failed + 1}`);
  try {
    await pool.end();
  } catch (_) {}
  process.exit(1);
});
