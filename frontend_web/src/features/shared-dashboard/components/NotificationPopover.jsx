import { useEffect, useId, useRef } from "react";
import { Bell } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { PlatformNotificationIcon } from "./PlatformNotificationIcon";

function NotifIcon({ type }) {
  return <PlatformNotificationIcon type={type} size={14} />;
}

export function NotificationPopover({
  open,
  onOpenChange,
  notifications = [],
  badgeCount = 0,
  isLoading = false,
  error = null,
  onSelect,
  onViewAll,
}) {
  const { t } = useLocale();
  const rootRef = useRef(null);
  const menuId = useId();
  const visible = notifications.slice(0, 3);
  const showBadge = !isLoading && !error && badgeCount > 0;
  const triggerAriaLabel = showBadge
    ? t("header.notificationsUnreadAriaLabel", { count: badgeCount })
    : t("header.notificationsAriaLabel");

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="pd-notif-popover" ref={rootRef}>
      <button
        type="button"
        className="pd-icon-btn"
        aria-label={triggerAriaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => onOpenChange(!open)}
      >
        <Bell size={18} aria-hidden="true" />
        {showBadge ? (
          <span className="pd-icon-badge" aria-hidden="true">
            {badgeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          className="pd-dropdown pd-notif-dropdown"
          role="dialog"
          aria-label={t("notifications.recentAriaLabel")}
        >
          <div className="pd-notif-dropdown-head">
            <strong>{t("notifications.title")}</strong>
          </div>
          {isLoading ? (
            <p className="pd-inline-loading pd-notif-dropdown-state">{t("notifications.loading")}</p>
          ) : null}
          {!isLoading && error ? (
            <p className="pd-inline-error pd-notif-dropdown-state">{error}</p>
          ) : null}
          {!isLoading && !error && visible.length === 0 ? (
            <p className="pd-notif-dropdown-state">{t("notifications.empty")}</p>
          ) : null}
          {!isLoading && !error && visible.length > 0 ? (
          <ul className="pd-notif-dropdown-list">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`pd-notif-item${item.unread ? " is-unread" : ""}`}
                  onClick={() => {
                    onSelect?.(item);
                    onOpenChange(false);
                  }}
                >
                  <span className={`pd-notif-icon pd-tone-${item.tone}`} aria-hidden="true">
                    <NotifIcon type={item.icon} />
                  </span>
                  <span className="pd-notif-copy">
                    <strong dir="auto">{item.title}</strong>
                    <small dir="auto">{item.timeAgo}</small>
                  </span>
                  {item.unread ? <span className="pd-unread-dot" aria-hidden="true" /> : null}
                </button>
              </li>
            ))}
          </ul>
          ) : null}
          <button
            type="button"
            className="pd-notif-view-all"
            onClick={() => {
              onViewAll?.();
              onOpenChange(false);
            }}
          >
            {t("notifications.viewAll")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
