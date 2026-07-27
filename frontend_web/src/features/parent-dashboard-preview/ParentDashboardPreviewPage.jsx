import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { GreetingAndActions } from "./sections/GreetingAndActions";
import { SummaryStrip } from "./sections/SummaryStrip";
import { TodaysExercisesSection } from "./sections/TodaysExercisesSection";
import { ChildProgressOverview } from "./sections/ChildProgressOverview";
import { MiniCalendarCard } from "./sections/MiniCalendarCard";
import { UpcomingSessionCard } from "./sections/UpcomingSessionCard";
import { LatestUpdatesSection } from "./sections/LatestUpdatesSection";
import { AiAssistantCard } from "./sections/AiAssistantCard";
import { useParentDashboardFoundation } from "./hooks/useParentDashboardFoundation";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import {
  buildAiDashboardGuidance,
  buildCalendarMarkersForMonth,
  mapParentFromAuth,
  pickUpcomingSessionsForPatient,
} from "./utils/parentDashboardMappers";
import "./styles/parentDashboardTokens.css";

const today = new Date();

function SessionCardState({ message, isError = false }) {
  return (
    <section className="pd-session-minimal pd-schedule-card pd-section-enter" aria-label="Upcoming schedule">
      <h2 className="pd-overview-title">Upcoming Schedule</h2>
      <p className={isError ? "pd-inline-error pd-schedule-empty" : "pd-inline-loading pd-schedule-empty"}>
        {message}
      </p>
    </section>
  );
}

function CalendarCardState({ message, isError = false }) {
  return (
    <section className="pd-calendar-minimal pd-section-enter" aria-label="Calendar">
      <h2 className="pd-overview-title">Calendar</h2>
      <p className={isError ? "pd-inline-error pd-today-tasks-empty" : "pd-inline-loading pd-today-tasks-empty"}>
        {message}
      </p>
    </section>
  );
}

function TasksSectionState({ message, isError = false }) {
  return (
    <section className="pd-card pd-card-pad pd-today-tasks pd-section-enter" aria-label="Today's tasks">
      <div className="pd-card-header">
        <h2 className="pd-section-title">Today&apos;s Tasks</h2>
      </div>
      <p className={isError ? "pd-inline-error pd-today-tasks-empty" : "pd-inline-loading pd-today-tasks-empty"}>
        {message}
      </p>
    </section>
  );
}

function SummarySectionState({ message }) {
  return (
    <section className="pd-quick-summary pd-section-enter" aria-label="Quick summary">
      <div className="pd-quick-summary-item pd-quick-summary-item-static">
        <span className="pd-inline-loading">{message}</span>
      </div>
    </section>
  );
}
function UpdatesSectionState({ message, isError = false }) {
  return (
    <section className="pd-card pd-card-pad pd-latest-updates pd-section-enter" aria-label="Latest updates">
      <div className="pd-card-header">
        <h2 className="pd-section-title">Latest Updates</h2>
      </div>
      <p className={isError ? "pd-inline-error pd-today-tasks-empty" : "pd-inline-loading pd-today-tasks-empty"}>
        {message}
      </p>
    </section>
  );
}

function HeroCardState({ message, isError = false }) {
  return (
    <section className="pd-section-enter" aria-label="Overall progress">
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

  const mock = parentDashboardMock;
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
      return <SummarySectionState message="Loading summary..." />;
    }

    if (!summary) {
      return <SummarySectionState message="Summary unavailable." />;
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
      return <TasksSectionState message="Loading today's tasks..." />;
    }

    if (tasksError) {
      return (
        <TasksSectionState
          message={`Unable to load today's tasks. ${tasksError}`}
          isError
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
      return <SessionCardState message="Loading upcoming schedule..." />;
    }

    if (foundationError) {
      return (
        <SessionCardState
          message="Upcoming schedule unavailable right now."
          isError
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
      return <CalendarCardState message="Loading calendar..." />;
    }

    if (foundationError) {
      return (
        <CalendarCardState
          message="Calendar unavailable right now."
          isError
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
      return <UpdatesSectionState message="Loading latest updates..." />;
    }

    if (foundationError) {
      return (
        <UpdatesSectionState
          message="Latest updates unavailable right now."
          isError
        />
      );
    }

    const hasContent = Boolean(latestReport || recentFeedback);
    const hasErrors = Boolean(reportsError || reviewsError);

    if (!hasContent && hasErrors) {
      return (
        <UpdatesSectionState
          message="Unable to load latest updates."
          isError
        />
      );
    }

    if (!hasContent) {
      return <UpdatesSectionState message="No updates yet for this child." />;
    }

    return (
      <>
        {reportsError && !latestReport ? (
          <p className="pd-inline-error pd-inline-error-banner" role="status">
            Latest report unavailable.
          </p>
        ) : null}
        {reviewsError && !recentFeedback ? (
          <p className="pd-inline-error pd-inline-error-banner" role="status">
            Specialist feedback unavailable.
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
      return <HeroCardState message="Loading child progress..." />;
    }

    if (foundationError) {
      return (
        <HeroCardState
          message={foundationError}
          isError
        />
      );
    }

    if (!heroViewModel) {
      return (
        <HeroCardState
          message="No linked children found yet."
          isError
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
        navItems={mock.navItems}
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

        <div className="pd-dashboard-grid">
          <div className="pd-dashboard-cell pd-cell-progress">
            {renderHeroCard()}
          </div>

          <div className="pd-dashboard-cell pd-cell-schedule">
            {renderCalendarCard()}

            {renderUpcomingSessionCard()}

            <AiAssistantCard
              guidanceMessage={aiGuidance.message}
              onAskAi={navigation.handleAskAi}
              onSuggestionClick={navigation.handleAskAi}
            />
          </div>

          <div className="pd-dashboard-cell pd-cell-activities">
            {renderTodaysTasks()}
          </div>

          <div className="pd-dashboard-cell pd-cell-updates">
            {renderLatestUpdates()}
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
