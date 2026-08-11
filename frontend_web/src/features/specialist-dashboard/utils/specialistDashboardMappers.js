function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

/**
 * Matches Flutter sessionIsToday in session_classification.dart.
 * @param {string|null|undefined} scheduledAt
 * @param {Date} [now]
 */
export function sessionIsToday(scheduledAt, now = new Date()) {
  if (!scheduledAt) {
    return false;
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function countTodaysSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return 0;
  }

  return sessions.filter((session) => sessionIsToday(
    readString(session, ["scheduled_at", "scheduledAt"]),
  )).length;
}

function countSpecialistTreatmentPlans(treatmentPlans, specialistUserId) {
  if (!Array.isArray(treatmentPlans)) {
    return 0;
  }

  return treatmentPlans.filter((plan) => {
    const specialistId = readString(plan, ["specialist_id", "specialistId"]);
    return specialistId === specialistUserId;
  }).length;
}

/**
 * @param {string} fullName
 */
export function getSpecialistFirstName(fullName) {
  const trimmed = String(fullName || "").trim();
  if (!trimmed) {
    return "Specialist";
  }

  return trimmed.split(/\s+/)[0] || "Specialist";
}

/**
 * @param {{
 *   specialistUserId: string,
 *   activeCases: Array<Record<string, unknown>>,
 *   pendingReviews: Array<Record<string, unknown>>,
 *   sessions: Array<Record<string, unknown>>,
 *   treatmentPlans: Array<Record<string, unknown>>,
 * }} input
 */
export function buildSpecialistOverviewKpis({
  specialistUserId,
  activeCases,
  pendingReviews,
  sessions,
  treatmentPlans,
}) {
  return {
    activeCases: Array.isArray(activeCases) ? activeCases.length : 0,
    pendingReviews: Array.isArray(pendingReviews) ? pendingReviews.length : 0,
    todaysSessions: countTodaysSessions(sessions),
    treatmentPlans: countSpecialistTreatmentPlans(treatmentPlans, specialistUserId),
  };
}
