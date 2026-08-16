import {
  formatParentDate,
  formatParentTime,
  formatParentWeekdayDate,
  translateKey,
} from "./parentLocalizationCore.js";

export const SESSION_HUB_AREA_VALUES = ["sessions", "requests"];
export const SESSION_LIST_TAB_VALUES = ["upcoming", "history"];
export const SESSION_STATUS_FILTER_VALUES = ["all", "scheduled", "completed", "cancelled", "no_show"];
export const SESSION_REQUEST_REASON_VALUES = [
  "regular_follow_up",
  "replacement_cancelled",
  "replacement_missed",
  "additional_session",
  "consultation",
  "other",
];
export const PREFERRED_TIME_PERIOD_VALUES = ["morning", "afternoon", "evening", "flexible"];
export const SESSION_STATUS_VALUES = ["scheduled", "completed", "cancelled", "no_show"];
export const SESSION_REQUEST_STATUS_VALUES = ["pending", "approved", "rejected"];

export const SESSION_STATUS_TONES = {
  scheduled: "blue",
  completed: "success",
  cancelled: "gray",
  no_show: "danger",
};

export const SESSION_REQUEST_STATUS_TONES = {
  pending: "blue",
  approved: "success",
  rejected: "danger",
};

const SESSION_STATUS_KEY_BY_VALUE = {
  scheduled: "parent.sessions.status.scheduled",
  completed: "parent.sessions.status.completed",
  cancelled: "parent.sessions.status.cancelled",
  no_show: "parent.sessions.status.noShow",
};

const SESSION_REQUEST_STATUS_KEY_BY_VALUE = {
  pending: "parent.sessions.requestStatus.pending",
  approved: "parent.sessions.requestStatus.approved",
  rejected: "parent.sessions.requestStatus.rejected",
};

const SESSION_REQUEST_REASON_KEY_BY_VALUE = {
  regular_follow_up: "parent.sessions.reason.regularFollowUp",
  replacement_cancelled: "parent.sessions.reason.replacementCancelled",
  replacement_missed: "parent.sessions.reason.replacementMissed",
  additional_session: "parent.sessions.reason.additionalSession",
  consultation: "parent.sessions.reason.consultation",
  other: "parent.sessions.reason.other",
};

const PREFERRED_TIME_PERIOD_KEY_BY_VALUE = {
  morning: "parent.sessions.timePeriod.morning",
  afternoon: "parent.sessions.timePeriod.afternoon",
  evening: "parent.sessions.timePeriod.evening",
  flexible: "parent.sessions.timePeriod.flexible",
};

const EN_SESSION_STATUS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const EN_REQUEST_STATUS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const EN_REASON = {
  regular_follow_up: "Regular Follow-up",
  replacement_cancelled: "Replacement (Cancelled Session)",
  replacement_missed: "Replacement (Missed Session)",
  additional_session: "Additional Session",
  consultation: "Consultation",
  other: "Other",
};

const EN_TIME_PERIOD = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  flexible: "Flexible",
};

export function buildSessionHubAreaOptions(t) {
  return [
    { id: "sessions", label: translateKey(t, "parent.sessions.hub.sessions", "Sessions") },
    { id: "requests", label: translateKey(t, "parent.sessions.hub.requests", "Session Requests") },
  ];
}

export function buildSessionListTabOptions(t) {
  return [
    { id: "upcoming", label: translateKey(t, "parent.sessions.tabs.upcoming", "Upcoming") },
    { id: "history", label: translateKey(t, "parent.sessions.tabs.history", "History") },
  ];
}

export function buildSessionStatusFilterOptions(t) {
  return [
    { id: "all", label: translateKey(t, "parent.common.filters.allStatuses", "All statuses") },
    ...SESSION_STATUS_VALUES.map((id) => ({
      id,
      label: getSessionStatusLabel(id, t),
    })),
  ];
}

export function buildSessionRequestReasonOptions(t) {
  return SESSION_REQUEST_REASON_VALUES.map((id) => ({
    id,
    label: getSessionRequestReasonLabel(id, t),
  }));
}

export function buildPreferredTimePeriodOptions(t) {
  return PREFERRED_TIME_PERIOD_VALUES.map((id) => ({
    id,
    label: getPreferredTimePeriodLabel(id, t),
  }));
}

export function getSessionStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase().replace(/-/g, "_") : "";
  const key = SESSION_STATUS_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_SESSION_STATUS[normalized]);
  }
  return normalized.replace(/_/g, " ") || translateKey(t, "parent.sessions.status.scheduled", "Scheduled");
}

export function getSessionRequestStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = SESSION_REQUEST_STATUS_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_REQUEST_STATUS[normalized]);
  }
  return normalized.replace(/_/g, " ") || translateKey(t, "parent.sessions.requestStatus.pending", "Pending");
}

export function getSessionRequestReasonLabel(reason, t = null) {
  const normalized = typeof reason === "string" ? reason.trim() : "";
  if (!normalized) {
    return null;
  }
  const key = SESSION_REQUEST_REASON_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_REASON[normalized]);
  }
  return normalized.replace(/_/g, " ");
}

export function getPreferredTimePeriodLabel(period, t = null) {
  const normalized = typeof period === "string" ? period.trim() : "";
  if (!normalized) {
    return null;
  }
  const key = PREFERRED_TIME_PERIOD_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_TIME_PERIOD[normalized]);
  }
  return normalized.replace(/_/g, " ");
}

export function getSessionStatusMeta(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase().replace(/-/g, "_") : "";
  if (!normalized) {
    return null;
  }

  const tone = SESSION_STATUS_TONES[normalized] || "gray";
  const label = SESSION_STATUS_KEY_BY_VALUE[normalized]
    ? getSessionStatusLabel(normalized, t)
    : normalized.replace(/_/g, " ");

  return { label, tone };
}

export function getSessionRequestStatusMeta(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  if (!normalized) {
    return null;
  }

  const tone = SESSION_REQUEST_STATUS_TONES[normalized] || "gray";
  const label = SESSION_REQUEST_STATUS_KEY_BY_VALUE[normalized]
    ? getSessionRequestStatusLabel(normalized, t)
    : normalized.replace(/_/g, " ");

  return { label, tone };
}

export function formatSessionDisplayDate(value, locale = "en", t = null) {
  return formatParentWeekdayDate(value, locale, t);
}

export function formatSessionDisplayTime(value, locale = "en") {
  return formatParentTime(value, locale);
}

export function formatSessionRequestCreatedDate(value, locale = "en", t = null) {
  return formatParentDate(value, locale, t);
}

export function getSessionEmptyMessages(t) {
  return {
    upcoming: translateKey(t, "parent.sessions.empty.upcoming", "No upcoming sessions."),
    history: translateKey(t, "parent.sessions.empty.history", "No session history."),
    filtered: translateKey(t, "parent.sessions.empty.filtered", "No sessions match your filters."),
    requests: translateKey(t, "parent.sessions.empty.requests", "No session requests yet."),
  };
}

export function getSessionRequestValidationMessages(t) {
  return {
    patientId: translateKey(t, "parent.sessions.validation.selectChild", "Select a child."),
    specialistId: translateKey(t, "parent.sessions.validation.selectSpecialist", "Select a specialist."),
    reason: translateKey(t, "parent.sessions.validation.selectReason", "Select a reason."),
    reasonOtherText: translateKey(t, "parent.sessions.validation.otherReason", "Describe the reason when selecting Other."),
    preferredDate: translateKey(t, "parent.sessions.validation.preferredDateRequired", "Preferred date is required."),
    preferredDateInvalid: translateKey(t, "parent.sessions.validation.preferredDateInvalid", "Use a valid date."),
    preferredDatePast: translateKey(t, "parent.sessions.validation.preferredDatePast", "Preferred date cannot be in the past."),
    preferredTimePeriod: translateKey(t, "parent.sessions.validation.selectTimePeriod", "Select a preferred time period."),
  };
}

export function getMeetingLinkUnavailableError(t) {
  return translateKey(t, "parent.sessions.errors.meetingLinkUnavailable", "Meeting link is unavailable.");
}

export function getMeetingLinkCopyError(t) {
  return translateKey(t, "parent.sessions.errors.meetingLinkCopyFailed", "Unable to copy the meeting link.");
}

/** @deprecated Use buildSessionHubAreaOptions(t) */
export const SESSION_HUB_AREAS = buildSessionHubAreaOptions(null);

/** @deprecated Use buildSessionListTabOptions(t) */
export const SESSION_LIST_TABS = buildSessionListTabOptions(null);

/** @deprecated Use buildSessionStatusFilterOptions(t) */
export const SESSION_STATUS_FILTER_OPTIONS = buildSessionStatusFilterOptions(null);

/** @deprecated Use buildSessionRequestReasonOptions(t) */
export const SESSION_REQUEST_REASONS = buildSessionRequestReasonOptions(null);

/** @deprecated Use buildPreferredTimePeriodOptions(t) */
export const PREFERRED_TIME_PERIODS = buildPreferredTimePeriodOptions(null);

/** @deprecated Use getSessionStatusMeta(status, t) */
export const SESSION_STATUS_META = Object.fromEntries(
  SESSION_STATUS_VALUES.map((value) => [value, getSessionStatusMeta(value, null)]),
);

/** @deprecated Use getSessionRequestStatusMeta(status, t) */
export const SESSION_REQUEST_STATUS_META = Object.fromEntries(
  SESSION_REQUEST_STATUS_VALUES.map((value) => [value, getSessionRequestStatusMeta(value, null)]),
);

/** @deprecated Use getSessionEmptyMessages(t) */
export const SESSION_EMPTY_MESSAGES = getSessionEmptyMessages(null);
