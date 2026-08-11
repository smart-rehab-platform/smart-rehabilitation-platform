import { DashboardTopHeader } from "../../shared-dashboard/layout/DashboardTopHeader";
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
    <DashboardTopHeader
      onOpenMobileNav={onOpenMobileNav}
      searchPlaceholder="Search exercises, reports, sessions..."
      searchAriaLabel="Search exercises, reports, sessions"
      onMessages={onMessages}
      messagesBadge={messageBadge ?? null}
      notificationPopover={
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
      }
      profileMenu={
        <ProfileMenu
          parent={parent}
          onViewProfile={onViewProfile}
          onSignOut={onSignOut}
        />
      }
    />
  );
}
