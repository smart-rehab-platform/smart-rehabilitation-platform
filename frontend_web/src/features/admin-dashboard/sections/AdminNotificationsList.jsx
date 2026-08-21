import { AdminNotificationCard } from "../components/AdminNotificationCard";

export function AdminNotificationsList({
  notifications = [],
  labels,
  updatingNotificationId = null,
  onMarkAsRead,
}) {
  return (
    <div className="pd-notification-feed-panel pd-section-enter">
      <ul className="pd-notification-feed" aria-label={labels.listAriaLabel}>
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
    </div>
  );
}
