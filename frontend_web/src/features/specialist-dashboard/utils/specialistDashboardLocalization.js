import { formatAppDate } from "../../../i18n/formatters.js";
import { SPECIALIST_NAV_ITEM_DEFS } from "../constants/specialistNavigation.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated) {
      return translated;
    }
  }

  return fallback;
}

export function normalizeSpecialistLocale(locale) {
  return locale === "ar" ? "ar" : "en";
}

export function resolveSpecialistMapperContext(options = {}) {
  if (options == null || typeof options !== "object" || Array.isArray(options)) {
    return {
      t: null,
      locale: "en",
    };
  }

  return {
    t: typeof options.t === "function" ? options.t : null,
    locale: normalizeSpecialistLocale(options.locale),
  };
}

const NAV_LABEL_KEYS = {
  dashboard: "specialist.nav.home",
  patients: "specialist.nav.patients",
  caseRequests: "specialist.nav.caseRequests",
  exercises: "specialist.nav.exercises",
  sessions: "specialist.nav.sessions",
  reviews: "specialist.nav.reviews",
  treatmentPlans: "specialist.nav.treatmentPlans",
  reports: "specialist.nav.reports",
  messages: "nav.messages",
  notifications: "nav.notifications",
  supportRequests: "specialist.nav.support",
  profile: "nav.profile",
};

const NAV_LABEL_FALLBACKS = {
  dashboard: "Home",
  patients: "Patients",
  caseRequests: "Case Requests",
  exercises: "Exercises",
  sessions: "Sessions",
  reviews: "Reviews",
  treatmentPlans: "Treatment Plans",
  reports: "Reports",
  messages: "Messages",
  notifications: "Notifications",
  supportRequests: "Support",
  profile: "Profile",
};

/**
 * @param {(key: string, params?: Record<string, unknown>) => string} t
 */
export function buildSpecialistNavItems(t) {
  return SPECIALIST_NAV_ITEM_DEFS.map((item) => ({
    ...item,
    label: translateKey(t, NAV_LABEL_KEYS[item.id], NAV_LABEL_FALLBACKS[item.id]),
  }));
}

export function getSpecialistNavLabel(navId, t) {
  return translateKey(t, NAV_LABEL_KEYS[navId], NAV_LABEL_FALLBACKS[navId] ?? navId);
}

const SESSION_STATUS_KEYS = {
  scheduled: "specialist.status.session.scheduled",
  completed: "specialist.status.session.completed",
  cancelled: "specialist.status.session.cancelled",
  no_show: "specialist.status.session.noShow",
};

const SESSION_STATUS_FALLBACKS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

/**
 * @param {string|null|undefined} status
 * @param {(key: string, params?: Record<string, unknown>) => string|null|undefined} t
 */
export function getSpecialistSessionStatusLabel(status, t) {
  const normalized = String(status || "scheduled").trim().toLowerCase();
  const key = SESSION_STATUS_KEYS[normalized];

  if (key) {
    return translateKey(t, key, SESSION_STATUS_FALLBACKS[normalized]);
  }

  const humanized = normalized.replace(/_/g, " ");
  return translateKey(t, "specialist.status.session.unknown", humanized, { status: humanized });
}

/**
 * Weekday labels for Monday-start week strips (Mon–Sun).
 * @param {string} locale
 */
export function getDashboardWeekdayLabels(locale = "en") {
  const normalizedLocale = normalizeSpecialistLocale(locale);
  const monday = new Date(2024, 0, 1);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(normalizedLocale, { weekday: "short" }).format(day);
  });
}

/**
 * @param {Date|string|null|undefined} value
 * @param {string} locale
 */
export function formatSpecialistScheduleTime(value, locale = "en") {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(normalizeSpecialistLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * @param {Date|string|null|undefined} value
 * @param {string} locale
 * @param {(key: string, params?: Record<string, unknown>) => string|null|undefined|null} [t]
 */
export function formatSpecialistScheduleWeekdayDate(value, locale = "en", t = null) {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) {
    return translateKey(t, "common.dateUnavailable", "Date unavailable");
  }

  return new Intl.DateTimeFormat(normalizeSpecialistLocale(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * @param {number|null|undefined} minutes
 * @param {(key: string, params?: Record<string, unknown>) => string|null|undefined|null} t
 */
export function formatSpecialistDurationMinutes(minutes, t) {
  if (minutes == null || !Number.isFinite(minutes)) {
    return null;
  }

  return translateKey(t, "specialist.dashboard.schedule.durationMinutes", "{minutes} min", { minutes });
}

/**
 * @param {{ scheduledAt?: Date|null, timeLabel?: string|null }} session
 * @param {Date} [now]
 * @param {{ t?: Function, locale?: string }} [context]
 */
export function formatSpecialistSessionScheduleLabel(session, now = new Date(), context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);

  if (!session?.scheduledAt) {
    return session?.timeLabel || translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const timeLabel = formatSpecialistScheduleTime(session.scheduledAt, locale)
    || session.timeLabel
    || translateKey(t, "parent.common.emptyDisplay", "—");

  const scheduledAt = session.scheduledAt;
  const isSameDay = (left, right) => left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

  if (isSameDay(scheduledAt, now)) {
    return translateKey(
      t,
      "specialist.dashboard.schedule.nextSessionToday",
      "Today, {time}",
      { time: timeLabel },
    );
  }

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (isSameDay(scheduledAt, tomorrow)) {
    return translateKey(
      t,
      "specialist.dashboard.schedule.nextSessionTomorrow",
      "Tomorrow, {time}",
      { time: timeLabel },
    );
  }

  const datePart = formatSpecialistScheduleWeekdayDate(scheduledAt, locale, t);
  return translateKey(
    t,
    "specialist.dashboard.schedule.sessionDateTime",
    "{date} • {time}",
    { date: datePart, time: timeLabel },
  );
}

/**
 * @param {Array<{ scheduledAt?: Date|null }>} sessions
 * @param {Date} selectedDay
 * @param {Date} [now]
 * @param {{ t?: Function, locale?: string }} [context]
 */
export function formatSpecialistSelectedDaySummary(sessions, selectedDay, now = new Date(), context = {}) {
  const { t } = resolveSpecialistMapperContext(context);

  const isSameDay = (left, right) => left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

  const daySessions = sessions.filter(
    (session) => session.scheduledAt && isSameDay(session.scheduledAt, selectedDay),
  );

  if (isSameDay(selectedDay, now)) {
    const upcoming = daySessions.filter((session) => session.scheduledAt >= now);

    if (upcoming.length === 0) {
      return daySessions.length === 0
        ? translateKey(t, "specialist.dashboard.schedule.noSessionsToday", "No sessions scheduled for today.")
        : translateKey(t, "specialist.dashboard.schedule.noMoreSessionsToday", "No more sessions today.");
    }

    if (upcoming.length === 1) {
      return translateKey(
        t,
        "specialist.dashboard.schedule.sessionRemainingToday",
        "1 session remaining today",
      );
    }

    return translateKey(
      t,
      "specialist.dashboard.schedule.sessionsRemainingToday",
      "{count} sessions remaining today",
      { count: upcoming.length },
    );
  }

  if (daySessions.length === 0) {
    return translateKey(
      t,
      "specialist.dashboard.schedule.noSessionsThisDay",
      "No sessions scheduled for this day.",
    );
  }

  if (daySessions.length === 1) {
    return translateKey(
      t,
      "specialist.dashboard.schedule.scheduledSessionSingular",
      "1 scheduled session",
    );
  }

  return translateKey(
    t,
    "specialist.dashboard.schedule.scheduledSessionCount",
    "{count} scheduled sessions",
    { count: daySessions.length },
  );
}

/**
 * @param {string|Date|null|undefined} dateInput
 * @param {Date} [now]
 * @param {{ t?: Function, locale?: string }} [context]
 */
export function formatSpecialistSubmittedAgo(dateInput, now = new Date(), context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (!dateInput || Number.isNaN(date.getTime())) {
    return translateKey(
      t,
      "specialist.dashboard.reviews.submittedRecently",
      "Recently submitted",
    );
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return translateKey(
      t,
      "specialist.dashboard.reviews.submittedMinutesAgo",
      "Submitted {minutes}m ago",
      { minutes: Math.max(diffMinutes, 0) },
    );
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return translateKey(
      t,
      "specialist.dashboard.reviews.submittedHoursAgo",
      "Submitted {hours}h ago",
      { hours: diffHours },
    );
  }

  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 1) {
    return translateKey(t, "parent.common.yesterday", "Yesterday");
  }

  if (diffDays < 7) {
    return translateKey(
      t,
      "specialist.dashboard.reviews.submittedDaysAgo",
      "Submitted {count} days ago",
      { count: diffDays },
    );
  }

  const formattedDate = formatAppDate(date, locale)
    ?? translateKey(t, "common.dateUnavailable", "Date unavailable");

  return translateKey(
    t,
    "specialist.dashboard.reviews.submittedOnDate",
    "Submitted {date}",
    { date: formattedDate },
  );
}

export function getSpecialistDashboardKpiLabel(kpiKey, t) {
  const key = `specialist.dashboard.kpi.${kpiKey}`;
  const fallbacks = {
    activeCases: "Active Cases",
    pendingReviews: "Pending Reviews",
    todaysSessions: "Today's Sessions",
    treatmentPlans: "Treatment Plans",
  };

  return translateKey(t, key, fallbacks[kpiKey] ?? kpiKey);
}
