import { SpecialistNotificationCard } from "../components/SpecialistNotificationCard";

export function SpecialistNotificationsList({ notifications, onSelect }) {
  return (
    <div className="pd-notification-feed-panel pd-section-enter">
      <ul className="pd-notification-feed">
        {notifications.map((notification) => (
          <SpecialistNotificationCard
            key={notification.id}
            notification={notification}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}
