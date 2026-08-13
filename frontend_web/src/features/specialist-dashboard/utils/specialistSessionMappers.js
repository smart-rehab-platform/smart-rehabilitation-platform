import {
  isSameDay,
  mapSpecialistSessionRow,
  parseScheduledAt,
} from "./specialistScheduleUtils";

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

function readDateValue(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (value == null || value === "") {
      continue;
    }
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return null;
}

export const SESSION_LIST_FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export function normalizeSessionListFilterId(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return SESSION_LIST_FILTERS.some((filter) => filter.id === normalized)
    ? normalized
    : "all";
}

export const SESSION_REQUEST_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export function sessionIsUpcoming(status, scheduledAt, now = new Date()) {
  const normalized = (status || "").toLowerCase().trim();
  if (normalized !== "scheduled") {
    return false;
  }
  if (!scheduledAt) {
    return true;
  }
  return scheduledAt.getTime() >= now.getTime();
}

export function sessionIsPast(status, scheduledAt, now = new Date()) {
  if (sessionIsUpcoming(status, scheduledAt, now)) {
    return false;
  }
  const normalized = (status || "").toLowerCase().trim();
  if (normalized === "completed" || normalized === "cancelled" || normalized === "no_show") {
    return true;
  }
  return Boolean(scheduledAt && scheduledAt.getTime() < now.getTime());
}

export function sessionIsTodayDate(scheduledAt, now = new Date()) {
  return isSameDay(scheduledAt, now);
}

export function getSessionDisplayStatus(status) {
  const normalized = (status || "").toLowerCase().trim();
  if (normalized === "completed") {
    return { id: "completed", label: "Completed", tone: "success" };
  }
  if (normalized === "cancelled") {
    return { id: "cancelled", label: "Cancelled", tone: "danger" };
  }
  if (normalized === "no_show") {
    return { id: "no_show", label: "No Show", tone: "danger" };
  }
  return { id: "scheduled", label: "Scheduled", tone: "success" };
}

export function mapSpecialistSessionDetail(row) {
  const base = mapSpecialistSessionRow(row);
  if (!base.id) {
    return null;
  }

  const sessionType = readString(row, ["session_type", "sessionType", "type", "notes"])
    || "Therapy Session";
  const scheduledAt = base.scheduledAt;
  const status = base.status || "scheduled";

  return {
    ...base,
    sessionType,
    dateLabel: scheduledAt
      ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(scheduledAt)
      : "—",
    displayStatus: getSessionDisplayStatus(status),
    isToday: sessionIsTodayDate(scheduledAt),
    isUpcoming: sessionIsUpcoming(status, scheduledAt),
    isPast: sessionIsPast(status, scheduledAt),
  };
}

export function mapSpecialistSessionDetails(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map(mapSpecialistSessionDetail)
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = a.scheduledAt?.getTime() ?? 0;
      const bTime = b.scheduledAt?.getTime() ?? 0;
      return aTime - bTime;
    });
}

export function matchesSessionListFilter(session, filterId, now = new Date()) {
  if (filterId === "today") {
    return sessionIsTodayDate(session.scheduledAt, now);
  }
  if (filterId === "upcoming") {
    return sessionIsUpcoming(session.status, session.scheduledAt, now);
  }
  if (filterId === "past") {
    return sessionIsPast(session.status, session.scheduledAt, now);
  }
  return true;
}

export function filterVisibleSessions(sessions, { searchQuery = "", filterId = "all", now = new Date() } = {}) {
  const query = searchQuery.trim().toLowerCase();
  return sessions.filter((session) => {
    if (!matchesSessionListFilter(session, filterId, now)) {
      return false;
    }
    if (!query) {
      return true;
    }
    return session.patientName.toLowerCase().includes(query);
  });
}

export function getSessionsForDate(sessions, date) {
  return sessions
    .filter((session) => session.scheduledAt && isSameDay(session.scheduledAt, date))
    .sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0));
}

export function hasSessionsOnDate(sessions, date) {
  return getSessionsForDate(sessions, date).length > 0;
}

export function formatCalendarDayHeading(date) {
  if (!date) {
    return "—";
  }
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatCalendarLocationLabel(session) {
  if (session.meetingUrl) {
    return "Online";
  }
  if (session.physicalLocation) {
    return session.physicalLocation;
  }
  return "In person";
}

const PREFERRED_TIME_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  flexible: "Flexible",
};

export function mapPreferredTimeLabel(value) {
  const normalized = (value || "").toLowerCase().trim();
  return PREFERRED_TIME_LABELS[normalized] || "—";
}

export function sessionRequestReasonDisplayLabel(request) {
  if (request.reason === "other" && request.reasonOtherText) {
    return request.reasonOtherText;
  }

  const labels = {
    regular_follow_up: "Regular Follow-up",
    replacement_cancelled: "Replacement for Cancelled Session",
    replacement_missed: "Replacement for Missed Session",
    additional_session: "Additional Session",
    consultation: "Consultation",
    other: "Other",
  };

  if (request.reason && labels[request.reason]) {
    return labels[request.reason];
  }

  return "Session request";
}

export function normalizeSessionRequestStatus(status) {
  return String(status || "pending").trim().toLowerCase();
}

export function getSessionRequestStatusMeta(status) {
  const normalized = normalizeSessionRequestStatus(status);
  if (normalized === "approved") {
    return { id: "approved", label: "Approved", tone: "success" };
  }
  if (normalized === "rejected") {
    return { id: "rejected", label: "Rejected", tone: "danger" };
  }
  return { id: "pending", label: "Pending", tone: "warning" };
}

export function mapApprovedSessionSummary(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const scheduledAt = parseScheduledAt(row);
  const locationOrLink = readString(row, ["location_or_link", "locationOrLink"]);
  const meetingUrl = /^https?:\/\//i.test(locationOrLink || "") ? locationOrLink : null;

  return {
    scheduledAt,
    scheduledAtLabel: scheduledAt
      ? `${new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(scheduledAt)} • ${scheduledAt.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })}`
      : "—",
    durationMinutes: row.duration_minutes ?? row.durationMinutes ?? null,
    locationOrLink: locationOrLink || null,
    meetingUrl,
  };
}

export function mapSessionRequestItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const preferredDateRaw = readDateValue(row, ["preferred_date", "preferredDate"]);
  const preferredDate = preferredDateRaw ? new Date(preferredDateRaw) : null;
  const createdAtRaw = readDateValue(row, ["created_at", "createdAt"]);
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;
  const status = normalizeSessionRequestStatus(readString(row, ["status"]) || "pending");

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]),
    parentId: readString(row, ["parent_id", "parentId"]),
    specialistId: readString(row, ["specialist_id", "specialistId"]),
    patientName: readString(row, ["patient_name", "patientName"]) || "Patient",
    parentName: readString(row, ["parent_name", "parentName"]) || "Parent",
    reason: readString(row, ["reason"]) || null,
    reasonOtherText: readString(row, ["reason_other_text", "reasonOtherText"]) || null,
    reasonLabel: "",
    preferredDate,
    preferredDateLabel: preferredDate
      ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(preferredDate)
      : "—",
    preferredTimePeriod: readString(row, ["preferred_time_period", "preferredTimePeriod"]) || null,
    preferredTimeLabel: mapPreferredTimeLabel(
      readString(row, ["preferred_time_period", "preferredTimePeriod"]),
    ),
    notes: readString(row, ["notes"]) || null,
    status,
    statusMeta: getSessionRequestStatusMeta(status),
    rejectionReason: readString(row, ["rejection_reason", "rejectionReason"]) || null,
    approvedSessionId: readString(row, ["approved_session_id", "approvedSessionId"]) || null,
    createdAt,
    createdAtLabel: createdAt
      ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(createdAt)
      : "—",
    approvedSession: null,
  };
}

export function mapSessionRequestList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => {
      const item = mapSessionRequestItem(row);
      if (!item) {
        return null;
      }
      return {
        ...item,
        reasonLabel: sessionRequestReasonDisplayLabel(item),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aPending = normalizeSessionRequestStatus(a.status) === "pending" ? 0 : 1;
      const bPending = normalizeSessionRequestStatus(b.status) === "pending" ? 0 : 1;
      if (aPending !== bPending) {
        return aPending - bPending;
      }
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });
}

export function filterVisibleSessionRequests(requests, filterId) {
  if (filterId === "all") {
    return requests;
  }
  return requests.filter(
    (request) => normalizeSessionRequestStatus(request.status) === filterId,
  );
}

export function getSessionRequestEmptyMessage(filterId, { totalCount = 0, visibleCount = 0 } = {}) {
  if (visibleCount > 0) {
    return null;
  }
  if (totalCount === 0) {
    return "No session requests yet.";
  }
  if (filterId === "pending") {
    return "No pending session requests.";
  }
  return "No session requests match this filter.";
}

export function getSessionListEmptyMessage({ hasSessions, hasVisible }) {
  if (!hasSessions) {
    return "No sessions found.";
  }
  if (!hasVisible) {
    return "No sessions match your search or filter.";
  }
  return null;
}

export function normalizeCalendarDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function buildMonthGrid(monthDate) {
  const monthStart = startOfMonth(monthDate);
  const gridStart = new Date(monthStart);
  const weekday = gridStart.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  gridStart.setDate(gridStart.getDate() + diff);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function formatMonthYear(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}
