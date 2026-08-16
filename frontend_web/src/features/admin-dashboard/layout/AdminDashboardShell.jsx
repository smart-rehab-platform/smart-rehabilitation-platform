import { useCallback, useMemo } from "react";
import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import smartRehabIcon from "../../../assets/branding/smart_rehab_icon.png";
import { useLocale } from "../../../context/useLocale.js";
import {
  buildAdminComplaintDetailsPath,
  buildAdminSupportRequestDetailsPath,
  resolveAdminSidebarActiveId,
} from "../../../routes/adminDashboardRoutes";
import { ProfileMenu } from "../../shared-dashboard/components/ProfileMenu";
import { DashboardShell } from "../../shared-dashboard/layout/DashboardShell";
import { DashboardSidebar } from "../../shared-dashboard/layout/DashboardSidebar";
import { DashboardTopHeader } from "../../shared-dashboard/layout/DashboardTopHeader";
import { AdminNavIcon } from "../components/AdminNavIcon";
import { AdminHeaderSearch } from "../components/AdminHeaderSearch";
import { AdminNotificationPopover } from "../components/AdminNotificationPopover";
import { AdminNotificationsProvider } from "../context/AdminNotificationsContext";
import { useAdminNotificationsContext } from "../context/adminNotificationsContextValue";
import { getAdminShellLabels } from "../utils/adminDashboardLocalization.js";
import { getAdminNotificationsPopoverLabels } from "../utils/adminNotificationsLocalization.js";
import { mapAdminNotificationsForPopover, resolveAdminNotificationRoute } from "../utils/adminNotificationsMappers";

function AdminDashboardShellInner({
  collapsed,
  mobileOpen,
  navItems,
  badges,
  user,
  notificationsOpen,
  onNotificationsOpenChange,
  onToggleCollapse,
  onOpenMobileNav,
  onCloseMobile,
  onNavAction,
  onSignOut,
  onViewProfile,
  onViewAllNotifications,
  children,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const shellLabels = useMemo(() => getAdminShellLabels(t), [t]);
  const notificationPopoverLabels = useMemo(
    () => getAdminNotificationsPopoverLabels(t),
    [t],
  );
  const activeNavId = resolveAdminSidebarActiveId(pathname);

  const {
    notifications: fullNotifications,
    unreadCount,
    isLoading,
    error,
    mutationError,
    isUpdating,
    updatingNotificationId,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useAdminNotificationsContext();

  const popoverNotifications = useMemo(
    () => mapAdminNotificationsForPopover(fullNotifications),
    [fullNotifications],
  );

  const notificationBadgeCount = useMemo(() => {
    if (isLoading || error || unreadCount <= 0) {
      return 0;
    }

    return unreadCount;
  }, [isLoading, error, unreadCount]);

  const handleNotificationSelect = useCallback(async (item) => {
    const id = typeof item?.id === "string" ? item.id : "";
    if (!id) {
      return false;
    }

    const fullNotification = fullNotifications.find((entry) => entry.id === id) ?? item;
    const route = resolveAdminNotificationRoute(fullNotification, {
      buildSupportRequestDetailPath: buildAdminSupportRequestDetailsPath,
      buildComplaintDetailPath: buildAdminComplaintDetailsPath,
    });

    let markedRead = true;
    if (item?.unread !== false) {
      markedRead = await markAsRead(id);
    }

    if (route) {
      onNotificationsOpenChange(false);
      navigate(route);
    }

    return markedRead;
  }, [fullNotifications, markAsRead, navigate, onNotificationsOpenChange]);

  return (
    <DashboardShell
      collapsed={collapsed}
      sidebar={
        <DashboardSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          navItems={navItems}
          badges={badges}
          activeId={activeNavId}
          navigationAriaLabel={shellLabels.navigationAriaLabel}
          logoSrc={smartRehabIcon}
          brandTitle={t("specialist.shell.brandTitle")}
          brandSubtitle={t("specialist.shell.brandSubtitle")}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          onNavAction={onNavAction}
          onSignOut={onSignOut}
          renderNavIcon={(item) => (
            <AdminNavIcon navId={item.id} iconKey={item.icon} size={18} />
          )}
          signOutIcon={<LogOut size={18} aria-hidden="true" />}
          signOutLabel={shellLabels.signOutLabel}
        />
      }
      header={
        <DashboardTopHeader
          onOpenMobileNav={onOpenMobileNav}
          searchContent={<AdminHeaderSearch />}
          notificationPopover={
            <AdminNotificationPopover
              open={notificationsOpen}
              onOpenChange={onNotificationsOpenChange}
              labels={notificationPopoverLabels}
              notifications={popoverNotifications}
              badgeCount={notificationBadgeCount}
              unreadCount={unreadCount}
              isLoading={isLoading}
              error={error}
              mutationError={mutationError}
              isUpdating={isUpdating}
              updatingNotificationId={updatingNotificationId}
              onSelect={handleNotificationSelect}
              onViewAll={onViewAllNotifications}
              onMarkAllAsRead={markAllAsRead}
              onRetry={refresh}
            />
          }
          profileMenu={
            <ProfileMenu
              user={user}
              onViewProfile={onViewProfile}
              onSignOut={onSignOut}
            />
          }
        />
      }
    >
      {children}
    </DashboardShell>
  );
}

export function AdminDashboardShell(props) {
  return (
    <AdminNotificationsProvider>
      <AdminDashboardShellInner {...props} />
    </AdminNotificationsProvider>
  );
}
