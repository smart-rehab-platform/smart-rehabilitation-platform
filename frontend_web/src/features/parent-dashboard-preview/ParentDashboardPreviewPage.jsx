import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import { buildParentProgressPath } from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { GreetingAndActions } from "./sections/GreetingAndActions";
import { SummaryStrip } from "./sections/SummaryStrip";
import { TodaysExercisesSection } from "./sections/TodaysExercisesSection";
import { ChildProgressOverview } from "./sections/ChildProgressOverview";
import { MiniCalendarCard } from "./sections/MiniCalendarCard";
import { UpcomingSessionCard } from "./sections/UpcomingSessionCard";
import { LatestUpdatesSection } from "./sections/LatestUpdatesSection";
import { AiAssistantCard } from "./sections/AiAssistantCard";
import { TreatmentJourneyCard } from "./components/treatment-journey/TreatmentJourneyCard";
import { useParentDashboardFoundation } from "./hooks/useParentDashboardFoundation";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { useParentTreatmentJourney } from "./hooks/useParentTreatmentJourney";
import {
  buildAiDashboardGuidance,
  buildCalendarMarkersForMonth,
  mapParentFromAuth,
  pickUpcomingSessionsForPatient,
} from "./utils/parentDashboardMappers";
import "./styles/parentDashboardTokens.css";

const today = new Date();

function SessionCardState({ message, isError = false, t }) {
  return (
    <section className="pd-session-minimal pd-schedule-card pd-section-enter" aria-label={t("parent.home.upcomingSchedule")}>
      <h2 className="pd-overview-title">{t("parent.home.upcomingSchedule")}</h2>
      <p className={isError ? "pd-inline-error pd-schedule-empty" : "pd-inline-loading pd-schedule-empty"}>
        {message}
      </p>
    </section>
  );
}

function CalendarCardState({ message, isError = false, t }) {
  return (
    <section className="pd-calendar-minimal pd-section-enter" aria-label={t("parent.home.calendar")}>
      <h2 className="pd-overview-title">{t("parent.home.calendar")}</h2>
      <p className={isError ? "pd-inline-error pd-today-tasks-empty" : "pd-inline-loading pd-today-tasks-empty"}>
        {message}
      </p>
    </section>
  );
}

function TasksSectionState({ message, isError = false, t }) {
  return (
    <section className="pd-card pd-card-pad pd-today-tasks pd-section-enter" aria-label={t("parent.home.todaysTasks")}>
      <div className="pd-card-header">
        <h2 className="pd-section-title">{t("parent.home.todaysTasks")}</h2>
      </div>
      <p className={isError ? "pd-inline-error pd-today-tasks-empty" : "pd-inline-loading pd-today-tasks-empty"}>
        {message}
      </p>
    </section>
  );
}

function SummarySectionState({ message, t }) {
  return (
    <section className="pd-quick-summary pd-section-enter" aria-label={t("parent.home.quickSummary")}>
      <div className="pd-quick-summary-item pd-quick-summary-item-static">
        <span className="pd-inline-loading">{message}</span>
      </div>
    </section>
  );
}
function UpdatesSectionState({ message, isError = false, t }) {
  return (
    <section className="pd-card pd-card-pad pd-latest-updates pd-section-enter" aria-label={t("parent.home.latestUpdates")}>
      <div className="pd-card-header">
        <h2 className="pd-section-title">{t("parent.home.latestUpdates")}</h2>
      </div>
      <p className={isError ? "pd-inline-error pd-today-tasks-empty" : "pd-inline-loading pd-today-tasks-empty"}>
        {message}
      </p>
    </section>
  );
}

function HeroCardState({ message, isError = false, t }) {
  return (
    <section className="pd-section-enter" aria-label={t("parent.home.overallProgressAriaLabel")}>
      <div className="pd-progress-hero-card pd-progress-hero-card-static">
        <div className="pd-progress-hero-state">
          <p className={isError ? "pd-inline-error" : "pd-inline-loading"}>{message}</p>
        </div>
      </div>
    </section>
  );
}

export default function ParentDashboardPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const restoredChildIdRef = useRef(null);
  const { user, isInitializing } = useAuth();
  const notificationUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    children,
    selectedChildId,
    selectChild,
    refreshSelectedChild,
    heroViewModel,
    exercises,
    summary,
    isLoadingChildren,
    isLoadingHero,
    foundationError,
    heroError,
    tasksError,
    sessions,
    dailyTasks,
    latestReport,
    recentFeedback,
    reportsError,
    reviewsError,
  } = useParentDashboardFoundation(user?.id);

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(notificationUserId);

  const {
    journey: treatmentJourney,
    isLoading: isTreatmentJourneyLoading,
    error: treatmentJourneyError,
    retry: retryTreatmentJourney,
  } = useParentTreatmentJourney(selectedChildId);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const liveSelectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) || null,
    [children, selectedChildId],
  );

  const upcomingSessions = useMemo(() => {
    if (isLoadingChildren || foundationError || !selectedChildId) {
      return [];
    }

    return pickUpcomingSessionsForPatient(sessions, selectedChildId, 2);
  }, [isLoadingChildren, foundationError, selectedChildId, sessions]);

  const upcomingSessionCard = upcomingSessions[0] ?? null;

  const aiGuidance = useMemo(
    () => buildAiDashboardGuidance(exercises),
    [exercises],
  );

  const calendarMarkers = useMemo(() => {
    const emptyToday = {
      todayYear: today.getFullYear(),
      todayMonthIndex: today.getMonth(),
      todayDay: today.getDate(),
    };

    if (isLoadingChildren || foundationError || !selectedChildId) {
      return {
        sessionDays: [],
        exerciseDays: [],
        ...emptyToday,
      };
    }

    return buildCalendarMarkersForMonth({
      sessions,
      dailyTasks: isLoadingHero ? [] : dailyTasks,
      patientId: selectedChildId,
      year: calYear,
      monthIndex: calMonth,
    });
  }, [
    isLoadingChildren,
    isLoadingHero,
    foundationError,
    selectedChildId,
    sessions,
    dailyTasks,
    calYear,
    calMonth,
  ]);

  const parentFirstName = parent.fullName.split(" ")[0];

  const handleOpenTreatmentJourney = useCallback(() => {
    if (!selectedChildId) {
      return;
    }

    navigate(buildParentProgressPath(selectedChildId));
  }, [navigate, selectedChildId]);

  const renderTreatmentJourneyCard = () => {
    if (isLoadingChildren || foundationError || !selectedChildId) {
      return null;
    }

    return (
      <TreatmentJourneyCard
        journey={treatmentJourney}
        isLoading={isTreatmentJourneyLoading}
        error={treatmentJourneyError}
        onTap={handleOpenTreatmentJourney}
        onRetry={retryTreatmentJourney}
      />
    );
  };

  const badges = useMemo(() => ({
    notifications:
      !notificationsError && !isLoadingNotifications && unreadCount > 0
        ? unreadCount
        : null,
    messages: messageUnreadCount > 0 ? messageUnreadCount : null,
  }), [
    notificationsError,
    isLoadingNotifications,
    unreadCount,
    messageUnreadCount,
  ]);

  const navigation = useParentDashboardNavigation({
    selectedChildId,
    exercises,
    upcomingSession: upcomingSessionCard,
    latestReport,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  useEffect(() => {
    const restoreId = location.state?.selectedChildId;
    const shouldRefresh = Boolean(location.state?.refreshDashboard);
    const toastMessage = location.state?.toastMessage;
    let toastTimer;

    if (typeof toastMessage === "string" && toastMessage.trim()) {
      toastTimer = window.setTimeout(() => {
        showToast(toastMessage.trim());
      }, 0);
    }

    if (
      typeof restoreId !== "string"
      || !restoreId
      || isLoadingChildren
      || children.length === 0
    ) {
      if (shouldRefresh) {
        refreshSelectedChild();
      }

      return () => {
        if (toastTimer) {
          window.clearTimeout(toastTimer);
        }
      };
    }

    if (children.some((child) => child.id === restoreId)) {
      if (restoreId !== selectedChildId) {
        restoredChildIdRef.current = restoreId;
        selectChild(restoreId);
        return () => {
          if (toastTimer) {
            window.clearTimeout(toastTimer);
          }
        };
      }

      if (shouldRefresh) {
        refreshSelectedChild();
      }
    }

    return () => {
      if (toastTimer) {
        window.clearTimeout(toastTimer);
      }
    };
  }, [
    location.state,
    children,
    isLoadingChildren,
    selectChild,
    selectedChildId,
    refreshSelectedChild,
    showToast,
  ]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    document.body.classList.add("pd-preview-drawer-open");
    return () => document.body.classList.remove("pd-preview-drawer-open");
  }, [mobileNavOpen]);

  const shiftMonth = (delta) => {
    let nextMonth = calMonth + delta;
    let nextYear = calYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setCalMonth(nextMonth);
    setCalYear(nextYear);
    setSelectedDay(1);
  };

  const renderSummaryStrip = () => {
    if (isLoadingChildren || isLoadingHero) {
      return <SummarySectionState message={t("parent.home.loadingSummary")} t={t} />;
    }

    if (!summary) {
      return <SummarySectionState message={t("parent.home.summaryUnavailable")} t={t} />;
    }

    return (
      <SummaryStrip
        summary={summary}
        onNavigate={navigation.handleSummaryNavigate}
      />
    );
  };

  const renderTodaysTasks = () => {
    if (isLoadingChildren || isLoadingHero) {
      return <TasksSectionState message={t("parent.home.loadingTodaysTasks")} t={t} />;
    }

    if (tasksError) {
      return (
        <TasksSectionState
          message={t("parent.home.unableToLoadTodaysTasks", { error: tasksError })}
          isError
          t={t}
        />
      );
    }

    return (
      <TodaysExercisesSection
        childName={liveSelectedChild?.fullName?.split(" ")[0]}
        exercises={exercises}
        onViewAll={navigation.handleViewAllExercises}
        onExerciseClick={navigation.handleExerciseClick}
      />
    );
  };

  const renderUpcomingSessionCard = () => {
    if (isLoadingChildren) {
      return <SessionCardState message={t("parent.home.loadingUpcomingSchedule")} t={t} />;
    }

    if (foundationError) {
      return (
        <SessionCardState
          message={t("parent.home.upcomingScheduleUnavailable")}
          isError
          t={t}
        />
      );
    }

    return (
      <UpcomingSessionCard
        sessions={upcomingSessions}
        onViewDetails={navigation.handleSessionViewDetails}
        onOpenMeeting={navigation.handleOpenMeeting}
      />
    );
  };

  const renderCalendarCard = () => {
    if (isLoadingChildren) {
      return <CalendarCardState message={t("parent.home.loadingCalendar")} t={t} />;
    }

    if (foundationError) {
      return (
        <CalendarCardState
          message={t("parent.home.calendarUnavailable")}
          isError
          t={t}
        />
      );
    }

    return (
      <MiniCalendarCard
        year={calYear}
        monthIndex={calMonth}
        selectedDay={selectedDay}
        todayYear={calendarMarkers.todayYear}
        todayMonthIndex={calendarMarkers.todayMonthIndex}
        todayDay={calendarMarkers.todayDay}
        sessionDays={calendarMarkers.sessionDays}
        exerciseDays={calendarMarkers.exerciseDays}
        onSelectDay={setSelectedDay}
        onPrevMonth={() => shiftMonth(-1)}
        onNextMonth={() => shiftMonth(1)}
      />
    );
  };
  const renderLatestUpdates = () => {
    if (isLoadingChildren || isLoadingHero) {
      return <UpdatesSectionState message={t("parent.home.loadingLatestUpdates")} t={t} />;
    }

    if (foundationError) {
      return (
        <UpdatesSectionState
          message={t("parent.home.latestUpdatesUnavailable")}
          isError
          t={t}
        />
      );
    }

    const hasContent = Boolean(latestReport || recentFeedback);
    const hasErrors = Boolean(reportsError || reviewsError);

    if (!hasContent && hasErrors) {
      return (
        <UpdatesSectionState
          message={t("parent.home.unableToLoadLatestUpdates")}
          isError
          t={t}
        />
      );
    }

    if (!hasContent) {
      return <UpdatesSectionState message={t("parent.home.noUpdatesYet")} t={t} />;
    }

    return (
      <>
        {reportsError && !latestReport ? (
          <p className="pd-inline-error pd-inline-error-banner" role="status">
            {t("parent.home.latestReportUnavailable")}
          </p>
        ) : null}
        {reviewsError && !recentFeedback ? (
          <p className="pd-inline-error pd-inline-error-banner" role="status">
            {t("parent.home.specialistFeedbackUnavailable")}
          </p>
        ) : null}
        <LatestUpdatesSection
          latestReport={latestReport}
          recentFeedback={recentFeedback}
          onViewAll={navigation.handleLatestUpdatesViewAll}
          onItemAction={navigation.handleLatestUpdateAction}
        />
      </>
    );
  };

  const renderHeroCard = () => {
    if (isLoadingChildren || isLoadingHero) {
      return <HeroCardState message={t("parent.home.loadingChildProgress")} t={t} />;
    }

    if (foundationError) {
      return (
        <HeroCardState
          message={foundationError}
          isError
          t={t}
        />
      );
    }

    if (!heroViewModel) {
      return (
        <HeroCardState
          message={t("parent.home.noLinkedChildren")}
          isError
          t={t}
        />
      );
    }

    return (
      <>
        {heroError ? (
          <p className="pd-inline-error pd-inline-error-banner" role="status">
            {heroError}
          </p>
        ) : null}
        <ChildProgressOverview
          key={`progress-${selectedChildId}`}
          child={heroViewModel.child}
          progress={heroViewModel.progress}
          summary={heroViewModel.summary}
          weeklyProgress={heroViewModel.weeklyProgress}
          upcomingSession={heroViewModel.upcomingSession}
          animationKey={selectedChildId}
          onViewFull={navigation.handleHeroViewFull}
        />
      </>
    );
  };

  return (
    <div className="pd-preview">
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        badges={badges}
        parent={parent}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        onNotificationSelect={navigation.handleNotificationSelect}
        onViewAllNotifications={navigation.handleViewAllNotifications}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={navigation.handleSidebarNav}
        onSignOut={navigation.handleSignOut}
        onViewProfile={navigation.handleViewProfile}
        onMessages={navigation.handleMessages}
      >
        <div className="pd-dashboard-hero-viewport">
          <GreetingAndActions
            parentFirstName={parentFirstName}
            childOptions={children}
            selectedChildId={selectedChildId}
            isChildSelectorLoading={isLoadingChildren}
            childSelectorError={foundationError}
            summary={summary}
            onSelectChild={selectChild}
            onStartExercise={navigation.handleStartExercise}
          />

          {renderSummaryStrip()}

          <div className="pd-dashboard-hero-cards">
            <div className="pd-dashboard-hero-card-slot">
              {renderHeroCard()}
            </div>
            <div className="pd-dashboard-hero-card-slot pd-dashboard-hero-card-slot--schedule">
              {renderCalendarCard()}
              {renderUpcomingSessionCard()}
            </div>
          </div>
        </div>

        <div className="pd-dashboard-grid pd-dashboard-grid--body">
          <div className="pd-dashboard-cell pd-cell-activities">
            {renderTodaysTasks()}
            {renderTreatmentJourneyCard()}
          </div>

          <div className="pd-dashboard-cell pd-cell-updates">
            {renderLatestUpdates()}
          </div>

          <div className="pd-dashboard-cell pd-cell-schedule">
            <AiAssistantCard
              guidanceMessage={aiGuidance.message}
              onAskAi={navigation.handleAskAi}
              onSuggestionClick={navigation.handleAskAi}
            />
          </div>
        </div>
      </ParentDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
