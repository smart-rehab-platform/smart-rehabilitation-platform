import { useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { useAdminDashboardHome } from "./hooks/useAdminDashboardHome";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminSystemActivity } from "./hooks/useAdminSystemActivity";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminGreeting } from "./sections/AdminGreeting";
import { AdminQuickActions } from "./sections/AdminQuickActions";
import { AdminRecentUsers } from "./sections/AdminRecentUsers";
import { AdminSummaryStrip } from "./sections/AdminSummaryStrip";
import { AdminSystemAnalytics } from "./sections/AdminSystemAnalytics";
import { mapAdminFromAuth } from "./utils/adminDashboardUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";

function getGreetingName(user) {
  const mapped = mapAdminFromAuth(user);
  const fullName = mapped.fullName?.trim();
  return fullName || "Admin";
}

export default function AdminDashboardPage() {
  const { user, isInitializing } = useAuth();
  const adminUserId = isInitializing ? null : user?.id ?? null;

  const {
    adminUser,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    navigateToRouteKey,
    handleSignOut,
    handleViewProfile,
    handleViewAllNotifications,
    handleSidebarNav,
  } = useAdminShell();

  const greetingName = useMemo(() => getGreetingName(user), [user]);

  const {
    overview,
    recentUsers,
    isLoading: isHomeLoading,
    error: homeError,
    reload: reloadHome,
  } = useAdminDashboardHome(adminUserId);

  const {
    activity,
    weekOffset,
    periodLabel,
    isLoading: isActivityLoading,
    error: activityError,
    canGoForward,
    showPreviousWeek,
    showNextWeek,
    selectPreset,
    reload: reloadActivity,
  } = useAdminSystemActivity(adminUserId);

  return (
    <div className="pd-preview">
      <AdminDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={adminUser}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onViewAllNotifications={handleViewAllNotifications}
        showToast={showToast}
      >
        <AdminGreeting name={greetingName} />

        {homeError ? (
          <div className="pd-admin-home-error pd-section-enter">
            <p className="pd-inline-error">{homeError}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={reloadHome}>
              Retry
            </button>
          </div>
        ) : (
          <AdminSummaryStrip
            overview={overview}
            isLoading={isHomeLoading}
            onNavigate={navigateToRouteKey}
          />
        )}

        <div className="pd-admin-content-grid pd-section-enter">
          <div className="pd-admin-main-column">
            <AdminSystemAnalytics
              activity={activity}
              periodLabel={periodLabel}
              weekOffset={weekOffset}
              isLoading={isActivityLoading}
              error={activityError}
              canGoForward={canGoForward}
              onPreviousWeek={showPreviousWeek}
              onNextWeek={showNextWeek}
              onPresetSelected={selectPreset}
              onRetry={reloadActivity}
            />
          </div>

          <div className="pd-admin-side-column">
            <AdminQuickActions
              onPatientAssignments={() => navigateToRouteKey("patientAssignments")}
            />

            <AdminRecentUsers
              users={recentUsers}
              isLoading={isHomeLoading && !homeError}
              onSeeAll={() => navigateToRouteKey("users")}
            />
          </div>
        </div>
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
