import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import smartRehabIcon from "../../../assets/branding/smart_rehab_icon.png";
import { resolveSpecialistSidebarActiveId } from "../../../routes/specialistDashboardRoutes";
import { NotificationPopover } from "../../shared-dashboard/components/NotificationPopover";
import { ProfileMenu } from "../../shared-dashboard/components/ProfileMenu";
import { DashboardShell } from "../../shared-dashboard/layout/DashboardShell";
import { DashboardSidebar } from "../../shared-dashboard/layout/DashboardSidebar";
import { DashboardTopHeader } from "../../shared-dashboard/layout/DashboardTopHeader";
import { SpecialistNavIcon } from "../components/SpecialistNavIcon";

export function SpecialistDashboardShell({
  collapsed,
  mobileOpen,
  navItems,
  badges,
  user,
  notifications = [],
  notificationsOpen,
  onNotificationsOpenChange,
  notificationsLoading = false,
  notificationsError = null,
  notificationBadgeCount = 0,
  onToggleCollapse,
  onOpenMobileNav,
  onCloseMobile,
  onNavAction,
  onSignOut,
  onViewProfile,
  onMessages,
  onViewAllNotifications,
  onNotificationSelect,
  showToast,
  children,
}) {
  const { pathname } = useLocation();
  const activeNavId = resolveSpecialistSidebarActiveId(pathname);

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
          navigationAriaLabel="Specialist navigation"
          logoSrc={smartRehabIcon}
          brandTitle="Smart Rehabilitation"
          brandSubtitle="Where Recovery Never Stops"
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          onNavAction={onNavAction}
          onSignOut={onSignOut}
          renderNavIcon={(item) => (
            <SpecialistNavIcon navId={item.id} iconKey={item.icon} size={18} />
          )}
          supportSlot={
            <div className="pd-help-card">
              <strong>Help & Support</strong>
              <p>Questions about patients or sessions?</p>
              <button
                type="button"
                className="pd-link"
                onClick={() => showToast?.("Contact support is not available on web yet.")}
              >
                Contact Support →
              </button>
            </div>
          }
          signOutIcon={<LogOut size={18} aria-hidden="true" />}
          signOutLabel="Sign Out"
        />
      }
      header={
        <DashboardTopHeader
          onOpenMobileNav={onOpenMobileNav}
          searchPlaceholder="Search patients, sessions, reports..."
          searchAriaLabel="Search patients, sessions, reports"
          onMessages={onMessages}
          messagesBadge={badges?.messages ?? null}
          notificationPopover={
            <NotificationPopover
              open={notificationsOpen}
              onOpenChange={onNotificationsOpenChange}
              notifications={notifications}
              badgeCount={notificationBadgeCount}
              isLoading={notificationsLoading}
              error={notificationsError}
              onSelect={onNotificationSelect}
              onViewAll={onViewAllNotifications}
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
