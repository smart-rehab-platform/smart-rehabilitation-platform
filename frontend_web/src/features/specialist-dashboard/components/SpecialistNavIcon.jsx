import { Bell, User } from "lucide-react";
import calendarMonthIcon from "../../../assets/icons/calendar-month.svg";
import clipboardCheckMultipleIcon from "../../../assets/icons/clipboard-check-multiple.svg";
import dumbbellIcon from "../../../assets/icons/dumbbell.svg";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import folderOpenIcon from "../../../assets/icons/folder-open.svg";
import homeIcon from "../../../assets/icons/home.svg";
import medicalServicesIcon from "../../../assets/icons/medical_services.svg";
import messageIcon from "../../../assets/icons/message.svg";

/** Matches fill used by other Specialist sidebar SVG assets (Patients, Messages, etc.). */
const SPECIALIST_SIDEBAR_ICON_COLOR = "#2AA4C9";
const PLATFORM_ICON_BLUE = "#4FA6F8";

const SPECIALIST_SIDEBAR_ICON_ASSETS = {
  dashboard: homeIcon,
  patients: familyRestroomIcon,
  caseRequests: folderOpenIcon,
  exercises: dumbbellIcon,
  sessions: calendarMonthIcon,
  reviews: clipboardCheckMultipleIcon,
  treatmentPlans: medicalServicesIcon,
  messages: messageIcon,
};

const REPORTS_NAV_IDS = new Set(["reports"]);
const REPORTS_ICON_KEYS = new Set(["reports"]);

const NOTIFICATION_NAV_IDS = new Set(["notifications"]);
const NOTIFICATION_ICON_KEYS = new Set(["notifications"]);

const PROFILE_NAV_IDS = new Set(["profile"]);
const PROFILE_ICON_KEYS = new Set(["profile"]);

function isReportsIcon({ navId, iconKey }) {
  return REPORTS_NAV_IDS.has(navId) || REPORTS_ICON_KEYS.has(iconKey);
}

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

/** Same description glyph as reports icon; cyan fill instead of purple baked into description.svg. */
function SpecialistReportsNavIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      width={size}
      height={size}
      fill={SPECIALIST_SIDEBAR_ICON_COLOR}
      className="pd-platform-icon"
      aria-hidden="true"
    >
      <path d="M319.33-246.67h321.34v-66.66H319.33v66.66Zm0-166.66h321.34V-480H319.33v66.67ZM226.67-80q-27 0-46.84-19.83Q160-119.67 160-146.67v-666.66q0-27 19.83-46.84Q199.67-880 226.67-880H574l226 226v507.33q0 27-19.83 46.84Q760.33-80 733.33-80H226.67Zm314-542.67v-190.66h-314v666.66h506.66v-476H540.67Zm-314-190.66v190.66-190.66 666.66-666.66Z" />
    </svg>
  );
}

export function SpecialistNavIcon({ navId, iconKey, size = 18 }) {
  if (isReportsIcon({ navId, iconKey })) {
    return <SpecialistReportsNavIcon size={size} />;
  }

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
