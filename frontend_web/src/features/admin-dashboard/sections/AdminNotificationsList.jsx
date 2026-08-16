import { AdminNotificationCard } from "../components/AdminNotificationCard";

function SkeletonRows() {
  return (
    <ul className="pd-admin-notif-list" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => (
        <li key={index} className="pd-admin-notif-entry">
          <div className="pd-admin-notif-item pd-admin-notif-item-skeleton">
            <span className="pd-admin-notif-skeleton-icon" />
            <span className="pd-admin-notif-skeleton-copy">
              <span className="pd-admin-notif-skeleton-line is-title" />
              <span className="pd-admin-notif-skeleton-line is-body" />
              <span className="pd-admin-notif-skeleton-line is-meta" />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminNotificationsList({
  notifications = [],
  labels,
  isLoading = false,
  updatingNotificationId = null,
  onMarkAsRead,
}) {
  if (isLoading) {
    return (
      <section
        className="pd-card pd-admin-notif-panel pd-section-enter"
        aria-busy="true"
        aria-label={labels.listLoadingAriaLabel}
      >
        <SkeletonRows />
      </section>
    );
  }

  return (
    <section
      className="pd-card pd-admin-notif-panel pd-section-enter"
      aria-label={labels.listAriaLabel}
    >
      <ul className="pd-admin-notif-list">
        {notifications.map((notification) => (
          <AdminNotificationCard
            key={notification.id}
            notification={notification}
            labels={labels}
            isUpdating={updatingNotificationId === notification.id}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </ul>
    </section>
  );
}
