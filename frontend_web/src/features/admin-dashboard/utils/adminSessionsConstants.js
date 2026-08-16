export const SESSION_STATUS_VALUES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
];

export const FINAL_SESSION_STATUSES = new Set([
  "completed",
  "cancelled",
  "no_show",
]);

export function isPastScheduledNotCompleted(session) {
  if (!session?.scheduledAt || !session.status) {
    return false;
  }

  const normalizedStatus = session.status.trim().toLowerCase();
  if (normalizedStatus !== "scheduled") {
    return false;
  }

  const scheduledAt = session.scheduledAt instanceof Date
    ? session.scheduledAt
    : new Date(session.scheduledAt);

  if (Number.isNaN(scheduledAt.getTime())) {
    return false;
  }

  return scheduledAt.getTime() < Date.now();
}

export function getSessionStatusTone(status, isPastScheduled = false) {
  const normalized = (status || "unknown").trim().toLowerCase();

  if (normalized === "completed") {
    return "success";
  }

  if (normalized === "cancelled") {
    return "danger";
  }

  if (normalized === "no_show" || normalized === "pending") {
    return "warning";
  }

  if (normalized === "scheduled") {
    return isPastScheduled ? "warning" : "info";
  }

  return "muted";
}
