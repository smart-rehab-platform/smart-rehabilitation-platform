import { Bell, BellRing, LoaderCircle } from "lucide-react";

export function AdminNotificationCard({
  notification,
  labels,
  isUpdating = false,
  onMarkAsRead,
}) {
  const unread = !notification.isRead;
  const metaLabel = notification.metaLabel;
  const Icon = unread ? BellRing : Bell;

  const className = [
    "pd-admin-notif-item",
    unread ? "is-unread" : "is-read",
    isUpdating ? "is-updating" : "",
  ].filter(Boolean).join(" ");

  const content = (
    <>
      <span
        className={`pd-admin-notif-icon${unread ? " is-active" : " is-muted"}`}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={2.1} />
      </span>

      <span className="pd-admin-notif-copy">
        <span className="pd-admin-notif-title" dir="auto">{notification.title}</span>

        {notification.body ? (
          <span className="pd-admin-notif-body" dir="auto">{notification.body}</span>
        ) : null}

        <span className="pd-admin-notif-meta">{metaLabel}</span>
      </span>

      {unread ? (
        <span className="pd-admin-notif-unread-dot" aria-hidden="true" />
      ) : null}

      {isUpdating ? (
        <span className="pd-admin-notif-updating" aria-live="polite">
          <LoaderCircle size={16} className="pd-admin-notif-spinner" aria-hidden="true" />
          <span className="pd-sr-only">{labels.markingAsRead}</span>
        </span>
      ) : null}
    </>
  );

  if (!unread) {
    return (
      <li className="pd-admin-notif-entry">
        <article
          className={className}
          aria-label={labels.notification(notification.title)}
        >
          {content}
        </article>
      </li>
    );
  }

  return (
    <li className="pd-admin-notif-entry">
      <button
        type="button"
        className={className}
        onClick={() => onMarkAsRead?.(notification.id)}
        disabled={isUpdating}
        aria-label={labels.unreadNotification(notification.title)}
      >
        {content}
      </button>
    </li>
  );
}
