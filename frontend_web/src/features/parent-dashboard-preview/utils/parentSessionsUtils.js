import {
  extractMeetingUrl,
  isUpcomingSession,
  normalizeSessionStatus,
  readNumber,
  readString,
} from "./parentDashboardMappers";

export const SESSION_HUB_AREAS = [
  { id: "sessions", label: "Sessions" },
  { id: "requests", label: "Session Requests" },
];

export const SESSION_LIST_TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "history", label: "History" },
];

export const SESSION_STATUS_FILTER_OPTIONS = [
  { id: "all", label: "All statuses" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "no_show", label: "No Show" },
];

export const SESSION_REQUEST_REASONS = [
  { id: "regular_follow_up", label: "Regular Follow-up" },
  { id: "replacement_cancelled", label: "Replacement (Cancelled Session)" },
  { id: "replacement_missed", label: "Replacement (Missed Session)" },
  { id: "additional_session", label: "Additional Session" },
  { id: "consultation", label: "Consultation" },
  { id: "other", label: "Other" },
];

export const PREFERRED_TIME_PERIODS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "flexible", label: "Flexible" },
];

export const SESSION_STATUS_META = {
  scheduled: { label: "Scheduled", tone: "blue" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "gray" },
  no_show: { label: "No Show", tone: "danger" },
};

export const SESSION_REQUEST_STATUS_META = {
  pending: { label: "Pending", tone: "blue" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const SESSION_EMPTY_MESSAGES = {
  upcoming: "No upcoming sessions.",
  history: "No session history.",
  filtered: "No sessions match your filters.",
  requests: "No session requests yet.",
};

const REASON_LABELS = Object.fromEntries(
  SESSION_REQUEST_REASONS.map((option) => [option.id, option.label]),
);

const PERIOD_LABELS = Object.fromEntries(
  PREFERRED_TIME_PERIODS.map((option) => [option.id, option.label]),
);

/**
 * @param {string|null|undefined} reason
 */
export function getSessionRequestReasonLabel(reason) {
  const normalized = reason?.trim();
  if (!normalized) {
    return null;
  }

  return REASON_LABELS[normalized] || normalized.replace(/_/g, " ");
}

/**
 * @param {string|null|undefined} period
 */
export function getPreferredTimePeriodLabel(period) {
  const normalized = period?.trim();
  if (!normalized) {
    return null;
  }

  return PERIOD_LABELS[normalized] || normalized.replace(/_/g, " ");
}

/**
 * @param {string|null|undefined} status
 */
export function getSessionStatusMeta(status) {
  const normalized = normalizeSessionStatus(status);
  if (!normalized) {
    return null;
  }

  return SESSION_STATUS_META[normalized] || {
    label: normalized.replace(/_/g, " "),
    tone: "gray",
  };
}

/**
 * @param {string|null|undefined} status
 */
export function getSessionRequestStatusMeta(status) {
  const normalized = status?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return SESSION_REQUEST_STATUS_META[normalized] || {
    label: normalized.replace(/_/g, " "),
    tone: "gray",
  };
}

function formatDisplayDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getScheduledTimestamp(sessionRow) {
  const scheduledAt = sessionRow.scheduled_at ?? sessionRow.scheduledAt;
  if (!scheduledAt) {
    return null;
  }

  const time = new Date(scheduledAt).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Mirrors Flutter sessionIsPast classification.
 * @param {Record<string, unknown>} session
 * @param {number} [now]
 */
export function isPastSession(session, now = Date.now()) {
  if (isUpcomingSession(session, now)) {
    return false;
  }

  const normalized = normalizeSessionStatus(readString(session, ["status"]));
  if (normalized === "completed" || normalized === "cancelled" || normalized === "no_show") {
    return true;
  }

  const timestamp = getScheduledTimestamp(session);
  return timestamp != null && timestamp < now;
}

/**
 * @param {Record<string, unknown>} sessionRow
 */
export function mapSessionRowToHubItem(sessionRow) {
  const id = readString(sessionRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const scheduledAtRaw = sessionRow.scheduled_at ?? sessionRow.scheduledAt;
  const scheduledAtMs = getScheduledTimestamp(sessionRow);
  const durationMinutes = readNumber(sessionRow, ["duration_minutes", "durationMinutes"]);
  const locationOrLink = readString(sessionRow, ["location_or_link", "locationOrLink"]);
  const meetingUrl = extractMeetingUrl(locationOrLink);
  const status = readString(sessionRow, ["status"]);
  const endTime = scheduledAtMs != null && durationMinutes != null
    ? formatDisplayTime(new Date(scheduledAtMs + durationMinutes * 60000).toISOString())
    : null;

  return {
    id,
    patientId: readString(sessionRow, ["patient_id", "patientId"]),
    childName: readString(sessionRow, ["patient_name", "patientName"]),
    specialistName: readString(sessionRow, ["specialist_name", "specialistName"]),
    sessionDate: formatDisplayDate(scheduledAtRaw),
    startTime: formatDisplayTime(scheduledAtRaw),
    endTime,
    durationMinutes,
    status,
    statusMeta: getSessionStatusMeta(status),
    locationOrLink,
    meetingUrl,
    isOnline: meetingUrl != null,
    physicalLocation: meetingUrl ? null : locationOrLink,
    scheduledAtMs,
    isUpcoming: isUpcomingSession(sessionRow),
    isPast: isPastSession(sessionRow),
  };
}

/**
 * @param {Array<Record<string, unknown>>} sessions
 */
export function mapSessionRowsToHubItems(sessions) {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions
    .map((row) => mapSessionRowToHubItem(row))
    .filter(Boolean);
}

/**
 * @param {Record<string, unknown>} requestRow
 * @param {Record<string, unknown>|null} [approvedSessionRow]
 */
export function mapSessionRequestRowToHubItem(requestRow, approvedSessionRow = null) {
  const id = readString(requestRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const reason = readString(requestRow, ["reason"]);
  const approvedSession = approvedSessionRow
    ? mapSessionRowToHubItem(approvedSessionRow)
    : null;

  return {
    id,
    patientId: readString(requestRow, ["patient_id", "patientId"]),
    childName: readString(requestRow, ["patient_name", "patientName"]),
    specialistId: readString(requestRow, ["specialist_id", "specialistId"]),
    specialistName: readString(requestRow, ["specialist_name", "specialistName"]),
    reason,
    reasonLabel: getSessionRequestReasonLabel(reason),
    reasonOtherText: readString(requestRow, ["reason_other_text", "reasonOtherText"]),
    preferredDate: readString(requestRow, ["preferred_date", "preferredDate"]),
    preferredTimePeriod: readString(requestRow, ["preferred_time_period", "preferredTimePeriod"]),
    preferredTimePeriodLabel: getPreferredTimePeriodLabel(
      readString(requestRow, ["preferred_time_period", "preferredTimePeriod"]),
    ),
    notes: readString(requestRow, ["notes"]),
    status: readString(requestRow, ["status"]),
    statusMeta: getSessionRequestStatusMeta(readString(requestRow, ["status"])),
    rejectionReason: readString(requestRow, ["rejection_reason", "rejectionReason"]),
    approvedSessionId: readString(requestRow, ["approved_session_id", "approvedSessionId"]),
    createdAt: formatDisplayDate(
      requestRow.created_at ?? requestRow.createdAt,
    ),
    approvedSession,
  };
}

/**
 * @param {Array<Record<string, unknown>>} sessions
 * @param {{ childId?: string, status?: string, search?: string, listTab?: string }} filters
 */
export function filterSessionHubItems(sessions, filters) {
  const childId = filters.childId || "all";
  const status = filters.status || "all";
  const search = filters.search?.trim().toLowerCase() || "";
  const listTab = filters.listTab || "upcoming";

  return sessions.filter((session) => {
    if (listTab === "upcoming" && !session.isUpcoming) {
      return false;
    }

    if (listTab === "history" && !session.isPast) {
      return false;
    }

    if (childId !== "all" && session.patientId !== childId) {
      return false;
    }

    if (status !== "all" && normalizeSessionStatus(session.status) !== status) {
      return false;
    }

    if (search) {
      const haystack = [
        session.childName,
        session.specialistName,
        session.physicalLocation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * @param {Array<Record<string, unknown>>} sessions
 * @param {string} listTab
 */
export function sortSessionHubItems(sessions, listTab) {
  const copy = [...sessions];

  if (listTab === "history") {
    return copy.sort((left, right) => {
      const leftMs = left.scheduledAtMs ?? 0;
      const rightMs = right.scheduledAtMs ?? 0;
      return rightMs - leftMs;
    });
  }

  return copy.sort((left, right) => {
    const leftMs = left.scheduledAtMs ?? Number.MAX_SAFE_INTEGER;
    const rightMs = right.scheduledAtMs ?? Number.MAX_SAFE_INTEGER;
    return leftMs - rightMs;
  });
}

/**
 * Returns today's date as YYYY-MM-DD in local time for date inputs.
 */
export function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @param {Record<string, unknown>} form
 */
export function validateSessionRequestForm(form) {
  const errors = {};

  if (!form.patientId) {
    errors.patientId = "Select a child.";
  }

  if (!form.specialistId) {
    errors.specialistId = "Select a specialist.";
  }

  if (!form.reason) {
    errors.reason = "Select a reason.";
  }

  if (form.reason === "other" && !String(form.reasonOtherText || "").trim()) {
    errors.reasonOtherText = "Describe the reason when selecting Other.";
  }

  if (!form.preferredDate) {
    errors.preferredDate = "Preferred date is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.preferredDate)) {
    errors.preferredDate = "Use a valid date.";
  } else if (form.preferredDate < getTodayDateInputValue()) {
    errors.preferredDate = "Preferred date cannot be in the past.";
  }

  if (!form.preferredTimePeriod) {
    errors.preferredTimePeriod = "Select a preferred time period.";
  }

  return errors;
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapSpecialistOption(row) {
  const specialistId = readString(row, ["specialist_id", "specialistId"]);
  const fullName = readString(row, ["full_name", "fullName", "name"]);
  return specialistId ? { id: specialistId, label: fullName || specialistId } : null;
}

/**
 * Copies a meeting URL with graceful fallback messaging.
 * @param {string} url
 */
export async function copyMeetingUrl(url) {
  if (!url) {
    throw new Error("Meeting link is unavailable.");
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Unable to copy the meeting link.");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Opens a meeting URL in a new tab safely.
 * @param {string} url
 */
export function openMeetingUrl(url) {
  if (!url) {
    throw new Error("Meeting link is unavailable.");
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
