import { useEffect, useId, useRef } from "react";
import { Bell, LoaderCircle } from "lucide-react";
import { PlatformNotificationIcon } from "../../shared-dashboard/components/PlatformNotificationIcon";

const PREVIEW_LIMIT = 5;

function NotifIcon({ type }) {
  return <PlatformNotificationIcon type={type} size={14} />;
}

export function AdminNotificationPopover({
  open,
  onOpenChange,
  labels,
  notifications = [],
  badgeCount = 0,
  unreadCount = 0,
  isLoading = false,
  error = null,
  mutationError = null,
  isUpdating = false,
  updatingNotificationId = null,
  onSelect,
  onViewAll,
  onMarkAllAsRead,
  onRetry,
}) {
  const rootRef = useRef(null);
  const menuId = useId();
  const visible = notifications.slice(0, PREVIEW_LIMIT);
  const showBadge = !isLoading && !error && badgeCount > 0;
  const badgeLabel = badgeCount > 9 ? "9+" : String(badgeCount);

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

  const handleSelect = async (item) => {
    if (!item?.unread || updatingNotificationId === item.id || isUpdating) {
      return;
    }

    await onSelect?.(item);
  };

  return (
    <div className="pd-notif-popover" ref={rootRef}>
      <button
        type="button"
        className="pd-icon-btn"
        aria-label={labels.triggerAria(badgeCount)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => onOpenChange(!open)}
      >
        <Bell size={18} aria-hidden="true" />
        {showBadge ? (
          <span className="pd-icon-badge" aria-hidden="true">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          className="pd-dropdown pd-notif-dropdown"
          role="dialog"
          aria-label={labels.dialogAriaLabel}
        >
          <div className="pd-notif-dropdown-head">
            <strong>{labels.title}</strong>
            {unreadCount > 0 && onMarkAllAsRead ? (
              <button
                type="button"
                className="pd-link"
                onClick={() => onMarkAllAsRead()}
                disabled={isUpdating}
              >
                {labels.markAllRead}
              </button>
            ) : null}
          </div>

          {mutationError ? (
            <p className="pd-inline-error pd-notif-dropdown-state" role="alert">
              {mutationError}
            </p>
          ) : null}

          {isLoading ? (
            <p className="pd-inline-loading pd-notif-dropdown-state">{labels.loading}</p>
          ) : null}

          {!isLoading && error ? (
            <div className="pd-notif-dropdown-state">
              <p className="pd-inline-error">{error}</p>
              {onRetry ? (
                <button
                  type="button"
                  className="pd-btn pd-btn-soft pd-btn-sm"
                  onClick={onRetry}
                >
                  {labels.retry}
                </button>
              ) : null}
            </div>
          ) : null}

          {!isLoading && !error && visible.length === 0 ? (
            <p className="pd-notif-dropdown-state">{labels.empty}</p>
          ) : null}

          {!isLoading && !error && visible.length > 0 ? (
            <ul className="pd-notif-dropdown-list">
              {visible.map((item) => {
                const isItemUpdating = updatingNotificationId === item.id;
                const isUnread = Boolean(item.unread);

                if (!isUnread) {
                  return (
                    <li key={item.id}>
                      <div
                        className="pd-notif-item"
                        aria-label={labels.notification(item.title)}
                      >
                        <span className={`pd-notif-icon pd-tone-${item.tone}`} aria-hidden="true">
                          <NotifIcon type={item.icon} />
                        </span>
                        <span className="pd-notif-copy">
                          <strong dir="auto">{item.title}</strong>
                          {item.body ? <small dir="auto">{item.body}</small> : null}
                          <small>{item.timeAgo}</small>
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="pd-notif-item is-unread"
                      onClick={() => handleSelect(item)}
                      disabled={isItemUpdating || isUpdating}
                      aria-label={labels.unreadNotification(item.title)}
                    >
                      <span className={`pd-notif-icon pd-tone-${item.tone}`} aria-hidden="true">
                        <NotifIcon type={item.icon} />
                      </span>
                      <span className="pd-notif-copy">
                        <strong dir="auto">{item.title}</strong>
                        {item.body ? <small dir="auto">{item.body}</small> : null}
                        <small>{item.timeAgo}</small>
                      </span>
                      {isItemUpdating ? (
                        <LoaderCircle size={14} className="pd-admin-notif-spinner" aria-hidden="true" />
                      ) : (
                        <span className="pd-unread-dot" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
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
            {labels.viewAll}
          </button>
        </div>
      ) : null}
    </div>
  );
}
