import { useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { SPECIALIST_NAV_UNAVAILABLE } from "../../routes/specialistDashboardRoutes";
import { useSpecialistDashboardOverview } from "./hooks/useSpecialistDashboardOverview";
import { useSpecialistPendingReviews } from "./hooks/useSpecialistPendingReviews";
import { useSpecialistRecentProgress } from "./hooks/useSpecialistRecentProgress";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { useSpecialistWeeklySchedule } from "./hooks/useSpecialistWeeklySchedule";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistGreeting } from "./sections/SpecialistGreeting";
import { SpecialistPendingReviewsPreview } from "./sections/SpecialistPendingReviewsPreview";
import { SpecialistRecentPatientProgress } from "./sections/SpecialistRecentPatientProgress";
import { SpecialistSummaryStrip } from "./sections/SpecialistSummaryStrip";
import { SpecialistWeeklySchedule } from "./sections/SpecialistWeeklySchedule";
import { getSpecialistFirstName } from "./utils/specialistDashboardMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistDashboardPage() {
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const {
    specialist,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    notifications,
    isLoadingNotifications,
    notificationsError,
    unreadCount,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    navigateToRouteKey,
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
  } = useSpecialistShell(specialistUserId);

  const specialistFirstName = useMemo(
    () => getSpecialistFirstName(specialist.fullName),
    [specialist.fullName],
  );

  const {
    overview,
    isLoading: isOverviewLoading,
    error: overviewError,
    reload: reloadOverview,
  } = useSpecialistDashboardOverview(specialistUserId);

  const {
    sessions: scheduleSessions,
    isLoading: isScheduleLoading,
    error: scheduleError,
    reload: reloadSchedule,
  } = useSpecialistWeeklySchedule(specialistUserId);

  const {
    reviews: pendingReviews,
    isLoading: isPendingReviewsLoading,
    error: pendingReviewsError,
    reload: reloadPendingReviews,
  } = useSpecialistPendingReviews(specialistUserId);

  const {
    progressItems: recentProgressItems,
    isLoading: isRecentProgressLoading,
    error: recentProgressError,
    reload: reloadRecentProgress,
  } = useSpecialistRecentProgress(specialistUserId);

  return (
    <div className="pd-preview">
      <SpecialistDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={specialist}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        notificationBadgeCount={unreadCount}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onMessages={handleMessages}
        onViewAllNotifications={handleViewAllNotifications}
        onNotificationSelect={handleNotificationSelect}
        showToast={showToast}
      >
        <SpecialistGreeting firstName={specialistFirstName} />

        <section className="pd-specialist-overview pd-section-enter" aria-label="Overview">
          <h2 className="pd-section-title">Overview</h2>

          {overviewError ? (
            <div className="pd-specialist-overview-error">
              <p className="pd-inline-error">{overviewError}</p>
              <button
                type="button"
                className="pd-btn pd-btn-soft"
                onClick={reloadOverview}
              >
                Retry
              </button>
            </div>
          ) : (
            <SpecialistSummaryStrip
              overview={overview}
              isLoading={isOverviewLoading}
              onCardAction={navigateToRouteKey}
            />
          )}
        </section>

        <SpecialistWeeklySchedule
          sessions={scheduleSessions}
          isLoading={isScheduleLoading}
          error={scheduleError}
          onRetry={reloadSchedule}
          onViewCalendar={() => navigateToRouteKey("sessions")}
          onViewSession={() => showToast(SPECIALIST_NAV_UNAVAILABLE.generic)}
        />

        <div className="pd-specialist-preview-row-layout">
          <SpecialistPendingReviewsPreview
            reviews={pendingReviews}
            isLoading={isPendingReviewsLoading}
            error={pendingReviewsError}
            onRetry={reloadPendingReviews}
            onViewAll={() => navigateToRouteKey("reviews")}
            onReviewClick={() => navigateToRouteKey("reviews")}
          />

          <SpecialistRecentPatientProgress
            progressItems={recentProgressItems}
            isLoading={isRecentProgressLoading}
            error={recentProgressError}
            onRetry={reloadRecentProgress}
            onViewAll={() => navigateToRouteKey("progress")}
          />
        </div>
      </SpecialistDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
