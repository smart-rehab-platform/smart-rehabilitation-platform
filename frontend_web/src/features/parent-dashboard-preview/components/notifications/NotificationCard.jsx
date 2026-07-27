import { Bell, CalendarDays, ChevronRight, FileText, MessageCircle } from "lucide-react";

function NotificationIcon({ iconType }) {
  switch (iconType) {
    case "calendar":
      return <CalendarDays size={18} aria-hidden="true" />;
    case "report":
      return <FileText size={18} aria-hidden="true" />;
    case "message":
      return <MessageCircle size={18} aria-hidden="true" />;
    default:
      return <Bell size={18} aria-hidden="true" />;
  }
}

export function NotificationCard({ notification, onSelect }) {
  const metaParts = [
    notification.typeLabel,
    notification.childName ? notification.childName : null,
  ].filter(Boolean);

  const timeLabel = notification.displayDate || notification.timeAgo;

  const handleClick = () => {
    onSelect?.(notification);
  };

  return (
    <li className="pd-notification-feed-entry">
      <button
        type="button"
        className={`pd-notification-feed-item${notification.unread ? " is-unread" : ""}`}
        onClick={handleClick}
        aria-label={notification.unread
          ? `Unread notification: ${notification.title}`
          : `Notification: ${notification.title}`}
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
            <span className="pd-notification-feed-preview">{notification.body}</span>
          ) : null}

          {metaParts.length > 0 ? (
            <span className="pd-notification-feed-meta">{metaParts.join(" · ")}</span>
          ) : null}

          {notification.unread ? (
            <span className="pd-sr-only">Unread</span>
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
