import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

const TYPE_TO_ICON_KEY = {
  calendar: "calendarDays",
  report: "report",
  message: "message",
  feedback: "message",
};

export function PlatformNotificationIcon({ type, size = 16 }) {
  const iconKey = TYPE_TO_ICON_KEY[type];

  if (iconKey) {
    return <PlatformMaterialIcon icon={iconKey} size={size} />;
  }

  return <PlatformMaterialIcon icon="notifications" size={size} />;
}