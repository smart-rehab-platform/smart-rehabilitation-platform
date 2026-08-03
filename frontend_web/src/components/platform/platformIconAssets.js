import adminPanelSettingsIcon from "../../assets/icons/admin_panel_settings.svg";
import analyticsIcon from "../../assets/icons/analytics.svg";
import autoAwesomeMotionIcon from "../../assets/icons/auto_awesome_motion.svg";
import calendarMonthIcon from "../../assets/icons/calendar-month.svg";
import chartBarIcon from "../../assets/icons/chart-bar.svg";
import clipboardCheckMultipleIcon from "../../assets/icons/clipboard-check-multiple.svg";
import descriptionIcon from "../../assets/icons/description.svg";
import familyRestroomIcon from "../../assets/icons/family_restroom.svg";
import folderOpenIcon from "../../assets/icons/folder-open.svg";
import homeIcon from "../../assets/icons/home.svg";
import messageIcon from "../../assets/icons/message.svg";
import neurologyIcon from "../../assets/icons/neurology.svg";
import stethoscopeIcon from "../../assets/icons/stethoscope.svg";
import taskAltIcon from "../../assets/icons/task_alt.svg";
import verifiedUserIcon from "../../assets/icons/verified_user.svg";

/** Landing Page asset keys used across the parent dashboard (outside the sidebar). */
export const PLATFORM_ICON_ASSETS = {
  dashboard: adminPanelSettingsIcon,
  layoutDashboard: adminPanelSettingsIcon,
  children: familyRestroomIcon,
  users: familyRestroomIcon,
  caseRequests: folderOpenIcon,
  clipboardList: folderOpenIcon,
  case: folderOpenIcon,
  exercises: homeIcon,
  activity: homeIcon,
  progress: chartBarIcon,
  trendingUp: chartBarIcon,
  sessions: calendarMonthIcon,
  calendar: calendarMonthIcon,
  calendarDays: calendarMonthIcon,
  "request-session": calendarMonthIcon,
  reports: descriptionIcon,
  report: descriptionIcon,
  fileText: descriptionIcon,
  feedback: stethoscopeIcon,
  messageCircle: stethoscopeIcon,
  messages: messageIcon,
  messageSquare: messageIcon,
  message: messageIcon,
  aiAssistant: neurologyIcon,
  ai: neurologyIcon,
  sparkles: neurologyIcon,
  notifications: taskAltIcon,
  bell: taskAltIcon,
  profile: verifiedUserIcon,
  user: verifiedUserIcon,
  specialist: stethoscopeIcon,
  analytics: analyticsIcon,
  treatment: clipboardCheckMultipleIcon,
  aiRecommendations: autoAwesomeMotionIcon,
};

export const PLATFORM_ICON_FALLBACK_KEY = "dashboard";

function isResolvedAssetSrc(value) {
  return (
    typeof value === "string"
    && (value.startsWith("/") || value.startsWith("data:") || value.includes("/assets/"))
  );
}

export function getPlatformIconSrc(key) {
  const fallback = PLATFORM_ICON_ASSETS[PLATFORM_ICON_FALLBACK_KEY];

  if (!key) {
    return fallback;
  }

  if (isResolvedAssetSrc(key)) {
    return key;
  }

  return PLATFORM_ICON_ASSETS[key] ?? fallback;
}
