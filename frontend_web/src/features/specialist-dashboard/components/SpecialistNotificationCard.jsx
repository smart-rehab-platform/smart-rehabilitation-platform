import { useMemo } from "react";
import { Bell } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { getSpecialistNotificationsPageLabels } from "../utils/specialistNotificationsLocalization.js";

export function SpecialistNotificationCard({ notification, onSelect }) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistNotificationsPageLabels(t), [t]);
  const metaLabel = `${notification.typeLabel} • ${notification.displayDate}`;

  return (
    <li className="pd-notification-feed-entry">
      <button
        type="button"
        className={`pd-notification-feed-item pd-specialist-notification-card${
          notification.unread ? " is-unread" : ""
        }`}
        onClick={() => onSelect?.(notification)}
        aria-label={notification.unread
          ? pageLabels.unreadNotification(notification.title)
          : pageLabels.notification(notification.title)}
      >
        <span
          className={`pd-notification-feed-icon pd-notif-icon pd-tone-${
            notification.unread ? "blue" : "gray"
          }`}
          aria-hidden="true"
        >
          <Bell size={18} />
        </span>

        <span className="pd-notification-feed-body">
          <strong className="pd-notification-feed-title" dir="auto">{notification.title}</strong>

          {notification.body ? (
            <span className="pd-notification-feed-preview" dir="auto">{notification.body}</span>
          ) : null}

          <span className="pd-notification-feed-meta">{metaLabel}</span>

          {notification.unread ? (
            <span className="pd-sr-only">{pageLabels.unread}</span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
