#!/usr/bin/env node
/**
 * Prepares minimum real notification records for Phase G final validation.
 * Run: node backend/scripts/prepare-phase-g-final-validation-data.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PASSWORD = "Test123456!";
const SPECIALIST_EMAIL = "bana.specialist@test.com";
const PARENT_USER_ID = "de000001-0001-4001-8001-000000000004";
const OMAR_PATIENT_ID = "de000002-0001-4001-8001-000000000001";
const LAYLA_PATIENT_ID = "de000002-0001-4001-8001-000000000002";
const OMAR_REPORT_ID = "de000044-0001-4001-8001-000000000001";
const OMAR_SESSION_ID = "de000041-0001-4001-8001-000000000001";
const LAYLA_REPORT_ID = "de000044-0001-4001-8001-000000000002";

const created = [];

async function login(email) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || `Login failed for ${email}`);
  }
  return payload.data;
}

async function createNotification(token, body) {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Failed to create notification");
  }
  return payload.data;
}

async function getParentNotifications(parentToken, parentUserId) {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(parentUserId)}/notifications`, {
    headers: { Authorization: `Bearer ${parentToken}` },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load parent notifications");
  }
  return payload.data || [];
}

function hasUnreadType(notifications, type, entityId = null) {
  return notifications.some((row) => (
    row.type === type
    && row.is_read === false
    && (entityId ? row.related_entity_id === entityId : true)
  ));
}

async function main() {
  const specialist = await login(SPECIALIST_EMAIL);
  const parent = await login("fatima.parent@test.com");
  const existing = await getParentNotifications(parent.accessToken, PARENT_USER_ID);

  const specs = [];

  if (!hasUnreadType(existing, "report_ready", OMAR_REPORT_ID)) {
    specs.push({
      user_id: PARENT_USER_ID,
      type: "report_ready",
      title: "Weekly report ready for Omar Hassan",
      body: "Weekly Progress — Omar is available to view.",
      related_entity_type: "report",
      related_entity_id: OMAR_REPORT_ID,
    });
  }

  if (!hasUnreadType(existing, "session_reminder", OMAR_SESSION_ID)) {
    specs.push({
      user_id: PARENT_USER_ID,
      type: "session_reminder",
      title: "Session reminder for Omar Hassan",
      body: "Upcoming therapy session with Omar Hassan.",
      related_entity_type: "session",
      related_entity_id: OMAR_SESSION_ID,
    });
  }

  if (!existing.some((row) => (
    row.type === "report_ready"
    && row.is_read === false
    && row.related_entity_id === LAYLA_REPORT_ID
  ))) {
    specs.push({
      user_id: PARENT_USER_ID,
      type: "report_ready",
      title: "Weekly report ready for Layla Al-Rashid",
      body: "Weekly Progress — Layla is available to view.",
      related_entity_type: "report",
      related_entity_id: LAYLA_REPORT_ID,
    });
  }

  const unreadCount = existing.filter((row) => !row.is_read).length;
  if (unreadCount < 2) {
    specs.push(
      {
        user_id: PARENT_USER_ID,
        type: "general",
        title: "Phase G validation unread A",
        body: "Temporary unread notification for mark-all validation.",
        related_entity_type: "user",
        related_entity_id: specialist.user.id,
      },
      {
        user_id: PARENT_USER_ID,
        type: "general",
        title: "Phase G validation unread B",
        body: "Second temporary unread notification for mark-all validation.",
        related_entity_type: "user",
        related_entity_id: specialist.user.id,
      },
    );
  }

  for (const spec of specs) {
    const row = await createNotification(specialist.accessToken, spec);
    created.push({
      id: row.id,
      type: row.type,
      title: row.title,
      related_entity_type: row.related_entity_type,
      related_entity_id: row.related_entity_id,
      is_read: row.is_read,
    });
    console.log(`CREATED ${row.id} — ${row.type} — ${row.title}`);
  }

  const refreshed = await getParentNotifications(parent.accessToken, PARENT_USER_ID);
  console.log("");
  console.log(`Parent notifications total=${refreshed.length} unread=${refreshed.filter((r) => !r.is_read).length}`);
  console.log(`Created ${created.length} notification(s) for Phase G final validation.`);

  if (created.length === 0) {
    console.log("Existing data already sufficient; no new records created.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
