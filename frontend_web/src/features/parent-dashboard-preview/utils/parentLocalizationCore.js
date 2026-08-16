import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";

export function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated) {
      return translated;
    }
  }

  return fallback;
}

export function resolveMapperContext(options = {}) {
  if (options == null || typeof options !== "object" || Array.isArray(options)) {
    return {
      t: null,
      locale: "en",
    };
  }

  return {
    t: typeof options.t === "function" ? options.t : null,
    locale: options.locale === "ar" ? "ar" : "en",
  };
}

export function normalizeLocale(locale) {
  return locale === "ar" ? "ar" : "en";
}

export function formatUnavailableDate(t) {
  return translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function formatEmptyDisplay(t) {
  return translateKey(t, "parent.common.emptyDisplay", "—");
}

export function formatParentDate(value, locale = "en", t = null) {
  const formatted = formatAppDate(value, locale);
  return formatted ?? formatUnavailableDate(t);
}

export function formatParentDateTime(value, locale = "en", t = null) {
  const formatted = formatAppDateTime(value, locale);
  return formatted ?? formatUnavailableDate(t);
}

export function formatParentWeekdayDate(value, locale = "en", t = null) {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return formatUnavailableDate(t);
  }

  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatParentLongDate(value, locale = "en", t = null) {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return formatUnavailableDate(t);
  }

  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatParentTime(value, locale = "en") {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeSessionDate(value, locale = "en", t = null) {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return {
      dateLabel: translateKey(t, "parent.common.upcoming", "Upcoming"),
      timeLabel: null,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  let dateLabel;
  if (diffDays === 0) {
    dateLabel = translateKey(t, "parent.common.today", "Today");
  } else if (diffDays === 1) {
    dateLabel = translateKey(t, "parent.common.tomorrow", "Tomorrow");
  } else {
    dateLabel = formatAppDate(date, locale) ?? formatUnavailableDate(t);
  }

  return {
    dateLabel,
    timeLabel: formatParentTime(date, locale),
  };
}

export function formatTimeAgo(value, locale = "en", t = null) {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return translateKey(t, "parent.common.justNow", "Just now");
  }

  if (diffMins < 60) {
    return translateKey(t, "parent.common.minutesAgo", "{count}m ago", { count: diffMins });
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return translateKey(t, "parent.common.hoursAgo", "{count}h ago", { count: diffHours });
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return translateKey(t, "parent.common.yesterday", "Yesterday");
  }

  if (diffDays < 7) {
    return translateKey(t, "parent.common.daysAgo", "{count}d ago", { count: diffDays });
  }

  return formatAppDate(date, locale);
}

export function capitalizeFirst(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
