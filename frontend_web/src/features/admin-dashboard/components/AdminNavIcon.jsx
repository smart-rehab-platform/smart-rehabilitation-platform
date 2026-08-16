import { Bell, History, LifeBuoy, User, Users } from "lucide-react";
import assignUserLineIcon from "../../../assets/icons/clarity--assign-user-line.svg";
import calendarMonthIcon from "../../../assets/icons/calendar-month.svg";
import complaintIcon from "../../../assets/icons/hugeicons--complaint.svg";
import descriptionIcon from "../../../assets/icons/description.svg";
import dumbbellIcon from "../../../assets/icons/dumbbell.svg";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import folderOpenIcon from "../../../assets/icons/folder-open.svg";
import homeIcon from "../../../assets/icons/home.svg";
import neurologyIcon from "../../../assets/icons/neurology.svg";
const PLATFORM_ICON_BLUE = "#4FA6F8";

const ADMIN_SIDEBAR_ICON_ASSETS = {
  dashboard: homeIcon,
  patients: familyRestroomIcon,
  patientAssignments: assignUserLineIcon,
  caseRequests: folderOpenIcon,
  complaints: complaintIcon,
  exercises: dumbbellIcon,
  sessions: calendarMonthIcon,
  reports: descriptionIcon,
  aiCenter: neurologyIcon,
};

const NOTIFICATION_NAV_IDS = new Set(["notifications"]);
const NOTIFICATION_ICON_KEYS = new Set(["notifications"]);

const PROFILE_NAV_IDS = new Set(["profile"]);
const PROFILE_ICON_KEYS = new Set(["profile"]);

const AUDIT_LOGS_NAV_IDS = new Set(["auditLogs"]);
const AUDIT_LOGS_ICON_KEYS = new Set(["auditLogs"]);

const USERS_NAV_IDS = new Set(["users"]);
const USERS_ICON_KEYS = new Set(["users"]);

const SUPPORT_REQUESTS_NAV_IDS = new Set(["supportRequests"]);
const SUPPORT_REQUESTS_ICON_KEYS = new Set(["supportRequests"]);

function isSupportRequestsIcon({ navId, iconKey }) {
  return SUPPORT_REQUESTS_NAV_IDS.has(navId) || SUPPORT_REQUESTS_ICON_KEYS.has(iconKey);
}

function isNotificationIcon({ navId, iconKey }) {
  return NOTIFICATION_NAV_IDS.has(navId) || NOTIFICATION_ICON_KEYS.has(iconKey);
}

function isProfileIcon({ navId, iconKey }) {
  return PROFILE_NAV_IDS.has(navId) || PROFILE_ICON_KEYS.has(iconKey);
}

function isAuditLogsIcon({ navId, iconKey }) {
  return AUDIT_LOGS_NAV_IDS.has(navId) || AUDIT_LOGS_ICON_KEYS.has(iconKey);
}

function isUsersIcon({ navId, iconKey }) {
  return USERS_NAV_IDS.has(navId) || USERS_ICON_KEYS.has(iconKey);
}

function getAdminSidebarIconSrc({ navId, iconKey }) {
  return ADMIN_SIDEBAR_ICON_ASSETS[navId]
    ?? ADMIN_SIDEBAR_ICON_ASSETS[iconKey]
    ?? descriptionIcon;
}

export function AdminNavIcon({ navId, iconKey, size = 18 }) {
  if (isNotificationIcon({ navId, iconKey })) {
    return (
      <Bell
        size={size}
        strokeWidth={2}
        color={PLATFORM_ICON_BLUE}
        aria-hidden="true"
      />
    );
  }

  if (isProfileIcon({ navId, iconKey })) {
    return (
      <User
        size={size}
        strokeWidth={2}
        color={PLATFORM_ICON_BLUE}
        aria-hidden="true"
      />
    );
  }

  if (isAuditLogsIcon({ navId, iconKey })) {
    return (
      <History
        size={size}
        strokeWidth={2}
        color={PLATFORM_ICON_BLUE}
        aria-hidden="true"
      />
    );
  }

  if (isUsersIcon({ navId, iconKey })) {
    return (
      <Users
        size={size}
        strokeWidth={2}
        color={PLATFORM_ICON_BLUE}
        aria-hidden="true"
      />
    );
  }

  if (isSupportRequestsIcon({ navId, iconKey })) {
    return (
      <LifeBuoy
        size={size}
        strokeWidth={2}
        color={PLATFORM_ICON_BLUE}
        aria-hidden="true"
      />
    );
  }

  const src = getAdminSidebarIconSrc({ navId, iconKey });
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pd-platform-icon"
      style={{ width: size, height: size }}
    />
  );
}
