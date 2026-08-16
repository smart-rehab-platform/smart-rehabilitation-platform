import { formatAppDate } from "../../../i18n/formatters.js";
import {
  ADMIN_SIDEBAR_NAV_ROUTE_KEYS,
  getAdminRoutePath,
} from "../../../routes/adminDashboardRoutes.js";
import { getRoleDisplayLabel } from "../../shared-dashboard/utils/profileDisplayUtils.js";
import { ADMIN_NAV_ITEM_DEFS } from "../constants/adminNavigation.js";
import {
  clampWeekOffset,
  SYSTEM_ACTIVITY_PRESET_OFFSETS,
} from "./adminDashboardMappers.js";

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

export function normalizeAdminLocale(locale) {
  return locale === "ar" ? "ar" : "en";
}

export function resolveAdminMapperContext(options = {}) {
  if (options == null || typeof options !== "object" || Array.isArray(options)) {
    return { t: null, locale: "en" };
  }

  return {
    t: typeof options.t === "function" ? options.t : null,
    locale: normalizeAdminLocale(options.locale),
  };
}

const NAV_LABEL_KEYS = {
  dashboard: "admin.nav.home",
  users: "admin.nav.users",
  patients: "admin.nav.patients",
  patientAssignments: "admin.nav.patientAssignments",
  caseRequests: "admin.nav.caseRequests",
  complaints: "admin.nav.complaints",
  supportRequests: "admin.nav.supportRequests",
  exercises: "admin.nav.exercises",
  sessions: "admin.nav.sessions",
  reports: "admin.nav.reports",
  aiCenter: "admin.nav.aiCenter",
  auditLogs: "admin.nav.auditLogs",
  notifications: "nav.notifications",
  profile: "nav.profile",
};

const NAV_LABEL_FALLBACKS = {
  dashboard: "Home",
  users: "Users",
  patients: "Patients",
  patientAssignments: "Patient Assignments",
  caseRequests: "Case Requests",
  complaints: "Complaints",
  supportRequests: "Support Requests",
  exercises: "Exercises",
  sessions: "Sessions",
  reports: "Reports",
  aiCenter: "AI Center",
  auditLogs: "Audit Logs",
  notifications: "Notifications",
  profile: "Profile",
};

export function buildAdminNavItems(t = null) {
  return ADMIN_NAV_ITEM_DEFS.map((item) => ({
    ...item,
    label: translateKey(t, NAV_LABEL_KEYS[item.id], NAV_LABEL_FALLBACKS[item.id]),
  }));
}

export function getAdminShellLabels(t = null) {
  return {
    navigationAriaLabel: translateKey(t, "admin.shell.navigationAriaLabel", "Admin navigation"),
    signOutLabel: translateKey(t, "profile.signOut", "Sign out"),
    signOutFailed: translateKey(t, "admin.shell.signOutFailed", "Unable to sign out. Please try again."),
  };
}

export function getAdminSearchLabels(t = null) {
  return {
    placeholder: translateKey(t, "admin.search.placeholder", "Jump to a page..."),
    inputAriaLabel: translateKey(t, "admin.search.inputAriaLabel", "Jump to a page"),
    panelAriaLabel: translateKey(t, "admin.search.panelAriaLabel", "Admin pages"),
    empty: translateKey(t, "admin.search.empty", "No matching pages."),
  };
}

export function getAdminDashboardHomeLabels(t = null) {
  return {
    greetingAriaLabel: translateKey(t, "admin.dashboard.greetingAriaLabel", "Admin greeting"),
    welcome: translateKey(t, "admin.dashboard.welcome", "Welcome, {name}"),
    subtitle: translateKey(
      t,
      "admin.dashboard.subtitle",
      "Manage your rehabilitation platform from one place.",
    ),
    signInRequired: translateKey(
      t,
      "admin.dashboard.signInRequired",
      "Please sign in as an admin to view this dashboard.",
    ),
    loadFailed: translateKey(
      t,
      "admin.dashboard.loadFailed",
      "Failed to load admin dashboard.",
    ),
    retry: translateKey(t, "common.retry", "Retry"),
    defaultAdminName: translateKey(t, "roles.admin", "Admin"),
  };
}

export function getAdminSummaryLabels(t = null) {
  return {
    overviewAriaLabel: translateKey(t, "admin.dashboard.summary.overviewAriaLabel", "Overview summary"),
    overviewLoadingAriaLabel: translateKey(
      t,
      "admin.dashboard.summary.overviewLoadingAriaLabel",
      "Overview summary loading",
    ),
    loading: translateKey(t, "common.loading", "Loading"),
    loadingCardAria: (label) => translateKey(
      t,
      "admin.dashboard.summary.loadingCardAria",
      "{label} loading",
      { label },
    ),
    valueAria: (label, value) => translateKey(
      t,
      "admin.dashboard.summary.valueAria",
      "{label}: {value}",
      { label, value },
    ),
    users: translateKey(t, "admin.nav.users", "Users"),
    patients: translateKey(t, "admin.nav.patients", "Patients"),
    specialists: translateKey(t, "admin.dashboard.summary.specialists", "Specialists"),
    newSignups: translateKey(t, "admin.dashboard.summary.newSignups", "New Signups"),
    newSignupsThisWeek: (count) => translateKey(
      t,
      "admin.dashboard.summary.newSignupsThisWeek",
      "+{count} this week",
      { count },
    ),
    thisWeek: translateKey(t, "admin.dashboard.summary.thisWeek", "This week"),
  };
}

export function getAdminAnalyticsLabels(t = null) {
  return {
    sectionAriaLabel: translateKey(
      t,
      "admin.dashboard.analytics.sectionAriaLabel",
      "System Analytics",
    ),
    title: translateKey(t, "admin.dashboard.analytics.title", "System Analytics"),
    legend: translateKey(t, "admin.dashboard.analytics.legend", "System Activity"),
    chartAriaLabel: translateKey(
      t,
      "admin.dashboard.analytics.chartAriaLabel",
      "Weekly system activity chart",
    ),
    emptyTitle: translateKey(
      t,
      "admin.dashboard.analytics.emptyTitle",
      "No system activity for this week.",
    ),
    emptyHint: translateKey(
      t,
      "admin.dashboard.analytics.emptyHint",
      "Try selecting another week.",
    ),
    loadingChart: translateKey(t, "admin.dashboard.analytics.loadingChart", "Loading chart..."),
    loadFailed: translateKey(
      t,
      "admin.dashboard.analytics.loadFailed",
      "Failed to load system activity. Please try again.",
    ),
    retry: translateKey(t, "common.retry", "Retry"),
    previousWeek: translateKey(t, "admin.dashboard.analytics.previousWeek", "Previous week"),
    nextWeek: translateKey(t, "admin.dashboard.analytics.nextWeek", "Next week"),
    selectPeriod: translateKey(t, "admin.dashboard.analytics.selectPeriod", "Select period"),
    periodAriaLabel: translateKey(
      t,
      "admin.dashboard.analytics.periodAriaLabel",
      "System activity period",
    ),
    periodThisWeek: translateKey(t, "admin.dashboard.analytics.period.thisWeek", "This Week"),
    periodLastWeek: translateKey(t, "admin.dashboard.analytics.period.lastWeek", "Last Week"),
    periodLast2Weeks: translateKey(t, "admin.dashboard.analytics.period.last2Weeks", "Last 2 Weeks"),
    periodLastMonth: translateKey(t, "admin.dashboard.analytics.period.lastMonth", "Last Month"),
    periodRange: (start, end) => translateKey(
      t,
      "admin.dashboard.analytics.period.range",
      "{start} – {end}",
      { start, end },
    ),
    weeksAgo: (count) => translateKey(
      t,
      "admin.dashboard.analytics.weeksAgo",
      "{count} weeks ago",
      { count },
    ),
    event: translateKey(t, "admin.dashboard.analytics.event", "event"),
    events: translateKey(t, "admin.dashboard.analytics.events", "events"),
    dayEvents: (day, count, eventLabel) => translateKey(
      t,
      "admin.dashboard.analytics.dayEvents",
      "{day}: {count} {eventLabel}",
      { day, count, eventLabel },
    ),
  };
}

export function getAdminQuickActionsLabels(t = null) {
  return {
    sectionAriaLabel: translateKey(t, "admin.dashboard.quickActions.sectionAriaLabel", "Quick actions"),
    patientAssignments: translateKey(t, "admin.nav.patientAssignments", "Patient Assignments"),
    patientAssignmentsHint: translateKey(
      t,
      "admin.dashboard.quickActions.patientAssignmentsHint",
      "Assign specialists and link parents to patients",
    ),
  };
}

export function getAdminRecentUsersLabels(t = null) {
  return {
    sectionAriaLabel: translateKey(t, "admin.dashboard.recentUsers.sectionAriaLabel", "Recent users"),
    title: translateKey(t, "admin.dashboard.recentUsers.title", "Recent Users"),
    seeAll: translateKey(t, "admin.dashboard.recentUsers.seeAll", "See all"),
    empty: translateKey(t, "admin.dashboard.recentUsers.empty", "No recent users."),
    loadingListAriaLabel: translateKey(
      t,
      "admin.dashboard.recentUsers.loadingListAriaLabel",
      "Recent users loading",
    ),
    loadingUser: translateKey(t, "admin.dashboard.recentUsers.loadingUser", "Loading user..."),
  };
}

export function getAdminRoleLabel(role, t = null) {
  return getRoleDisplayLabel(role, t ?? ((key) => key));
}

export function getAdminWeekdayLabels(locale = "en", style = "short") {
  const normalizedLocale = normalizeAdminLocale(locale);
  const monday = new Date(2024, 0, 1);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(normalizedLocale, { weekday: style }).format(day);
  });
}

export function localizeSystemActivityDays(days, locale = "en") {
  if (!Array.isArray(days) || days.length !== 7) {
    return days;
  }

  const shortLabels = getAdminWeekdayLabels(locale, "short");
  const fullLabels = getAdminWeekdayLabels(locale, "long");

  return days.map((day, index) => ({
    ...day,
    label: shortLabels[index] ?? day.label,
    fullLabel: fullLabels[index] ?? day.fullLabel,
  }));
}

function formatChartDate(date, locale) {
  return formatAppDate(date, locale) ?? "";
}

export function formatAdminSystemActivityPeriodLabel({
  weekOffset,
  weekStart = null,
  weekEnd = null,
} = {}, context = {}) {
  const { t, locale } = resolveAdminMapperContext(context);
  const labels = getAdminAnalyticsLabels(t);
  const offset = clampWeekOffset(weekOffset);

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.thisWeek) {
    return labels.periodThisWeek;
  }

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.lastWeek) {
    return labels.periodLastWeek;
  }

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.last2Weeks) {
    return labels.periodLast2Weeks;
  }

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.lastMonth) {
    return labels.periodLastMonth;
  }

  if (weekStart && weekEnd) {
    return labels.periodRange(
      formatChartDate(weekStart, locale),
      formatChartDate(weekEnd, locale),
    );
  }

  if (offset === 1) {
    return labels.periodLastWeek;
  }

  return labels.weeksAgo(offset);
}

export function getAdminAnalyticsPeriodOptions(t = null) {
  const labels = getAdminAnalyticsLabels(t);
  return [
    { value: SYSTEM_ACTIVITY_PRESET_OFFSETS.thisWeek, label: labels.periodThisWeek },
    { value: SYSTEM_ACTIVITY_PRESET_OFFSETS.lastWeek, label: labels.periodLastWeek },
    { value: SYSTEM_ACTIVITY_PRESET_OFFSETS.last2Weeks, label: labels.periodLast2Weeks },
    { value: SYSTEM_ACTIVITY_PRESET_OFFSETS.lastMonth, label: labels.periodLastMonth },
  ];
}

export function buildAdminSearchDestinations(t = null) {
  return buildAdminNavItems(t)
    .map((item) => {
      const routeKey = ADMIN_SIDEBAR_NAV_ROUTE_KEYS[item.id] ?? item.id;
      const route = getAdminRoutePath(routeKey);

      return {
        id: item.id,
        label: item.label,
        route,
        icon: item.icon,
      };
    })
    .filter((destination) => Boolean(destination.route));
}

export function filterAdminSearchDestinations(query, destinations = []) {
  const normalized = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!normalized) {
    return [];
  }

  return destinations.filter((destination) => (
    destination.label.toLowerCase().includes(normalized)
  ));
}

export function formatAdminRegisteredLabel(createdAt, now = new Date(), context = {}) {
  const { t, locale } = resolveAdminMapperContext(context);
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (!createdAt || Number.isNaN(date.getTime())) {
    return translateKey(t, "parent.common.recently", "Recently");
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return translateKey(t, "parent.common.justNow", "Just now");
  }

  if (diffMinutes < 60) {
    return translateKey(
      t,
      "parent.common.minutesAgo",
      "{count}m ago",
      { count: diffMinutes },
    );
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return translateKey(
      t,
      "parent.common.hoursAgo",
      "{count}h ago",
      { count: Math.max(diffHours, 0) },
    );
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return translateKey(t, "common.yesterday", "Yesterday");
  }

  if (diffDays < 7) {
    return translateKey(
      t,
      "parent.common.daysAgo",
      "{count}d ago",
      { count: diffDays },
    );
  }

  return formatAppDate(date, locale)
    ?? translateKey(t, "parent.common.recently", "Recently");
}

export function applyAdminRecentUserLocalization(user, context = {}) {
  if (!user) {
    return user;
  }

  const { t } = resolveAdminMapperContext(context);

  return {
    ...user,
    name: user.name,
    role: getAdminRoleLabel(user.rawRole, t),
    registeredLabel: formatAdminRegisteredLabel(user.createdAt, new Date(), context),
  };
}

export function applyAdminRecentUsersLocalization(users, context = {}) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.map((user) => applyAdminRecentUserLocalization(user, context));
}
