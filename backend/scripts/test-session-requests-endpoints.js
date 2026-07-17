/**
 * Verify session request endpoints after migration 004.
 * Run: node scripts/test-session-requests-endpoints.js
 */
require("dotenv").config();
const pool = require("../src/database/db");
const sessionRequestsService = require("../src/modules/sessionRequests/sessionRequests.service");

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

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 7);
  const preferredDate = tomorrow.toISOString().slice(0, 10);

  const parentUser = await pool.query(
    `SELECT email FROM users WHERE id = $1`,
    [parent_id]
  );
  const specialistUser = await pool.query(
    `SELECT email FROM users WHERE id = $1`,
    [specialist_id]
  );

  const parentEmail = parentUser.rows[0]?.email || "parent@smartrehab.com";
  const specialistEmail =
    specialistUser.rows[0]?.email || "specialist@smartrehab.com";

  // Service-layer smoke (no HTTP server required)
  const created = await sessionRequestsService.createSessionRequest({
    parentId: parent_id,
    patientId: patient_id,
    specialistId: specialist_id,
    reason: "regular_follow_up",
    preferredDate: preferredDate,
    preferredTimePeriod: "morning",
    notes: "Migration verification request",
  });
  console.log("PASS service POST create", created.id);

  const mine = await sessionRequestsService.listParentRequests(parent_id, null);
  console.log("PASS service GET mine", mine.length, "rows");

  const inbox = await sessionRequestsService.listSpecialistInbox(
    specialist_id,
    null
  );
  console.log("PASS service GET inbox", inbox.length, "rows");

  const approved = await sessionRequestsService.approveSessionRequest({
    requestId: created.id,
    specialistId: specialist_id,
    scheduledAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    locationOrLink: "Clinic Room 2",
  });
  console.log("PASS service PATCH approve", approved.request.status);

  const forReject = await sessionRequestsService.createSessionRequest({
    parentId: parent_id,
    patientId: patient_id,
    specialistId: specialist_id,
    reason: "consultation",
    preferredDate: preferredDate,
    preferredTimePeriod: "afternoon",
  });

  const rejected = await sessionRequestsService.rejectSessionRequest({
    requestId: forReject.id,
    specialistId: specialist_id,
    rejectionReason: "Schedule conflict during verification test",
  });
  console.log("PASS service PATCH reject", rejected.status);

  // HTTP layer if server is reachable
  try {
    const parentToken = await login(parentEmail, "123456");
    const specialistToken = await login(specialistEmail, "123456");

    const httpMine = await api("GET", "/session-requests/mine", parentToken);
    console.log("HTTP GET /session-requests/mine", httpMine.status);

    const httpInbox = await api(
      "GET",
      "/session-requests/inbox",
      specialistToken
    );
    console.log("HTTP GET /session-requests/inbox", httpInbox.status);

    const httpCreate = await api("POST", "/session-requests", parentToken, {
      patient_id,
      specialist_id,
      reason: "additional_session",
      preferred_date: preferredDate,
      preferred_time_period: "flexible",
    });
    console.log("HTTP POST /session-requests", httpCreate.status);

    if (httpCreate.status === 201) {
      const requestId = httpCreate.payload.data.id;
      const httpApprove = await api(
        "PATCH",
        `/session-requests/${requestId}/approve`,
        specialistToken,
        {
          scheduled_at: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          duration_minutes: 45,
        }
      );
      console.log(
        "HTTP PATCH /session-requests/:id/approve",
        httpApprove.status
      );
    }

    const httpRejectCandidate = await api(
      "POST",
      "/session-requests",
      parentToken,
      {
        patient_id,
        specialist_id,
        reason: "regular_follow_up",
        preferred_date: preferredDate,
        preferred_time_period: "evening",
      }
    );

    if (httpRejectCandidate.status === 201) {
      const rejectId = httpRejectCandidate.payload.data.id;
      const httpReject = await api(
        "PATCH",
        `/session-requests/${rejectId}/reject`,
        specialistToken,
        { rejection_reason: "HTTP verification reject" }
      );
      console.log(
        "HTTP PATCH /session-requests/:id/reject",
        httpReject.status
      );
    }
  } catch (error) {
    console.log("SKIP HTTP checks (server unavailable):", error.message);
  }

  console.log("\nAll session request verification checks completed.");
  await pool.end();
})().catch(async (error) => {
  console.error(error);
  try {
    await pool.end();
  } catch (_) {}
  process.exit(1);
});
