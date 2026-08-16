import { useLocale } from "../../../context/useLocale.js";
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
  const { t } = useLocale();
  const messageBadge = badges?.messages;

  return (
    <DashboardTopHeader
      onOpenMobileNav={onOpenMobileNav}
      searchPlaceholder={t("parent.header.searchPlaceholder")}
      searchAriaLabel={t("parent.header.searchAriaLabel")}
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
