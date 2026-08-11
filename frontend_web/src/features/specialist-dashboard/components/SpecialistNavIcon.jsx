import { Bell, User } from "lucide-react";
import calendarMonthIcon from "../../../assets/icons/calendar-month.svg";
import clipboardCheckMultipleIcon from "../../../assets/icons/clipboard-check-multiple.svg";
import descriptionIcon from "../../../assets/icons/description.svg";
import dumbbellIcon from "../../../assets/icons/dumbbell.svg";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import homeIcon from "../../../assets/icons/home.svg";
import medicalServicesIcon from "../../../assets/icons/medical_services.svg";
import messageIcon from "../../../assets/icons/message.svg";
import neurologyIcon from "../../../assets/icons/neurology.svg";

const PLATFORM_ICON_BLUE = "#4FA6F8";

const SPECIALIST_SIDEBAR_ICON_ASSETS = {
  dashboard: homeIcon,
  patients: familyRestroomIcon,
  exercises: dumbbellIcon,
  sessions: calendarMonthIcon,
  reviews: clipboardCheckMultipleIcon,
  treatmentPlans: medicalServicesIcon,
  reports: descriptionIcon,
  messages: messageIcon,
  ai: neurologyIcon,
};

const NOTIFICATION_NAV_IDS = new Set(["notifications"]);
const NOTIFICATION_ICON_KEYS = new Set(["notifications"]);

const PROFILE_NAV_IDS = new Set(["profile"]);
const PROFILE_ICON_KEYS = new Set(["profile"]);

function isNotificationIcon({ navId, iconKey }) {
  return NOTIFICATION_NAV_IDS.has(navId) || NOTIFICATION_ICON_KEYS.has(iconKey);
}

function isProfileIcon({ navId, iconKey }) {
  return PROFILE_NAV_IDS.has(navId) || PROFILE_ICON_KEYS.has(iconKey);
}

function getSpecialistSidebarIconSrc({ navId, iconKey }) {
  return SPECIALIST_SIDEBAR_ICON_ASSETS[navId]
    ?? SPECIALIST_SIDEBAR_ICON_ASSETS[iconKey]
    ?? homeIcon;
}

export function SpecialistNavIcon({ navId, iconKey, size = 18 }) {
  if (isNotificationIcon({ navId, iconKey })) {
    return (
      <Bell
        size={size}
        strokeWidth={2}
        color="#79C7FF"
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

  const src = getSpecialistSidebarIconSrc({ navId, iconKey });

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
