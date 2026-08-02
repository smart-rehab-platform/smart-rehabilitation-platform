#!/usr/bin/env node
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PASSWORD = "Test123456!";
const PARENT_EMAIL = "fatima.parent@test.com";

async function login(email) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.message);
  return { token: j.data.accessToken, user: j.data.user };
}

async function get(token, route) {
  const r = await fetch(`${API}${route}`, { headers: { Authorization: `Bearer ${token}` } });
  const j = await r.json();
  return { status: r.status, ...j };
}

(async () => {
  const { token, user } = await login(PARENT_EMAIL);
  const sessions = await get(token, `/parents/${user.id}/sessions`);
  const requests = await get(token, "/session-requests/mine");
  const children = await get(token, `/parents/${user.id}/patients`);

  console.log("CHILDREN:", (children.data || []).map((c) => ({ id: c.id, name: c.full_name })));
  console.log("\nSESSIONS:", sessions.count);
  for (const s of sessions.data || []) {
    console.log({
      id: s.id,
      patient: s.patient_name,
      status: s.status,
      at: s.scheduled_at,
      loc: s.location_or_link,
      specialist: s.specialist_name,
    });
  }

  console.log("\nREQUESTS:", requests.count);
  for (const r of requests.data || []) {
    console.log({
      id: r.id,
      patient: r.patient_name,
      status: r.status,
      reason: r.reason,
      preferred_date: r.preferred_date,
      period: r.preferred_time_period,
      rejection: r.rejection_reason,
      approved_session_id: r.approved_session_id,
    });
  }

  for (const child of children.data || []) {
    const sp = await get(token, `/patients/${child.id}/specialists`);
    console.log(`\nSPECIALISTS for ${child.full_name}:`, (sp.data || []).map((x) => ({
      specialist_id: x.specialist_id,
      name: x.full_name,
    })));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
