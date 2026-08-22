const pool = require("../database/db");
const { createNotification } = require("../modules/notifications/notifications.service");
const { getAppTimezone } = require("../utils/appTimezone");

const JOB_INTERVAL_MS = 5 * 60 * 1000;

const isJobEnabled = () => {
  const raw = process.env.SESSION_REMINDER_JOB_ENABLED;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return true;
  }

  const normalized = String(raw).trim().toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "no";
};

const formatSessionTime = (scheduledAt) => {
  const date =
    scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return "the scheduled time";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: getAppTimezone(),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const buildNotificationBody = (patientName, scheduledAt) => {
  const name = String(patientName || "").trim() || "The patient";
  const timeLabel = formatSessionTime(scheduledAt);
  return `${name}'s session starts in 30 minutes at ${timeLabel}.`;
};

const fetchCandidateSessionRows = async () => {
  const result = await pool.query(
    `SELECT s.id,
            s.scheduled_at,
            s.patient_id,
            s.specialist_id,
            p.full_name AS patient_name,
            u.full_name AS specialist_name,
            pg.parent_id
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     JOIN users u ON u.id = s.specialist_id
     LEFT JOIN patient_guardians pg ON pg.patient_id = s.patient_id
     WHERE s.status = 'scheduled'
       AND s.scheduled_at >= now() + interval '25 minutes'
       AND s.scheduled_at <= now() + interval '35 minutes'
     ORDER BY s.scheduled_at ASC, pg.parent_id ASC`
  );

  return result.rows;
};

const groupSessionsById = (rows) => {
  const sessions = new Map();

  for (const row of rows) {
    const sessionId = String(row.id || "").trim();
    if (!sessionId) {
      continue;
    }

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        scheduled_at: row.scheduled_at,
        patient_id: row.patient_id,
        specialist_id: row.specialist_id,
        patient_name: row.patient_name,
        specialist_name: row.specialist_name,
        parent_ids: new Set(),
      });
    }

    const parentId = String(row.parent_id || "").trim();
    if (parentId) {
      sessions.get(sessionId).parent_ids.add(parentId);
    }
  }

  return sessions;
};

const collectRecipients = (session) => {
  const recipients = new Set();
  const specialistId = String(session.specialist_id || "").trim();

  if (specialistId) {
    recipients.add(specialistId);
  }

  for (const parentId of session.parent_ids) {
    const normalized = String(parentId || "").trim();
    if (normalized) {
      recipients.add(normalized);
    }
  }

  return recipients;
};

const hasSessionReminderNotification = async (userId, sessionId) => {
  const result = await pool.query(
    `SELECT 1
     FROM notifications
     WHERE user_id = $1
       AND type = 'session_reminder'
       AND related_entity_type = 'session'
       AND related_entity_id = $2
     LIMIT 1`,
    [userId, sessionId]
  );

  return result.rows.length > 0;
};

const notifyRecipient = async ({ userId, session }) => {
  const alreadySent = await hasSessionReminderNotification(userId, session.id);
  if (alreadySent) {
    return { skipped: true };
  }

  await createNotification({
    user_id: userId,
    type: "session_reminder",
    title: "Session Reminder",
    body: buildNotificationBody(session.patient_name, session.scheduled_at),
    related_entity_type: "session",
    related_entity_id: session.id,
  });

  return { sent: true };
};

const runSessionReminders = async () => {
  try {
    const rows = await fetchCandidateSessionRows();
    const sessions = groupSessionsById(rows);

    for (const session of sessions.values()) {
      const recipients = collectRecipients(session);

      for (const userId of recipients) {
        try {
          await notifyRecipient({ userId, session });
        } catch (error) {
          console.error(
            `[session-reminder] Failed to notify user ${userId} for session ${session.id}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error("[session-reminder] Job run failed:", error.message);
  }
};

let intervalHandle = null;

const startSessionReminderJob = () => {
  if (!isJobEnabled()) {
    console.log("[session-reminder] Job disabled by SESSION_REMINDER_JOB_ENABLED");
    return null;
  }

  if (intervalHandle) {
    return intervalHandle;
  }

  runSessionReminders().catch((error) => {
    console.error("[session-reminder] Initial run failed:", error.message);
  });

  intervalHandle = setInterval(() => {
    runSessionReminders().catch((error) => {
      console.error("[session-reminder] Scheduled run failed:", error.message);
    });
  }, JOB_INTERVAL_MS);

  if (typeof intervalHandle.unref === "function") {
    intervalHandle.unref();
  }

  console.log("[session-reminder] Job scheduled every 5 minutes");
  return intervalHandle;
};

module.exports = {
  JOB_INTERVAL_MS,
  buildNotificationBody,
  collectRecipients,
  groupSessionsById,
  hasSessionReminderNotification,
  isJobEnabled,
  runSessionReminders,
  startSessionReminderJob,
};
