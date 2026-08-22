const pool = require("../../database/db");
const { createNotification } = require("../notifications/notifications.service");
const { getAppTimezone } = require("../../utils/appTimezone");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Specialist may manage a session only while it remains scheduled and upcoming.
 * scheduled_at is timestamptz; comparison uses absolute time (same as reminder job).
 */
const assertSpecialistCanManageUpcomingSession = (session) => {
  if (!session) {
    throw createError("Session not found", 404);
  }

  const status = String(session.status || "").trim().toLowerCase();
  if (status !== "scheduled") {
    throw createError("Only upcoming scheduled sessions can be modified.", 400);
  }

  const scheduledAt = session.scheduled_at
    ? new Date(session.scheduled_at)
    : null;
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    throw createError("Only upcoming scheduled sessions can be modified.", 400);
  }

  if (scheduledAt.getTime() <= Date.now()) {
    throw createError(
      "Only upcoming scheduled sessions can be modified.",
      400
    );
  }
};

const formatSessionDateTime = (scheduledAt) => {
  const date =
    scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return "the scheduled time";
  }

  const timezone = getAppTimezone();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${dateLabel} at ${timeLabel}`;
};

const formatLocationSnippet = (locationOrLink) => {
  const value = String(locationOrLink || "").trim();
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return " Meeting link updated.";
  }
  return ` Location: ${value}.`;
};

const loadGuardianUserIds = async (patientId) => {
  const id = String(patientId || "").trim();
  if (!id) {
    return [];
  }

  const result = await pool.query(
    `SELECT DISTINCT pg.parent_id
     FROM patient_guardians pg
     WHERE pg.patient_id = $1`,
    [id]
  );

  const recipients = new Set();
  for (const row of result.rows) {
    const parentId = String(row.parent_id || "").trim();
    if (parentId) {
      recipients.add(parentId);
    }
  }
  return [...recipients];
};

const buildUpdatedNotification = (session) => {
  const patientName = String(session.patient_name || "").trim() || "Your child";
  const whenLabel = formatSessionDateTime(session.scheduled_at);
  const locationSnippet = formatLocationSnippet(session.location_or_link);

  return {
    type: "session_updated",
    title: "Session Updated",
    body: `${patientName}'s session was updated. New time: ${whenLabel}.${locationSnippet}`,
  };
};

const buildCancelledNotification = (session) => {
  const patientName = String(session.patient_name || "").trim() || "Your child";
  const whenLabel = formatSessionDateTime(session.scheduled_at);
  const reason = String(session.cancellation_reason || "").trim();
  const reasonSnippet = reason ? ` Reason: ${reason}` : "";

  return {
    type: "session_cancelled",
    title: "Session Cancelled",
    body: `${patientName}'s session on ${whenLabel} was cancelled.${reasonSnippet}`,
  };
};

/**
 * Notifies patient guardians/parents only (same relationship as session reminders).
 * Does not notify the acting specialist.
 */
const notifyGuardiansOfSessionChange = async (session, event) => {
  if (!session?.id || !session?.patient_id) {
    return { sent: 0 };
  }

  const content =
    event === "cancelled"
      ? buildCancelledNotification(session)
      : buildUpdatedNotification(session);

  const recipients = await loadGuardianUserIds(session.patient_id);
  let sent = 0;

  for (const userId of recipients) {
    try {
      await createNotification({
        user_id: userId,
        type: content.type,
        title: content.title,
        body: content.body,
        related_entity_type: "session",
        related_entity_id: session.id,
      });
      sent += 1;
    } catch (error) {
      console.error(
        `[sessions] Failed to notify guardian ${userId} for session ${session.id}:`,
        error.message
      );
    }
  }

  return { sent, recipients: recipients.length };
};

module.exports = {
  assertSpecialistCanManageUpcomingSession,
  buildCancelledNotification,
  buildUpdatedNotification,
  formatSessionDateTime,
  loadGuardianUserIds,
  notifyGuardiansOfSessionChange,
};
