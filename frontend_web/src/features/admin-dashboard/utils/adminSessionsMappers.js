import {
  formatSessionStatusLabel,
  getSessionStatusTone,
  isPastScheduledNotCompleted,
  resolveProfileImageUrl,
} from "./adminPatientsMappers";

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

export const SESSION_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

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

function readNullableString(record, keys) {
  const value = readString(record, keys);
  return value || null;
}

function readInt(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readDateTimeValue(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (value == null || value === "") {
      continue;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

function normalizeSessionStatus(status) {
  const normalized = (status || "").trim().toLowerCase();
  return SESSION_STATUS_VALUES.includes(normalized) ? normalized : normalized || null;
}

/**
 * Combines YYYY-MM-DD and HH:MM into an ISO datetime string matching Flutter's
 * local DateTime.toIso8601String() shape (no timezone suffix).
 *
 * @param {string} dateText
 * @param {string} timeText
 * @returns {string|null}
 */
export function combineSessionDateAndTime(dateText, timeText) {
  const dateParts = String(dateText || "").trim().split("-");
  const timeParts = String(timeText || "").trim().split(":");

  if (dateParts.length !== 3 || timeParts.length < 2) {
    return null;
  }

  const year = Number.parseInt(dateParts[0], 10);
  const month = Number.parseInt(dateParts[1], 10);
  const day = Number.parseInt(dateParts[2], 10);
  const hour = Number.parseInt(timeParts[0], 10);
  const minute = Number.parseInt(timeParts[1], 10);

  if (
    !Number.isFinite(year)
    || !Number.isFinite(month)
    || !Number.isFinite(day)
    || !Number.isFinite(hour)
    || !Number.isFinite(minute)
  ) {
    return null;
  }

  const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  const pad = (value) => String(value).padStart(2, "0");
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:00.000`;
}

/**
 * Builds the PUT /sessions/:id payload following Flutter Admin edit behavior.
 *
 * @param {{ status?: string|null }} session Original/current session
 * @param {{
 *   scheduledAt?: string|null,
 *   durationMinutes?: number|null,
 *   locationOrLink?: string|null,
 *   selectedStatus?: string|null,
 *   cancellationReason?: string|null,
 * }} fields
 */
export function buildAdminSessionUpdatePayload(session, fields = {}) {
  const payload = {};
  const originallyScheduled = normalizeSessionStatus(session?.status) === "scheduled";

  if (fields.scheduledAt != null && fields.scheduledAt !== "") {
    payload.scheduled_at = fields.scheduledAt;
  }

  if (fields.durationMinutes != null) {
    payload.duration_minutes = fields.durationMinutes;
  }

  if (fields.locationOrLink != null) {
    payload.location_or_link = String(fields.locationOrLink).trim();
  }

  if (originallyScheduled && fields.selectedStatus != null && fields.selectedStatus !== "") {
    payload.status = fields.selectedStatus;

    if (fields.selectedStatus === "cancelled" && fields.cancellationReason != null) {
      payload.cancellation_reason = String(fields.cancellationReason).trim();
    }
  }

  return payload;
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapAdminSession(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = normalizeSessionStatus(readNullableString(row, ["status"]));
  const scheduledAt = readDateTimeValue(row, ["scheduled_at", "scheduledAt"]);
  const isPastScheduled = isPastScheduledNotCompleted({ scheduledAt, status });

  return {
    id,
    patientId: readNullableString(row, ["patient_id", "patientId"]),
    patientName: readString(row, ["patient_name", "patientName"]) || "Patient",
    patientProfileImageUrl: resolveProfileImageUrl(
      readNullableString(row, ["patient_profile_image_url", "patientProfileImageUrl"]),
    ),
    specialistId: readNullableString(row, ["specialist_id", "specialistId"]),
    specialistName: readString(row, ["specialist_name", "specialistName"]) || "Specialist",
    scheduledAt,
    durationMinutes: readInt(row, ["duration_minutes", "durationMinutes"]),
    locationOrLink: readNullableString(row, ["location_or_link", "locationOrLink"]),
    status,
    cancellationReason: readNullableString(row, ["cancellation_reason", "cancellationReason"]),
    createdAt: readDateTimeValue(row, ["created_at", "createdAt"]),
    updatedAt: readDateTimeValue(row, ["updated_at", "updatedAt"]),
    statusLabel: formatSessionStatusLabel(status, isPastScheduled),
    statusTone: getSessionStatusTone(status, isPastScheduled),
    isScheduled: status === "scheduled",
    isFinal: FINAL_SESSION_STATUSES.has(status),
    isPastScheduled,
  };
}

/**
 * Client-side search/filter mirroring Flutter Admin Sessions.
 *
 * @param {ReturnType<typeof mapAdminSession>[]} sessions
 * @param {{ searchQuery?: string, selectedStatus?: string }} filters
 */
export function filterAdminSessions(sessions, { searchQuery = "", selectedStatus = "" } = {}) {
  const query = searchQuery.trim().toLowerCase();
  const statusFilter = selectedStatus.trim().toLowerCase();

  return sessions.filter((session) => {
    const matchesSearch = !query
      || session.patientName.toLowerCase().includes(query)
      || session.specialistName.toLowerCase().includes(query);

    const matchesStatus = !statusFilter
      || (session.status || "").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });
}
