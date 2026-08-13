import { useCallback, useMemo } from "react";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import smartRehabIcon from "../../../assets/branding/smart_rehab_icon.png";
import { resolveAdminSidebarActiveId } from "../../../routes/adminDashboardRoutes";
import { ProfileMenu } from "../../shared-dashboard/components/ProfileMenu";
import { DashboardShell } from "../../shared-dashboard/layout/DashboardShell";
import { DashboardSidebar } from "../../shared-dashboard/layout/DashboardSidebar";
import { DashboardTopHeader } from "../../shared-dashboard/layout/DashboardTopHeader";
import { AdminNavIcon } from "../components/AdminNavIcon";
import { AdminHeaderSearch } from "../components/AdminHeaderSearch";
import { AdminNotificationPopover } from "../components/AdminNotificationPopover";
import { AdminNotificationsProvider } from "../context/AdminNotificationsContext";
import { useAdminNotificationsContext } from "../context/adminNotificationsContextValue";
import { mapAdminNotificationsForPopover } from "../utils/adminNotificationsMappers";

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
    if (!id || item?.unread === false) {
      return true;
    }

    return markAsRead(id);
  }, [markAsRead]);

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
          navigationAriaLabel="Admin navigation"
          logoSrc={smartRehabIcon}
          brandTitle="Smart Rehabilitation"
          brandSubtitle="Where Recovery Never Stops"
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          onNavAction={onNavAction}
          onSignOut={onSignOut}
          renderNavIcon={(item) => (
            <AdminNavIcon navId={item.id} iconKey={item.icon} size={18} />
          )}
          signOutIcon={<LogOut size={18} aria-hidden="true" />}
          signOutLabel="Sign Out"
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
