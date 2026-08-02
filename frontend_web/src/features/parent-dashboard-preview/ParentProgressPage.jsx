import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PARENT_WEB_ROUTES, buildParentProgressPath } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { TreatmentJourneyPanel } from "./components/treatment-journey/TreatmentJourneyPanel";
import { useParentProgress } from "./hooks/useParentProgress";
import { useParentTreatmentJourney } from "./hooks/useParentTreatmentJourney";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  PROGRESS_PERIOD_LABELS,
} from "./utils/parentProgressUtils";
import "./styles/parentDashboardTokens.css";

function ProgressSection({ title, items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-progress-section">
      <h3 className="pd-section-title">{title}</h3>
      <ul className="pd-progress-snapshot-list">
        {items.map((item) => (
          <li key={item.id} className="pd-progress-snapshot-item">
            <div>
              {item.periodLabel ? <strong>{item.periodLabel}</strong> : null}
              <span>
                {item.exercisesCompleted != null
                  ? `${item.exercisesCompleted} exercises completed`
                  : "Progress snapshot"}
              </span>
            </div>
            {item.improvementPercentage != null ? (
              <em>{Math.round(item.improvementPercentage)}%</em>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ParentProgressPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const requestedChildId = searchParams.get("childId")?.trim() || null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const {
    children,
    validChildId,
    daily,
    weekly,
    monthly,
    improvementPercentage,
    metrics,
    isLoadingChildren,
    isLoadingProgress,
    childrenError,
    progressError,
    refetch: refetchProgress,
    setValidChildId,
  } = useParentProgress(parentUserId, requestedChildId);

  const {
    journey,
    period,
    isLoading: isJourneyLoading,
    isRefreshing,
    isPeriodLoading,
    error: journeyError,
    setPeriod,
    retry: retryJourney,
    refresh: refreshJourney,
  } = useParentTreatmentJourney(validChildId);

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(parentUserId);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: validChildId,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  useEffect(() => {
    if (!validChildId) {
      return;
    }

    const current = searchParams.get("childId");
    if (current === validChildId) {
      return;
    }

    setSearchParams({ childId: validChildId }, { replace: true });
  }, [validChildId, searchParams, setSearchParams]);

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

  const selectedChild = useMemo(
    () => children.find((child) => child.id === validChildId) ?? null,
    [children, validChildId],
  );

  const handleBack = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard, {
      state: validChildId ? { selectedChildId: validChildId } : undefined,
    });
  }, [navigate, validChildId]);

  const handleChildChange = useCallback((event) => {
    const nextChildId = event.target.value;
    setValidChildId(nextChildId || null);
    if (nextChildId) {
      navigate(buildParentProgressPath(nextChildId), { replace: true });
    }
  }, [navigate, setValidChildId]);

  const renderSupportingSections = () => {
    if (isLoadingProgress) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading supporting progress details...</p>
        </section>
      );
    }

    if (progressError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{progressError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchProgress}>
            Retry
          </button>
        </section>
      );
    }

    const hasSupportingData = Boolean(
      improvementPercentage != null
      || metrics.totalExercisesCompleted != null
      || daily.length
      || weekly.length
      || monthly.length,
    );

    if (!hasSupportingData) {
      return null;
    }

    return (
      <div className="pd-tj-supporting-progress">
        <h3 className="pd-section-title">Supporting Progress Details</h3>
        {(improvementPercentage != null || metrics.totalExercisesCompleted != null) ? (
          <section className="pd-card pd-card-pad">
            {improvementPercentage != null ? (
              <p className="pd-progress-highlight">
                Improvement: {Math.round(improvementPercentage)}%
              </p>
            ) : null}
            {metrics.totalExercisesCompleted != null ? (
              <p className="pd-section-sub">
                Completed exercises: {metrics.totalExercisesCompleted}
              </p>
            ) : null}
          </section>
        ) : null}
        <ProgressSection title={PROGRESS_PERIOD_LABELS.weekly} items={weekly} />
        <ProgressSection title={PROGRESS_PERIOD_LABELS.daily} items={daily} />
        <ProgressSection title={PROGRESS_PERIOD_LABELS.monthly} items={monthly} />
      </div>
    );
  };

  const renderContent = () => {
    if (isLoadingChildren) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading progress...</p>
        </section>
      );
    }

    if (childrenError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{childrenError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchProgress}>
            Retry
          </button>
        </section>
      );
    }

    if (children.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>No linked children available for progress tracking.</p>
        </section>
      );
    }

    if (!validChildId || !selectedChild) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>Select a child to view treatment journey progress.</p>
        </section>
      );
    }

    return (
      <div className="pd-progress-page-stack">
        <TreatmentJourneyPanel
          child={selectedChild}
          hasMultipleChildren={children.length > 1}
          journey={journey}
          period={period}
          isLoading={isJourneyLoading}
          isPeriodLoading={isPeriodLoading}
          isRefreshing={isRefreshing}
          error={journeyError}
          onPeriodChange={setPeriod}
          onRetry={retryJourney}
          onRefresh={refreshJourney}
        />
        {renderSupportingSections()}
      </div>
    );
  };

  return (
    <div className="pd-preview">
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={parentDashboardMock.navItems}
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
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Dashboard
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">Treatment Journey</h1>
            <p className="pd-task-hub-subtitle">
              See how your child&apos;s progress has changed over time.
            </p>
          </header>

          {children.length > 1 ? (
            <div className="pd-progress-filter">
              <label htmlFor="pd-progress-child-filter">Child</label>
              <select
                id="pd-progress-child-filter"
                className="pd-select"
                value={validChildId || ""}
                onChange={handleChildChange}
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.fullName}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="pd-task-hub-panel">{renderContent()}</div>
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
