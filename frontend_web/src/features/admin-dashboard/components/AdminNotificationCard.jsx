import { ChevronRight, LoaderCircle } from "lucide-react";
import { PlatformNotificationIcon } from "../../shared-dashboard/components/PlatformNotificationIcon";

function NotificationFeedContent({
  notification,
  labels,
  unread,
  isUpdating,
  showChevron = false,
}) {
  const metaLabel = notification.metaLabel;
  const timeLabel = notification.displayDate;

  return (
    <>
      <span
        className={`pd-notification-feed-icon pd-notif-icon pd-tone-${unread ? "blue" : "gray"}`}
        aria-hidden="true"
      >
        <PlatformNotificationIcon type="notifications" size={18} />
      </span>

      <span className="pd-notification-feed-body">
        <span className="pd-notification-feed-title-row">
          <strong className="pd-notification-feed-title" dir="auto">{notification.title}</strong>
          {unread ? (
            <span className="pd-unread-dot" aria-hidden="true" />
          ) : null}
        </span>

        {notification.body ? (
          <span className="pd-notification-feed-preview" dir="auto">{notification.body}</span>
        ) : null}

        {metaLabel ? (
          <span className="pd-notification-feed-meta">{metaLabel}</span>
        ) : null}

        {unread ? (
          <span className="pd-sr-only">{labels.unread}</span>
        ) : null}
      </span>

      <span className="pd-notification-feed-aside" aria-hidden={isUpdating ? undefined : "true"}>
        {isUpdating ? (
          <span className="pd-admin-notif-updating" aria-live="polite">
            <LoaderCircle size={16} className="pd-admin-notif-spinner" aria-hidden="true" />
            <span className="pd-sr-only">{labels.markingAsRead}</span>
          </span>
        ) : null}
        {!isUpdating && timeLabel ? (
          <time className="pd-notification-feed-time">{timeLabel}</time>
        ) : null}
        {!isUpdating && showChevron ? (
          <ChevronRight size={16} className="pd-notification-feed-chevron" aria-hidden="true" />
        ) : null}
      </span>
    </>
  );
}

export function AdminNotificationCard({
  notification,
  labels,
  isUpdating = false,
  onMarkAsRead,
}) {
  const unread = !notification.isRead;

  if (!unread) {
    return (
      <li className="pd-notification-feed-entry">
        <article
          className="pd-notification-feed-item"
          aria-label={labels.notification(notification.title)}
        >
          <NotificationFeedContent
            notification={notification}
            labels={labels}
            unread={false}
            isUpdating={false}
            showChevron={false}
          />
        </article>
      </li>
    );
  }

  return (
    <li className="pd-notification-feed-entry">
      <button
        type="button"
        className="pd-notification-feed-item is-unread"
        onClick={() => onMarkAsRead?.(notification.id)}
        disabled={isUpdating}
        aria-label={labels.unreadNotification(notification.title)}
      >
        <NotificationFeedContent
          notification={notification}
          labels={labels}
          unread
          isUpdating={isUpdating}
          showChevron
        />
      </button>
    </li>
  );
}
