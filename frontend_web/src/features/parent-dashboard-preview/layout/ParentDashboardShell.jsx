import { useLocation } from "react-router-dom";
import { resolveParentSidebarActiveId } from "../../../routes/parentDashboardRoutes";
import { ParentSidebar } from "./ParentSidebar";
import { ParentTopHeader } from "./ParentTopHeader";

export function ParentDashboardShell({
  collapsed,
  mobileOpen,
  navItems,
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

  return (
    <div className={`pd-shell${collapsed ? " is-collapsed" : ""}`}>
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

      <main className="pd-main">
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
        <div className="pd-content">{children}</div>
      </main>
    </div>
  );
}
