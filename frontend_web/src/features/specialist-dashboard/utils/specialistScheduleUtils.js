import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { getAppTimezone } from "../../../utils/appTimezone.js";
import {
  formatSpecialistScheduleTime,
  formatSpecialistSelectedDaySummary,
} from "./specialistDashboardLocalization";

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

function readNumber(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function resolveProfileImageUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return resolveUploadedAssetUrl(trimmed) ?? trimmed;
  }

  return resolveUploadedAssetUrl(trimmed);
}

function extractMeetingUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export function getInitials(name, fallback = "PT") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return fallback;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/**
 * @param {Record<string, unknown>} row
 */
export function parseScheduledAt(row) {
  const raw = row?.scheduled_at ?? row?.scheduledAt;
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Scheduled sessions only — excludes completed, cancelled, and no_show.
 * @param {Record<string, unknown>} row
 */
export function isScheduledSession(row) {
  const status = readString(row, ["status"]).toLowerCase();
  if (!status || status === "scheduled") {
    return true;
  }

  return false;
}

/**
 * @param {Date|null|undefined} scheduledAt
 * @param {Date} [now]
 */
export function isSameDay(a, b) {
  if (!a || !b) {
    return false;
  }

  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * @param {Date} date
 */
export function startOfWeekMonday(date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = normalized.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  normalized.setDate(normalized.getDate() + diff);
  return normalized;
}

/**
 * @param {Date} weekStart
 */
export function buildWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  });
}

function formatDisplayDate(date) {
  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    timeZone: getAppTimezone(),
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * @param {Record<string, unknown>} row
 * @param {string} [locale]
 */
export function mapSpecialistSessionRow(row, locale = "en") {
  const scheduledAt = parseScheduledAt(row);
  const locationOrLink = readString(row, ["location_or_link", "locationOrLink"]);
  const meetingUrl = extractMeetingUrl(locationOrLink);
  const durationMinutes = readNumber(row, ["duration_minutes", "durationMinutes"]);

  return {
    id: readString(row, ["id", "_id"]),
    patientId: readString(row, ["patient_id", "patientId"]),
    patientName: readString(row, ["patient_name", "patientName"]) || "Patient",
    patientProfileImageUrl: resolveProfileImageUrl(
      readString(row, ["patient_profile_image_url", "patientProfileImageUrl"]),
    ),
    scheduledAt,
    timeLabel: formatSpecialistScheduleTime(scheduledAt, locale),
    durationMinutes,
    status: readString(row, ["status"]) || "scheduled",
    locationOrLink: locationOrLink || null,
    meetingUrl,
    isOnline: Boolean(meetingUrl),
    physicalLocation: meetingUrl ? null : locationOrLink,
  };
}

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} [locale]
 */
export function mapSpecialistSessionRows(rows, locale = "en") {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter(isScheduledSession)
    .map((row) => mapSpecialistSessionRow(row, locale))
    .filter((session) => session.id);
}

/**
 * @param {ReturnType<typeof mapSpecialistSessionRow>[]} sessions
 * @param {Date} day
 */
export function getScheduledSessionsForDay(sessions, day) {
  return sessions
    .filter((session) => session.scheduledAt && isSameDay(session.scheduledAt, day))
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

/**
 * Next session preview for a selected calendar day.
 * @param {ReturnType<typeof mapSpecialistSessionRow>[]} sessions
 * @param {Date} selectedDay
 * @param {Date} [now]
 */
export function findPreviewSessionForDay(sessions, selectedDay, now = new Date()) {
  const daySessions = getScheduledSessionsForDay(sessions, selectedDay);

  if (daySessions.length === 0) {
    return null;
  }

  if (isSameDay(selectedDay, now)) {
    const upcoming = daySessions.filter((session) => session.scheduledAt >= now);
    return upcoming[0] ?? null;
  }

  return daySessions[0];
}

/**
 * @param {ReturnType<typeof mapSpecialistSessionRow>} session
 * @param {Date} [now]
 */
export function formatSessionScheduleLabel(session, now = new Date()) {
  if (!session?.scheduledAt) {
    return session?.timeLabel || "—";
  }

  const { scheduledAt } = session;
  if (isSameDay(scheduledAt, now)) {
    return `Today, ${session.timeLabel}`;
  }

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (isSameDay(scheduledAt, tomorrow)) {
    return `Tomorrow, ${session.timeLabel}`;
  }

  return `${formatDisplayDate(scheduledAt)} • ${session.timeLabel}`;
}

/**
 * @param {ReturnType<typeof mapSpecialistSessionRow>[]} sessions
 * @param {Date} selectedDay
 * @param {Date} [now]
 */
export function formatSelectedDaySummary(sessions, selectedDay, now = new Date()) {
  const daySessions = getScheduledSessionsForDay(sessions, selectedDay);

  if (isSameDay(selectedDay, now)) {
    const upcoming = daySessions.filter((session) => session.scheduledAt >= now);

    if (upcoming.length === 0) {
      return daySessions.length === 0
        ? "No sessions scheduled for today."
        : "No more sessions today.";
    }

    const count = upcoming.length;
    return `${count} session${count === 1 ? "" : "s"} remaining today`;
  }

  if (daySessions.length === 0) {
    return "No sessions scheduled for this day.";
  }

  const count = daySessions.length;
  return `${count} scheduled session${count === 1 ? "" : "s"}`;
}

/**
 * @param {ReturnType<typeof mapSpecialistSessionRow>[]} sessions
 * @param {Date} weekStart
 */
export function getWeekScheduledSessions(sessions, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return sessions.filter((session) => {
    if (!session.scheduledAt) {
      return false;
    }

    const time = session.scheduledAt.getTime();
    return time >= weekStart.getTime() && time <= weekEnd.getTime();
  });
}

/**
 * @param {ReturnType<typeof mapSpecialistSessionRow>[]} sessions
 * @param {Date} selectedDay
 * @param {Date} [now]
 * @param {{ t?: Function, locale?: string }} [context]
 */
export function buildWeeklyScheduleViewModel(sessions, selectedDay, now = new Date(), context = {}) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = startOfWeekMonday(today);
  const weekDays = buildWeekDays(weekStart);
  const weekSessions = getWeekScheduledSessions(sessions, weekStart);
  const previewSession = findPreviewSessionForDay(sessions, selectedDay, now);
  const summaryLabel = formatSpecialistSelectedDaySummary(sessions, selectedDay, now, context);

  return {
    weekDays,
    today,
    weekSessions,
    hasWeekSessions: weekSessions.length > 0,
    previewSession,
    summaryLabel,
    dayHasSession: (day) => getScheduledSessionsForDay(sessions, day).length > 0,
  };
}
