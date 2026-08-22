const ALLOWED_APP_TIMEZONES = new Set([
  "Asia/Hebron",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Kuwait",
  "Asia/Bahrain",
  "Asia/Qatar",
  "Asia/Muscat",
  "UTC",
]);

const DEFAULT_APP_TIMEZONE = "Asia/Hebron";

export function getAppTimezone() {
  const configured = import.meta.env?.VITE_APP_TIMEZONE;
  if (typeof configured === "string" && ALLOWED_APP_TIMEZONES.has(configured.trim())) {
    return configured.trim();
  }
  return DEFAULT_APP_TIMEZONE;
}

/**
 * Converts a wall-clock date/time in the app timezone to a UTC Date instant.
 *
 * @param {string} dateValue YYYY-MM-DD
 * @param {string} timeValue HH:MM
 * @param {string} [timeZone]
 * @returns {Date|null}
 */
export function zonedDateTimeToUtcDate(dateValue, timeValue, timeZone = getAppTimezone()) {
  const [year, month, day] = String(dateValue || "").split("-").map(Number);
  const [hour, minute] = String(timeValue || "").split(":").map(Number);

  if (
    !Number.isFinite(year)
    || !Number.isFinite(month)
    || !Number.isFinite(day)
    || !Number.isFinite(hour)
    || !Number.isFinite(minute)
  ) {
    return null;
  }

  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = formatter.formatToParts(new Date(utcMs));
    const read = (type) => Number(parts.find((part) => part.type === type)?.value);
    const zonedYear = read("year");
    const zonedMonth = read("month");
    const zonedDay = read("day");
    const zonedHour = read("hour");
    const zonedMinute = read("minute");

    if (
      zonedYear === year
      && zonedMonth === month
      && zonedDay === day
      && zonedHour === hour
      && zonedMinute === minute
    ) {
      return new Date(utcMs);
    }

    const desired = Date.UTC(year, month - 1, day, hour, minute);
    const actual = Date.UTC(zonedYear, zonedMonth - 1, zonedDay, zonedHour, zonedMinute);
    utcMs += desired - actual;
  }

  return new Date(utcMs);
}

/**
 * Serializes a Date instant for TIMESTAMPTZ API fields.
 *
 * @param {Date|null|undefined} date
 * @returns {string|null}
 */
export function formatInstantForApi(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}
