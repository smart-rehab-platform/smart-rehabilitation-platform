import { useLocation } from "react-router-dom";
import { resolveParentSidebarActiveId } from "../../../routes/parentDashboardRoutes";
import "../../shared-dashboard/styles/dashboardTokens.css";
import { DashboardShell } from "../../shared-dashboard/layout/DashboardShell";
import { useParentNavItems } from "../hooks/useParentNavItems";
import { ParentSidebar } from "./ParentSidebar";
import { ParentTopHeader } from "./ParentTopHeader";

export function ParentDashboardShell({
  collapsed,
  mobileOpen,
  badges,
  parent,
  notifications,
  notificationsOpen,
  onNotificationsOpenChange,
  notificationsLoading = false,
  notificationsError = null,
  onNotificationSelect,
  onViewAllNotifications,
  onToggleCollapse,
  onOpenMobileNav,
  onCloseMobile,
  onNavAction,
  onSignOut,
  onViewProfile,
  onMessages,
  children,
}) {
  const { pathname } = useLocation();
  const activeNavId = resolveParentSidebarActiveId(pathname);
  const navItems = useParentNavItems();

  return (
    <DashboardShell
      collapsed={collapsed}
      sidebar={
        <ParentSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          navItems={navItems}
          badges={badges}
          activeId={activeNavId}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          onNavAction={onNavAction}
          onSignOut={onSignOut}
        />
      }
      header={
        <ParentTopHeader
          parent={parent}
          badges={badges}
          notifications={notifications}
          notificationsOpen={notificationsOpen}
          onNotificationsOpenChange={onNotificationsOpenChange}
          notificationsLoading={notificationsLoading}
          notificationsError={notificationsError}
          onOpenMobileNav={onOpenMobileNav}
          onMessages={onMessages}
          onNotificationSelect={onNotificationSelect}
          onViewAllNotifications={onViewAllNotifications}
          onViewProfile={onViewProfile}
          onSignOut={onSignOut}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
