import { Bell, User } from "lucide-react";
import { getParentSidebarIconSrc } from "../constants/parentSidebarIconAssets";

const PLATFORM_ICON_BLUE = "#4FA6F8";

/** Landing JourneySection + Flutter notifications_none */
const NOTIFICATION_NAV_IDS = new Set(["notifications"]);
const NOTIFICATION_ICON_KEYS = new Set(["bell", "notifications"]);

/** Flutter Icons.person_outline_rounded — no downloaded person SVG in assets */
const PROFILE_NAV_IDS = new Set(["profile"]);
const PROFILE_ICON_KEYS = new Set(["user", "profile"]);

function isNotificationIcon({ navId, iconKey }) {
  return NOTIFICATION_NAV_IDS.has(navId) || NOTIFICATION_ICON_KEYS.has(iconKey);
}

function isProfileIcon({ navId, iconKey }) {
  return PROFILE_NAV_IDS.has(navId) || PROFILE_ICON_KEYS.has(iconKey);
}

export function ParentNavIcon({ navId, iconKey, size = 18 }) {
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

  const src = getParentSidebarIconSrc({ navId, iconKey });

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
