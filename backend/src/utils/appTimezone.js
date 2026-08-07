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
const MIN_WEEK_OFFSET = -52;
const MAX_WEEK_OFFSET = 52;

function getAppTimezone() {
  const configured = process.env.APP_TIMEZONE;
  if (configured && ALLOWED_APP_TIMEZONES.has(configured)) {
    return configured;
  }
  return DEFAULT_APP_TIMEZONE;
}

/**
 * weekOffset=0 current week, -1 previous week, -2 two weeks ago, 1 next week.
 * Values are clamped but never sign-flipped.
 */
function normalizeWeekOffset(weekOffset) {
  const raw = Number(weekOffset);
  if (!Number.isFinite(raw)) {
    return 0;
  }

  return Math.max(MIN_WEEK_OFFSET, Math.min(MAX_WEEK_OFFSET, Math.trunc(raw)));
}

function formatWeekLabel(weekOffset) {
  const offset = normalizeWeekOffset(weekOffset);

  if (offset === 0) {
    return "This Week";
  }
  if (offset === -1) {
    return "Last Week";
  }
  if (offset === 1) {
    return "Next Week";
  }
  if (offset < -1) {
    return `${Math.abs(offset)} Weeks Ago`;
  }
  return `${offset} Weeks Ahead`;
}

function localDateSql(timestampExpression, timezone = getAppTimezone()) {
  return `(${timestampExpression} AT TIME ZONE '${timezone}')::date`;
}

module.exports = {
  ALLOWED_APP_TIMEZONES,
  DEFAULT_APP_TIMEZONE,
  MIN_WEEK_OFFSET,
  MAX_WEEK_OFFSET,
  getAppTimezone,
  normalizeWeekOffset,
  formatWeekLabel,
  localDateSql,
};
