#!/usr/bin/env node
/**
 * Prepares minimum Phase E live-validation session/request data via specialist API.
 * Run: node backend/scripts/prepare-phase-e-validation-data.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PASSWORD = "Test123456!";
const SPECIALIST_EMAIL = "bana.specialist@test.com";
const PARENT_EMAIL = "fatima.parent@test.com";

const OMAR_ID = "de000002-0001-4001-8001-000000000001";
const LAYLA_ID = "de000002-0001-4001-8001-000000000002";
const SPECIALIST_ID = "de000001-0001-4001-8001-000000000002";

const created = [];

async function login(email) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.message || `Login failed for ${email}`);
  return { token: j.data.accessToken, user: j.data.user };
}

async function api(token, method, route, body) {
  const r = await fetch(`${API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, data: j.data, message: j.message };
}

function futureIso(daysAhead, hourUtc = 10) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
}

function futureDate(daysAhead) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

(async () => {
  const specialist = await login(SPECIALIST_EMAIL);
  const parent = await login(PARENT_EMAIL);

  const futureFull = await api(specialist.token, "POST", "/sessions", {
    patient_id: OMAR_ID,
    specialist_id: SPECIALIST_ID,
    scheduled_at: futureIso(3, 14),
    duration_minutes: 45,
    location_or_link: "https://meet.google.com/phase-e-full-url-test",
  });
  if (futureFull.status === 201) {
    created.push({ type: "session", case: "future_full_url", id: futureFull.data.id });
    console.log("Created future full URL session:", futureFull.data.id);
  } else {
    console.log("Future full URL session skipped:", futureFull.status, futureFull.message);
  }

  const futureEmbedded = await api(specialist.token, "POST", "/sessions", {
    patient_id: LAYLA_ID,
    specialist_id: SPECIALIST_ID,
    scheduled_at: futureIso(4, 11),
    duration_minutes: 45,
    location_or_link: "Online session: https://meet.google.com/phase-e-embedded-test",
  });
  if (futureEmbedded.status === 201) {
    created.push({ type: "session", case: "future_embedded_url", id: futureEmbedded.data.id });
    console.log("Created future embedded URL session:", futureEmbedded.data.id);
  } else {
    console.log("Future embedded session skipped:", futureEmbedded.status, futureEmbedded.message);
  }

  const futurePhysical = await api(specialist.token, "POST", "/sessions", {
    patient_id: OMAR_ID,
    specialist_id: SPECIALIST_ID,
    scheduled_at: futureIso(5, 9),
    duration_minutes: 45,
    location_or_link: "Rehabilitation Center - Room 4",
  });
  if (futurePhysical.status === 201) {
    created.push({ type: "session", case: "future_physical", id: futurePhysical.data.id });
    console.log("Created future physical session:", futurePhysical.data.id);
  } else {
    console.log("Future physical session skipped:", futurePhysical.status, futurePhysical.message);
  }

  const futureCancel = await api(specialist.token, "POST", "/sessions", {
    patient_id: LAYLA_ID,
    specialist_id: SPECIALIST_ID,
    scheduled_at: futureIso(6, 15),
    duration_minutes: 45,
    location_or_link: "Clinic Room C",
  });
  if (futureCancel.status === 201) {
    const cancel = await api(specialist.token, "PATCH", `/sessions/${futureCancel.data.id}/cancel`, {
      cancellation_reason: "Phase E validation cancelled session",
    });
    if (cancel.status === 200) {
      created.push({ type: "session", case: "cancelled", id: futureCancel.data.id });
      console.log("Created and cancelled session:", futureCancel.data.id);
    }
  }

  const rejectSeed = await api(parent.token, "POST", "/session-requests", {
    patient_id: OMAR_ID,
    specialist_id: SPECIALIST_ID,
    reason: "regular_follow_up",
    preferred_date: futureDate(7),
    preferred_time_period: "morning",
    notes: "Phase E validation seed for rejection",
  });
  if (rejectSeed.status === 201) {
    const reject = await api(specialist.token, "PATCH", `/session-requests/${rejectSeed.data.id}/reject`, {
      rejection_reason: "Phase E validation rejection response",
    });
    if (reject.status === 200) {
      created.push({ type: "request", case: "rejected", id: rejectSeed.data.id });
      console.log("Created rejected request:", rejectSeed.data.id);
    } else {
      console.log("Reject failed:", reject.status, reject.message);
    }
  } else {
    console.log("Reject seed request skipped:", rejectSeed.status, rejectSeed.message);
  }

  console.log("\nCREATED_RECORDS:", JSON.stringify(created, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
