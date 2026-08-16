import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import { buildAdminUsersPath } from "../../routes/adminDashboardRoutes.js";
import { useAdminDashboardHome } from "./hooks/useAdminDashboardHome";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminSystemActivity } from "./hooks/useAdminSystemActivity";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminGreeting } from "./sections/AdminGreeting";
import { AdminQuickActions } from "./sections/AdminQuickActions";
import { AdminRecentUsers } from "./sections/AdminRecentUsers";
import { AdminSummaryStrip } from "./sections/AdminSummaryStrip";
import { AdminSystemAnalytics } from "./sections/AdminSystemAnalytics";
import { getAdminDashboardHomeLabels } from "./utils/adminDashboardLocalization.js";
import {
  ADMIN_RECENT_USERS_SECTION_ID,
  scrollToAdminDashboardSection,
} from "./utils/adminDashboardNavigation.js";
import { mapAdminFromAuth } from "./utils/adminDashboardUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";

function getGreetingName(user, t) {
  const mapped = mapAdminFromAuth(user);
  const fullName = mapped.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  return t("roles.admin");
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();
  const { t } = useLocale();
  const homeLabels = useMemo(() => getAdminDashboardHomeLabels(t), [t]);
  const adminUserId = isInitializing ? null : user?.id ?? null;
  const [recentUsersHighlighted, setRecentUsersHighlighted] = useState(false);

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

  const greetingName = useMemo(() => getGreetingName(user, t), [user, t]);

  const handleSummaryNavigate = useCallback((navKey, navOptions) => {
    if (navKey === "users" && navOptions?.role) {
      navigate(buildAdminUsersPath(navOptions.role));
      return;
    }

    navigateToRouteKey(navKey);
  }, [navigate, navigateToRouteKey]);

  const handleScrollToTarget = useCallback((targetId) => {
    const scrolled = scrollToAdminDashboardSection(targetId);
    if (!scrolled || targetId !== ADMIN_RECENT_USERS_SECTION_ID) {
      return;
    }

    setRecentUsersHighlighted(true);
    window.setTimeout(() => {
      setRecentUsersHighlighted(false);
    }, 1500);
  }, []);

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
              {homeLabels.retry}
            </button>
          </div>
        ) : (
          <AdminSummaryStrip
            overview={overview}
            isLoading={isHomeLoading}
            onNavigate={handleSummaryNavigate}
            onScrollToTarget={handleScrollToTarget}
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
              sectionId={ADMIN_RECENT_USERS_SECTION_ID}
              highlighted={recentUsersHighlighted}
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
