import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  buildSpecialistReviewExercisePath,
  buildSpecialistSessionsPath,
} from "../../routes/specialistDashboardRoutes";
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
  const navigate = useNavigate();
  const { t } = useLocale();
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

  const specialistFirstName = useMemo(() => {
    const firstName = getSpecialistFirstName(specialist.fullName);
    return firstName === "Specialist" ? t("roles.specialist") : firstName;
  }, [specialist.fullName, t]);

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

  const handleKpiCardAction = useCallback((cardKey) => {
    if (cardKey === "todaysSessions") {
      navigate(buildSpecialistSessionsPath({ filter: "today" }));
      return;
    }

    const routeByCardKey = {
      activeCases: "patients",
      pendingReviews: "reviews",
      treatmentPlans: "treatmentPlans",
    };

    const routeKey = routeByCardKey[cardKey];
    if (routeKey) {
      navigateToRouteKey(routeKey);
    }
  }, [navigate, navigateToRouteKey]);

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

        <section className="pd-specialist-overview pd-section-enter" aria-label={t("specialist.dashboard.overviewAriaLabel")}>
          <h2 className="pd-section-title">{t("specialist.dashboard.overviewTitle")}</h2>

          {overviewError ? (
            <div className="pd-specialist-overview-error">
              <p className="pd-inline-error">{overviewError}</p>
              <button
                type="button"
                className="pd-btn pd-btn-soft"
                onClick={reloadOverview}
              >
                {t("common.retry")}
              </button>
            </div>
          ) : (
            <SpecialistSummaryStrip
              overview={overview}
              isLoading={isOverviewLoading}
              onCardAction={handleKpiCardAction}
            />
          )}
        </section>

        <SpecialistWeeklySchedule
          sessions={scheduleSessions}
          isLoading={isScheduleLoading}
          error={scheduleError}
          onRetry={reloadSchedule}
          onViewCalendar={() => navigate(buildSpecialistSessionsPath("calendar"))}
          onViewSession={() => navigate(buildSpecialistSessionsPath())}
        />

        <div className="pd-specialist-preview-row-layout">
          <SpecialistPendingReviewsPreview
            reviews={pendingReviews}
            isLoading={isPendingReviewsLoading}
            error={pendingReviewsError}
            onRetry={reloadPendingReviews}
            onViewAll={() => navigateToRouteKey("reviews")}
            onReviewClick={(review) => {
              if (review?.id) {
                navigate(buildSpecialistReviewExercisePath(review.id));
                return;
              }
              navigateToRouteKey("reviews");
            }}
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
