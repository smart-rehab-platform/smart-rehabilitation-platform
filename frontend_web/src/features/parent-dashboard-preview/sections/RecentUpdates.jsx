import { PlatformNotificationIcon } from "../components/PlatformNotificationIcon";

function toneForIcon(type) {
  switch (type) {
    case "calendar":
      return "green";
    case "report":
      return "gray";
    case "feedback":
    default:
      return "blue";
  }
}

export function RecentUpdates({ updates = [], onItemAction, onViewAll }) {
  return (
    <section className="pd-card pd-card-pad pd-recent-updates">
      <div className="pd-card-header">
        <h2 className="pd-section-title">Recent Updates</h2>
        <button type="button" className="pd-link" onClick={onViewAll}>
          View All
        </button>
      </div>

      <ul className="pd-updates-list">
        {updates.slice(0, 3).map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`pd-update-row${item.unread ? " is-unread" : ""}`}
              onClick={() => onItemAction?.(item)}
            >
              <span
                className={`pd-notif-icon pd-tone-${toneForIcon(item.icon)}`}
                aria-hidden="true"
              >
                <PlatformNotificationIcon
                  type={item.icon === "feedback" ? "message" : item.icon}
                  size={14}
                />
              </span>
              <span className="pd-notif-copy">
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </span>
              {item.unread ? <span className="pd-unread-dot" aria-label="Unread" /> : null}
              <span className="pd-update-action">{item.actionLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
