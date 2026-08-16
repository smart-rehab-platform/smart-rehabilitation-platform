import { useLocale } from "../../../context/useLocale.js";
import { PlatformNotificationIcon } from "../components/PlatformNotificationIcon";

export function RecentNotificationsCard({ notifications, onMarkRead, onViewAll }) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-equal-card">
      <div className="pd-card-header">
        <h2 className="pd-section-title">{t("parent.home.recentNotifications.title")}</h2>
      </div>

      <ul className="pd-notif-list">
        {notifications.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`pd-notif-item${item.unread ? " is-unread" : ""}`}
              onClick={() => onMarkRead(item.id)}
              aria-label={`${item.title}. ${item.timeAgo}.${item.unread ? ` ${t("parent.home.recentNotifications.unreadActivate")}` : ""}`}
            >
              <span className={`pd-notif-icon pd-tone-${item.tone}`} aria-hidden="true">
                <PlatformNotificationIcon type={item.icon} size={16} />
              </span>
              <span className="pd-notif-copy">
                <strong>{item.title}</strong>
                <small>{item.timeAgo}</small>
              </span>
              {item.unread ? <span className="pd-unread-dot" aria-hidden="true" /> : null}
            </button>
          </li>
        ))}
      </ul>

      <div className="pd-card-footer">
        <span />
        <button type="button" className="pd-link" onClick={onViewAll}>
          {t("parent.home.recentNotifications.viewAll")} →
        </button>
      </div>
    </section>
  );
}
