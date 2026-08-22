import { formatAppDate } from "../../../i18n/formatters.js";
import { getAppTimezone } from "../../../utils/appTimezone.js";
import {
  formatSpecialistDurationMinutes,
  formatSpecialistScheduleTime,
  getDashboardWeekdayLabels,
  getSpecialistSessionStatusLabel,
  normalizeSpecialistLocale,
  resolveSpecialistMapperContext,
} from "./specialistDashboardLocalization.js";
import { SCHEDULE_SESSION_VALIDATION_KEYS } from "./specialistScheduleSessionMappers.js";

export { SCHEDULE_SESSION_VALIDATION_KEYS };

const SESSION_LIST_FILTER_IDS = ["all", "today", "upcoming", "past"];
const SESSION_REQUEST_FILTER_IDS = ["all", "pending", "approved", "rejected"];

function normalizeSessionRequestStatus(status) {
  return String(status || "pending").trim().toLowerCase();
}

const SESSION_LIST_FILTER_KEY = {
  all: "specialist.sessions.filters.all",
  today: "specialist.sessions.filters.today",
  upcoming: "specialist.sessions.filters.upcoming",
  past: "specialist.sessions.filters.past",
};

const SESSION_LIST_FILTER_FALLBACK = {
  all: "All",
  today: "Today",
  upcoming: "Upcoming",
  past: "Past",
};

const SESSION_REQUEST_FILTER_KEY = {
  all: "specialist.sessions.filters.all",
  pending: "specialist.sessions.filters.pending",
  approved: "specialist.sessions.filters.approved",
  rejected: "specialist.sessions.filters.rejected",
};

const SESSION_REQUEST_FILTER_FALLBACK = {
  all: "All",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const SESSION_REQUEST_REASON_KEY = {
  regular_follow_up: "specialist.sessions.request.reason.regularFollowUp",
  replacement_cancelled: "specialist.sessions.request.reason.replacementCancelled",
  replacement_missed: "specialist.sessions.request.reason.replacementMissed",
  additional_session: "specialist.sessions.request.reason.additionalSession",
  consultation: "specialist.sessions.request.reason.consultation",
  other: "specialist.sessions.request.reason.other",
};

const SESSION_REQUEST_REASON_FALLBACK = {
  regular_follow_up: "Regular Follow-up",
  replacement_cancelled: "Replacement for Cancelled Session",
  replacement_missed: "Replacement for Missed Session",
  additional_session: "Additional Session",
  consultation: "Consultation",
  other: "Other",
};

const PREFERRED_TIME_KEY = {
  morning: "specialist.sessions.request.timePeriod.morning",
  afternoon: "specialist.sessions.request.timePeriod.afternoon",
  evening: "specialist.sessions.request.timePeriod.evening",
  flexible: "specialist.sessions.request.timePeriod.flexible",
};

const PREFERRED_TIME_FALLBACK = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  flexible: "Flexible",
};

const SESSION_REQUEST_STATUS_TONE = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

const SCHEDULE_VALIDATION_KEY_MAP = {
  [SCHEDULE_SESSION_VALIDATION_KEYS.TITLE_REQUIRED]: "specialist.sessions.validation.titleRequired",
  [SCHEDULE_SESSION_VALIDATION_KEYS.PATIENT_REQUIRED]: "specialist.sessions.validation.patientRequired",
  [SCHEDULE_SESSION_VALIDATION_KEYS.DURATION_RANGE]: "specialist.sessions.validation.durationRange",
  [SCHEDULE_SESSION_VALIDATION_KEYS.FUTURE_DATETIME_REQUIRED]:
    "specialist.sessions.validation.futureDateTimeRequired",
};

const EN_SCHEDULE_VALIDATION_MESSAGE = {
  [SCHEDULE_SESSION_VALIDATION_KEYS.TITLE_REQUIRED]: "Enter a session type or title.",
  [SCHEDULE_SESSION_VALIDATION_KEYS.PATIENT_REQUIRED]: "Select an assigned patient.",
  [SCHEDULE_SESSION_VALIDATION_KEYS.DURATION_RANGE]: "Duration must be between 1 and 480 minutes.",
  [SCHEDULE_SESSION_VALIDATION_KEYS.FUTURE_DATETIME_REQUIRED]:
    "Scheduled date and time must be in the future.",
};

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

export function getSessionListFilterLabel(filterId, t = null) {
  const key = SESSION_LIST_FILTER_KEY[filterId];
  return translateKey(t, key, SESSION_LIST_FILTER_FALLBACK[filterId] ?? filterId);
}

export function getSessionRequestFilterLabel(filterId, t = null) {
  const key = SESSION_REQUEST_FILTER_KEY[filterId];
  return translateKey(t, key, SESSION_REQUEST_FILTER_FALLBACK[filterId] ?? filterId);
}

export function buildSessionListFilterOptions(t = null) {
  return SESSION_LIST_FILTER_IDS.map((id) => ({
    id,
    label: getSessionListFilterLabel(id, t),
  }));
}

export function buildSessionRequestFilterOptions(t = null) {
  return SESSION_REQUEST_FILTER_IDS.map((id) => ({
    id,
    label: getSessionRequestFilterLabel(id, t),
  }));
}

export function buildSessionSectionTabs(t = null) {
  return [
    {
      id: "sessions",
      label: translateKey(t, "specialist.sessions.tabs.sessions", "Sessions"),
    },
    {
      id: "requests",
      label: translateKey(t, "specialist.sessions.tabs.requests", "Requests"),
    },
  ];
}

export function buildSessionViewTabs(t = null) {
  return [
    {
      id: "list",
      label: translateKey(t, "specialist.sessions.view.list", "List"),
    },
    {
      id: "calendar",
      label: translateKey(t, "specialist.sessions.view.calendar", "Calendar"),
    },
  ];
}

export function getSessionDisplayStatusMeta(status, t = null) {
  const normalized = String(status || "scheduled").trim().toLowerCase();
  const tone = normalized === "completed"
    ? "success"
    : normalized === "cancelled" || normalized === "no_show"
      ? "danger"
      : "success";

  return {
    id: normalized || "scheduled",
    label: getSpecialistSessionStatusLabel(status, t),
    tone,
  };
}

export function getSessionRequestStatusMeta(status, t = null) {
  const normalized = normalizeSessionRequestStatus(status);
  const labelKey = {
    approved: "specialist.sessions.filters.approved",
    rejected: "specialist.sessions.filters.rejected",
    pending: "specialist.sessions.filters.pending",
  }[normalized];

  return {
    id: normalized,
    label: translateKey(t, labelKey, SESSION_REQUEST_FILTER_FALLBACK[normalized] ?? normalized),
    tone: SESSION_REQUEST_STATUS_TONE[normalized] ?? "warning",
  };
}

export function getSessionRequestReasonLabel(request, t = null) {
  if (request?.reason === "other" && request.reasonOtherText) {
    return request.reasonOtherText;
  }

  const reason = request?.reason;
  if (reason && SESSION_REQUEST_REASON_KEY[reason]) {
    return translateKey(
      t,
      SESSION_REQUEST_REASON_KEY[reason],
      SESSION_REQUEST_REASON_FALLBACK[reason],
    );
  }

  return translateKey(t, "specialist.sessions.request.reason.default", "Session request");
}

export function getPreferredTimeLabel(value, t = null) {
  const normalized = (value || "").trim().toLowerCase();
  if (PREFERRED_TIME_KEY[normalized]) {
    return translateKey(t, PREFERRED_TIME_KEY[normalized], PREFERRED_TIME_FALLBACK[normalized]);
  }
  return translateKey(t, "parent.common.emptyDisplay", "—");
}

export function formatSessionDisplayDate(date, locale = "en", t = null) {
  if (!date) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return new Intl.DateTimeFormat(normalizeSpecialistLocale(locale), {
    timeZone: getAppTimezone(),
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatSessionCalendarMonthYear(date, locale = "en") {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(normalizeSpecialistLocale(locale), {
    timeZone: getAppTimezone(),
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatSessionCalendarDayHeading(date, locale = "en", t = null) {
  if (!date) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return new Intl.DateTimeFormat(normalizeSpecialistLocale(locale), {
    timeZone: getAppTimezone(),
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function formatSessionPreferredDateLabel(date, locale = "en", t = null) {
  if (!date) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return new Intl.DateTimeFormat(normalizeSpecialistLocale(locale), {
    timeZone: getAppTimezone(),
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatSessionCalendarLocationLabel(session, t = null) {
  if (session?.meetingUrl) {
    return translateKey(t, "specialist.sessions.location.online", "Online");
  }
  if (session?.physicalLocation) {
    return session.physicalLocation;
  }
  return translateKey(t, "specialist.sessions.location.inPerson", "In Person");
}

export function formatSessionDurationLabel(minutes, t = null) {
  if (minutes == null || !Number.isFinite(minutes)) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }
  return formatSpecialistDurationMinutes(minutes, t)
    ?? translateKey(
      t,
      "specialist.sessions.calendar.durationMinutes",
      "{minutes} min",
      { minutes },
    );
}

export function formatApprovedSessionScheduledLabel(scheduledAt, locale = "en", t = null) {
  if (!scheduledAt) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const date = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const datePart = formatSessionDisplayDate(date, locale, t);
  const timePart = formatSpecialistScheduleTime(date, locale)
    ?? translateKey(t, "parent.common.emptyDisplay", "—");

  return translateKey(
    t,
    "specialist.sessions.request.scheduledAt",
    "Scheduled: {dateTime}",
    { dateTime: `${datePart} • ${timePart}` },
  );
}

export function getSessionListEmptyMessage({ hasSessions, hasVisible }, t = null) {
  if (hasVisible) {
    return null;
  }
  if (!hasSessions) {
    return translateKey(t, "specialist.sessions.empty.noSessions", "No sessions found.");
  }
  return translateKey(
    t,
    "specialist.sessions.empty.noMatch",
    "No sessions match your search or filter.",
  );
}

export function getSessionRequestEmptyMessage(filterId, { totalCount = 0, visibleCount = 0 }, t = null) {
  if (visibleCount > 0) {
    return null;
  }
  if (totalCount === 0) {
    return translateKey(t, "specialist.sessions.empty.noRequests", "No session requests yet.");
  }
  if (filterId === "pending") {
    return translateKey(
      t,
      "specialist.sessions.empty.noPendingRequests",
      "No pending session requests.",
    );
  }
  return translateKey(
    t,
    "specialist.sessions.empty.noRequestsMatchFilter",
    "No session requests match this filter.",
  );
}

export function getSessionCalendarWeekdayLabels(locale = "en") {
  return getDashboardWeekdayLabels(locale);
}

export function applySessionListItemLocalization(session, context = {}) {
  if (!session) {
    return session;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  return {
    ...session,
    dateLabel: formatSessionDisplayDate(session.scheduledAt, locale, t),
    timeLabel: formatSpecialistScheduleTime(session.scheduledAt, locale) || session.timeLabel,
    displayStatus: getSessionDisplayStatusMeta(session.status, t),
  };
}

export function applySessionRequestLocalization(request, context = {}) {
  if (!request) {
    return request;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);
  const approvedSession = request.approvedSession
    ? {
      ...request.approvedSession,
      scheduledAtLabel: formatApprovedSessionScheduledLabel(
        request.approvedSession.scheduledAt,
        locale,
        t,
      ),
    }
    : null;

  return {
    ...request,
    reasonLabel: getSessionRequestReasonLabel(request, t),
    preferredDateLabel: formatSessionPreferredDateLabel(request.preferredDate, locale, t),
    preferredTimeLabel: getPreferredTimeLabel(request.preferredTimePeriod, t),
    createdAtLabel: formatSessionDisplayDate(request.createdAt, locale, t),
    statusMeta: getSessionRequestStatusMeta(request.status, t),
    approvedSession,
  };
}

export function getScheduleValidationMessage(key, t = null) {
  const messageKey = SCHEDULE_VALIDATION_KEY_MAP[key];
  return translateKey(t, messageKey, EN_SCHEDULE_VALIDATION_MESSAGE[key] ?? key);
}

export function resolveScheduleSessionFieldErrors(errors, t = null) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, key]) => [
      field,
      typeof key === "string" ? getScheduleValidationMessage(key, t) : key,
    ]),
  );
}

export function mapScheduleValidationErrorsToKeys(errors) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => {
      const match = Object.entries(EN_SCHEDULE_VALIDATION_MESSAGE).find(([, value]) => value === message);
      return [field, match?.[0] ?? message];
    }),
  );
}

export function getCalendarPreviousMonthLabel(t = null) {
  return translateKey(t, "specialist.sessions.calendar.previousMonth", "Previous month");
}

export function getCalendarNextMonthLabel(t = null) {
  return translateKey(t, "specialist.sessions.calendar.nextMonth", "Next month");
}

export function getCalendarDayEmptyMessage(t = null) {
  return translateKey(
    t,
    "specialist.sessions.empty.noSessionsOnDate",
    "No sessions scheduled for this date.",
  );
}

export function formatCalendarDaySessionMeta(session, t = null, locale = "en") {
  const time = formatSpecialistScheduleTime(session.scheduledAt, locale) || session.timeLabel;
  const duration = formatSessionDurationLabel(session.durationMinutes, t);
  const location = formatSessionCalendarLocationLabel(session, t);
  return `${time} • ${duration} • ${location}`;
}
