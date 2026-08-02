/**
 * Parent sidebar icons — exact downloaded assets from the Landing Page.
 * Each entry references the same import path used in landing components.
 */
import adminPanelSettingsIcon from "../../../assets/icons/admin_panel_settings.svg";
import calendarMonthIcon from "../../../assets/icons/calendar-month.svg";
import chartBarIcon from "../../../assets/icons/chart-bar.svg";
import clipboardCheckMultipleIcon from "../../../assets/icons/clipboard-check-multiple.svg";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import folderOpenIcon from "../../../assets/icons/folder-open.svg";
import homeIcon from "../../../assets/icons/home.svg";
import messageIcon from "../../../assets/icons/message.svg";
import neurologyIcon from "../../../assets/icons/neurology.svg";
import stethoscopeIcon from "../../../assets/icons/stethoscope.svg";

/** Landing: HeroCards admin card — centralized workspace / dashboard overview */
export const SIDEBAR_DASHBOARD_ICON = adminPanelSettingsIcon;

/** Landing: HeroCards family card — For Families / My Children */
export const SIDEBAR_CHILDREN_ICON = familyRestroomIcon;

/** Landing: PlatformModulesSection — Case Management */
export const SIDEBAR_CASE_REQUESTS_ICON = folderOpenIcon;

/** Landing: PlatformModulesSection — Home Exercise Support */
export const SIDEBAR_EXERCISES_ICON = homeIcon;

/** Landing: PlatformModulesSection — Progress & Reports */
export const SIDEBAR_PROGRESS_ICON = chartBarIcon;

/** Landing: PlatformModulesSection — Sessions */
export const SIDEBAR_SESSIONS_ICON = calendarMonthIcon;

/** Landing: PlatformModulesSection — Progress & Reports (Specialist reports) */
export const SIDEBAR_REPORTS_ICON = clipboardCheckMultipleIcon;

/** Landing: PlatformModulesSection — Specialist Review / feedback */
export const SIDEBAR_FEEDBACK_ICON = stethoscopeIcon;

/** Landing: PlatformModulesSection — Communication */
export const SIDEBAR_MESSAGES_ICON = messageIcon;

/** Landing: FeatureIndicators + ArtificialIntelligenceSection — AI Assistant */
export const SIDEBAR_AI_ASSISTANT_ICON = neurologyIcon;

export const PARENT_SIDEBAR_ICON_FALLBACK = SIDEBAR_DASHBOARD_ICON;

/** Resolve by sidebar nav item id */
export const PARENT_SIDEBAR_ICONS_BY_NAV_ID = {
  dashboard: SIDEBAR_DASHBOARD_ICON,
  children: SIDEBAR_CHILDREN_ICON,
  cases: SIDEBAR_CASE_REQUESTS_ICON,
  exercises: SIDEBAR_EXERCISES_ICON,
  progress: SIDEBAR_PROGRESS_ICON,
  sessions: SIDEBAR_SESSIONS_ICON,
  reports: SIDEBAR_REPORTS_ICON,
  feedback: SIDEBAR_FEEDBACK_ICON,
  messages: SIDEBAR_MESSAGES_ICON,
  ai: SIDEBAR_AI_ASSISTANT_ICON,
};

/** Resolve legacy icon keys from navItems mock data */
export const PARENT_SIDEBAR_ICONS_BY_KEY = {
  layoutDashboard: SIDEBAR_DASHBOARD_ICON,
  dashboard: SIDEBAR_DASHBOARD_ICON,
  users: SIDEBAR_CHILDREN_ICON,
  children: SIDEBAR_CHILDREN_ICON,
  clipboardList: SIDEBAR_CASE_REQUESTS_ICON,
  caseRequests: SIDEBAR_CASE_REQUESTS_ICON,
  activity: SIDEBAR_EXERCISES_ICON,
  exercises: SIDEBAR_EXERCISES_ICON,
  trendingUp: SIDEBAR_PROGRESS_ICON,
  progress: SIDEBAR_PROGRESS_ICON,
  calendar: SIDEBAR_SESSIONS_ICON,
  calendarDays: SIDEBAR_SESSIONS_ICON,
  sessions: SIDEBAR_SESSIONS_ICON,
  fileText: SIDEBAR_REPORTS_ICON,
  report: SIDEBAR_REPORTS_ICON,
  reports: SIDEBAR_REPORTS_ICON,
  messageCircle: SIDEBAR_FEEDBACK_ICON,
  feedback: SIDEBAR_FEEDBACK_ICON,
  messageSquare: SIDEBAR_MESSAGES_ICON,
  message: SIDEBAR_MESSAGES_ICON,
  messages: SIDEBAR_MESSAGES_ICON,
  sparkles: SIDEBAR_AI_ASSISTANT_ICON,
  ai: SIDEBAR_AI_ASSISTANT_ICON,
  aiAssistant: SIDEBAR_AI_ASSISTANT_ICON,
};

export function getParentSidebarIconSrc({ navId, iconKey }) {
  if (navId && PARENT_SIDEBAR_ICONS_BY_NAV_ID[navId]) {
    return PARENT_SIDEBAR_ICONS_BY_NAV_ID[navId];
  }

  if (iconKey && PARENT_SIDEBAR_ICONS_BY_KEY[iconKey]) {
    return PARENT_SIDEBAR_ICONS_BY_KEY[iconKey];
  }

  return PARENT_SIDEBAR_ICON_FALLBACK;
}
