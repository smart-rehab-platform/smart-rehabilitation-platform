import {
  extractMeetingUrl,
  isUpcomingSession,
  normalizeSessionStatus,
  readNumber,
  readString,
} from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  buildPreferredTimePeriodOptions,
  buildSessionHubAreaOptions,
  buildSessionListTabOptions,
  buildSessionRequestReasonOptions,
  buildSessionStatusFilterOptions,
  formatSessionDisplayDate,
  formatSessionDisplayTime,
  formatSessionRequestCreatedDate,
  formatSessionRequestPreferredDate,
  getMeetingLinkCopyError,
  getMeetingLinkUnavailableError,
  getPreferredTimePeriodLabel,
  getSessionEmptyMessages,
  getSessionRequestReasonLabel,
  getSessionRequestStatusMeta,
  getSessionRequestValidationMessages,
  getSessionStatusMeta,
  PREFERRED_TIME_PERIODS,
  SESSION_EMPTY_MESSAGES,
  SESSION_HUB_AREAS,
  SESSION_LIST_TABS,
  SESSION_REQUEST_REASONS,
  SESSION_REQUEST_STATUS_META,
  SESSION_STATUS_FILTER_OPTIONS,
  SESSION_STATUS_META,
} from "./parentSessionsLocalization";

export {
  buildPreferredTimePeriodOptions,
  buildSessionHubAreaOptions,
  buildSessionListTabOptions,
  buildSessionRequestReasonOptions,
  buildSessionStatusFilterOptions,
  getMeetingLinkCopyError,
  getMeetingLinkUnavailableError,
  getPreferredTimePeriodLabel,
  getSessionEmptyMessages,
  getSessionRequestReasonLabel,
  getSessionRequestStatusMeta,
  getSessionStatusMeta,
  PREFERRED_TIME_PERIODS,
  SESSION_EMPTY_MESSAGES,
  SESSION_HUB_AREAS,
  SESSION_LIST_TABS,
  SESSION_REQUEST_REASONS,
  SESSION_REQUEST_STATUS_META,
  SESSION_STATUS_FILTER_OPTIONS,
  SESSION_STATUS_META,
};

/**
 * @param {string|null|undefined} reason
 */
export function getSessionRequestReasonLabelLocalized(reason, t = null) {
  return getSessionRequestReasonLabel(reason, t);
}

/**
 * @param {string|null|undefined} period
 */
export function getPreferredTimePeriodLabelLocalized(period, t = null) {
  return getPreferredTimePeriodLabel(period, t);
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
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function mapSessionRowToHubItem(sessionRow, options = {}) {
  const { t, locale } = resolveMapperContext(options);
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
    ? formatSessionDisplayTime(new Date(scheduledAtMs + durationMinutes * 60000).toISOString(), locale)
    : null;

  return {
    id,
    patientId: readString(sessionRow, ["patient_id", "patientId"]),
    childName: readString(sessionRow, ["patient_name", "patientName"]),
    specialistName: readString(sessionRow, ["specialist_name", "specialistName"]),
    sessionDate: formatSessionDisplayDate(scheduledAtRaw, locale, t),
    startTime: formatSessionDisplayTime(scheduledAtRaw, locale),
    endTime,
    durationMinutes,
    status,
    statusMeta: getSessionStatusMeta(status, t),
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
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function mapSessionRowsToHubItems(sessions, options = {}) {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions
    .map((row) => mapSessionRowToHubItem(row, options))
    .filter(Boolean);
}

/**
 * @param {Record<string, unknown>} requestRow
 * @param {Record<string, unknown>|null} [approvedSessionRow]
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function mapSessionRequestRowToHubItem(requestRow, approvedSessionRow = null, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const id = readString(requestRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const reason = readString(requestRow, ["reason"]);
  const approvedSession = approvedSessionRow
    ? mapSessionRowToHubItem(approvedSessionRow, options)
    : null;

  return {
    id,
    patientId: readString(requestRow, ["patient_id", "patientId"]),
    childName: readString(requestRow, ["patient_name", "patientName"]),
    specialistId: readString(requestRow, ["specialist_id", "specialistId"]),
    specialistName: readString(requestRow, ["specialist_name", "specialistName"]),
    reason,
    reasonLabel: getSessionRequestReasonLabel(reason, t),
    reasonOtherText: readString(requestRow, ["reason_other_text", "reasonOtherText"]),
    preferredDate: formatSessionRequestPreferredDate(
      readString(requestRow, ["preferred_date", "preferredDate"]),
      locale,
      t,
    ),
    preferredTimePeriod: readString(requestRow, ["preferred_time_period", "preferredTimePeriod"]),
    preferredTimePeriodLabel: getPreferredTimePeriodLabel(
      readString(requestRow, ["preferred_time_period", "preferredTimePeriod"]),
      t,
    ),
    notes: readString(requestRow, ["notes"]),
    status: readString(requestRow, ["status"]),
    statusMeta: getSessionRequestStatusMeta(readString(requestRow, ["status"]), t),
    rejectionReason: readString(requestRow, ["rejection_reason", "rejectionReason"]),
    approvedSessionId: readString(requestRow, ["approved_session_id", "approvedSessionId"]),
    createdAt: formatSessionRequestCreatedDate(
      requestRow.created_at ?? requestRow.createdAt,
      locale,
      t,
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
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function validateSessionRequestForm(form, options = {}) {
  const { t } = resolveMapperContext(options);
  const messages = getSessionRequestValidationMessages(t);
  const errors = {};

  if (!form.patientId) {
    errors.patientId = messages.patientId;
  }

  if (!form.specialistId) {
    errors.specialistId = messages.specialistId;
  }

  if (!form.reason) {
    errors.reason = messages.reason;
  }

  if (form.reason === "other" && !String(form.reasonOtherText || "").trim()) {
    errors.reasonOtherText = messages.reasonOtherText;
  }

  if (!form.preferredDate) {
    errors.preferredDate = messages.preferredDate;
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.preferredDate)) {
    errors.preferredDate = messages.preferredDateInvalid;
  } else if (form.preferredDate < getTodayDateInputValue()) {
    errors.preferredDate = messages.preferredDatePast;
  }

  if (!form.preferredTimePeriod) {
    errors.preferredTimePeriod = messages.preferredTimePeriod;
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
 * @param {{ t?: Function, locale?: string }} [options]
 */
export async function copyMeetingUrl(url, options = {}) {
  const { t } = resolveMapperContext(options);

  if (!url) {
    throw new Error(getMeetingLinkUnavailableError(t));
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
      throw new Error(getMeetingLinkCopyError(t));
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Opens a meeting URL in a new tab safely.
 * @param {string} url
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function openMeetingUrl(url, options = {}) {
  const { t } = resolveMapperContext(options);

  if (!url) {
    throw new Error(getMeetingLinkUnavailableError(t));
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
