import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PARENT_WEB_ROUTES, buildParentProgressPath } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { useParentProgress } from "./hooks/useParentProgress";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  PROGRESS_EMPTY_MESSAGE,
  PROGRESS_PERIOD_LABELS,
  hasProgressData,
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
    isLoading,
    childrenError,
    progressError,
    refetch,
    setValidChildId,
  } = useParentProgress(parentUserId, requestedChildId);

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

  const progressState = useMemo(() => ({
    improvementPercentage,
    metrics,
    daily,
    weekly,
    monthly,
  }), [improvementPercentage, metrics, daily, weekly, monthly]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading progress...</p>
        </section>
      );
    }

    if (childrenError || progressError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{childrenError || progressError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
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

    if (!hasProgressData(progressState)) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>{PROGRESS_EMPTY_MESSAGE}</p>
        </section>
      );
    }

    return (
      <div className="pd-progress-page-stack">
        {selectedChild ? (
          <section className="pd-card pd-card-pad">
            <h2 className="pd-section-title">{selectedChild.fullName}</h2>
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
            <h1 className="pd-task-hub-title">Progress</h1>
            <p className="pd-task-hub-subtitle">
              Daily, weekly, and monthly exercise progress for your children.
            </p>
          </header>

          {children.length > 0 ? (
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
