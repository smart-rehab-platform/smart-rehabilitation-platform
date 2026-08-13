export const DEFAULT_SESSION_TITLE = "Therapy Session";
export const DEFAULT_DURATION_MINUTES = "45";
export const DEFAULT_TIME_VALUE = "09:00";

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDateInputValue() {
  const now = new Date();
  return formatDateInputValue(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function getDefaultScheduleDateValue() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return formatDateInputValue(tomorrow);
}

export function getMaxScheduleDateValue() {
  const now = new Date();
  const maxDate = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  return formatDateInputValue(maxDate);
}

export function buildScheduledDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  if (
    !Number.isFinite(year)
    || !Number.isFinite(month)
    || !Number.isFinite(day)
    || !Number.isFinite(hour)
    || !Number.isFinite(minute)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatScheduledAtForApi(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const pad = (value) => String(value).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${milliseconds}`;
}

export function validateScheduleSessionForm({
  title,
  patientId,
  dateValue,
  timeValue,
  durationValue,
}) {
  const errors = {};

  if (!String(title || "").trim()) {
    errors.title = "Enter a session type or title.";
  }

  if (!String(patientId || "").trim()) {
    errors.patientId = "Select an assigned patient.";
  }

  const duration = Number.parseInt(String(durationValue || "").trim(), 10);
  if (!Number.isFinite(duration) || duration < 1 || duration > 480) {
    errors.duration = "Duration must be between 1 and 480 minutes.";
  }

  const scheduledAt = buildScheduledDateTime(dateValue, timeValue);
  if (!scheduledAt || scheduledAt <= new Date()) {
    errors.dateTime = "Scheduled date and time must be in the future.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    duration: Number.isFinite(duration) ? duration : null,
    scheduledAt,
  };
}

export function buildCreateSessionPayload({
  patientId,
  specialistId,
  scheduledAt,
  durationMinutes,
  locationOrLink,
}) {
  const payload = {
    patient_id: String(patientId || "").trim(),
    specialist_id: String(specialistId || "").trim(),
    scheduled_at: formatScheduledAtForApi(scheduledAt),
    duration_minutes: durationMinutes,
  };

  const location = String(locationOrLink || "").trim();
  if (location) {
    payload.location_or_link = location;
  }

  return payload;
}
