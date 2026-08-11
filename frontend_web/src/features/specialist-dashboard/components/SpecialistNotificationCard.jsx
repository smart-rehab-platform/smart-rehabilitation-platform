import { Bell } from "lucide-react";

export function SpecialistNotificationCard({ notification, onSelect }) {
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
          ? `Unread notification: ${notification.title}`
          : `Notification: ${notification.title}`}
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
          <strong className="pd-notification-feed-title">{notification.title}</strong>

          {notification.body ? (
            <span className="pd-notification-feed-preview">{notification.body}</span>
          ) : null}

          <span className="pd-notification-feed-meta">{metaLabel}</span>

          {notification.unread ? (
            <span className="pd-sr-only">Unread</span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
