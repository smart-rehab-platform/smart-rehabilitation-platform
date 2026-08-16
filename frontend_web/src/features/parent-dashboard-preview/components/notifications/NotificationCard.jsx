import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { PlatformNotificationIcon } from "../PlatformNotificationIcon";

function NotificationIcon({ iconType }) {
  return <PlatformNotificationIcon type={iconType} size={18} />;
}

export function NotificationCard({ notification, onSelect }) {
  const { t } = useLocale();

  const metaParts = [
    notification.typeLabel,
    notification.childName ? notification.childName : null,
  ].filter(Boolean);

  const timeLabel = notification.displayDate || notification.timeAgo;

  const handleClick = () => {
    onSelect?.(notification);
  };

  const ariaLabel = notification.unread
    ? t("parent.notificationsPage.unreadNotificationAria", { title: notification.title })
    : t("parent.notificationsPage.notificationAria", { title: notification.title });

  return (
    <li className="pd-notification-feed-entry">
      <button
        type="button"
        className={`pd-notification-feed-item${notification.unread ? " is-unread" : ""}`}
        onClick={handleClick}
        aria-label={ariaLabel}
      >
        <span
          className={`pd-notification-feed-icon pd-notif-icon pd-tone-${notification.tone}`}
          aria-hidden="true"
        >
          <NotificationIcon iconType={notification.icon} />
        </span>

        <span className="pd-notification-feed-body">
          <span className="pd-notification-feed-title-row">
            <strong className="pd-notification-feed-title">{notification.title}</strong>
            {notification.unread ? (
              <span className="pd-unread-dot" aria-hidden="true" />
            ) : null}
          </span>

          {notification.body ? (
            <span className="pd-notification-feed-preview" dir="auto">{notification.body}</span>
          ) : null}

          {metaParts.length > 0 ? (
            <span className="pd-notification-feed-meta">{metaParts.join(" · ")}</span>
          ) : null}

          {notification.unread ? (
            <span className="pd-sr-only">{t("parent.common.filters.unread")}</span>
          ) : null}
        </span>

        <span className="pd-notification-feed-aside" aria-hidden="true">
          {timeLabel ? (
            <time className="pd-notification-feed-time">{timeLabel}</time>
          ) : null}
          <ChevronRight size={16} className="pd-notification-feed-chevron" aria-hidden="true" />
        </span>
      </button>
    </li>
  );
}
