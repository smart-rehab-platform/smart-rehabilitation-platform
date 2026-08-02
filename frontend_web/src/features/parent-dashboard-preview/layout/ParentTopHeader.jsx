import { Menu, Search } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { ProfileMenu } from "../components/ProfileMenu";
import { NotificationPopover } from "../components/NotificationPopover";

export function ParentTopHeader({
  parent,
  badges,
  notifications = [],
  notificationsOpen = false,
  notificationsLoading = false,
  notificationsError = null,
  onNotificationsOpenChange,
  onOpenMobileNav,
  onMessages,
  onNotificationSelect,
  onViewAllNotifications,
  onViewProfile,
  onSignOut,
}) {
  const messageBadge = badges?.messages;

  return (
    <header className="pd-top-header">
      <button
        type="button"
        className="pd-mobile-menu"
        aria-label="Open navigation menu"
        onClick={onOpenMobileNav}
      >
        <Menu size={20} />
      </button>

      <label className="pd-search">
        <Search size={16} aria-hidden="true" />
        <span className="pd-sr-only">Search</span>
        <input
          type="search"
          placeholder="Search exercises, reports, sessions..."
          aria-label="Search exercises, reports, sessions"
        />
      </label>

      <div className="pd-header-actions">
        <button
          type="button"
          className="pd-icon-btn"
          aria-label={`Messages${messageBadge ? `, ${messageBadge} unread` : ""}`}
          onClick={onMessages}
        >
          <PlatformMaterialIcon icon="messageSquare" size={18} />
          {messageBadge ? (
            <span className="pd-icon-badge" aria-hidden="true">
              {messageBadge}
            </span>
          ) : null}
        </button>

        <NotificationPopover
          open={notificationsOpen}
          onOpenChange={onNotificationsOpenChange}
          notifications={notifications}
          badgeCount={badges?.notifications ?? 0}
          isLoading={notificationsLoading}
          error={notificationsError}
          onSelect={onNotificationSelect}
          onViewAll={onViewAllNotifications}
        />

        <ProfileMenu
          parent={parent}
          onViewProfile={onViewProfile}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
