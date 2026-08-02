import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PARENT_WEB_ROUTES } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { SessionCard } from "./components/sessions/SessionCard";
import { SessionEmptyState } from "./components/sessions/SessionEmptyState";
import { SessionFilters } from "./components/sessions/SessionFilters";
import { SessionRequestCard } from "./components/sessions/SessionRequestCard";
import { SessionRequestForm } from "./components/sessions/SessionRequestForm";
import { SessionsHubAreas } from "./components/sessions/SessionsHubAreas";
import { SessionsListTabs } from "./components/sessions/SessionsListTabs";
import { useParentSessions } from "./hooks/useParentSessions";
import { useParentSessionRequests } from "./hooks/useParentSessionRequests";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  SESSION_EMPTY_MESSAGES,
  filterSessionHubItems,
  sortSessionHubItems,
} from "./utils/parentSessionsUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentSessionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const notificationUserId = parentUserId;

  const initialChildId = searchParams.get("childId")?.trim() || "all";
  const initialArea = searchParams.get("area") === "requests" ? "requests" : "sessions";

  const [activeArea, setActiveArea] = useState(initialArea);
  const [listTab, setListTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [childFilter, setChildFilter] = useState(initialChildId);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    children,
    sessions,
    counts,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useParentSessions(parentUserId);

  const {
    requests,
    specialists,
    form,
    formErrors,
    isLoading: isLoadingRequests,
    isSubmitting,
    isLoadingSpecialists,
    error: requestsError,
    submitError,
    updateFormField,
    resetForm,
    submitRequest,
    refetch: refetchRequests,
  } = useParentSessionRequests(parentUserId);

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

  const navigation = useParentDashboardNavigation({
    selectedChildId: childFilter !== "all" ? childFilter : null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  useEffect(() => {
    if (childFilter !== "all" && !form.patientId) {
      updateFormField("patientId", childFilter);
    }
  }, [childFilter, form.patientId, updateFormField]);

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

  const filteredSessions = useMemo(
    () => filterSessionHubItems(sessions, {
      childId: childFilter,
      status: statusFilter,
      search,
      listTab,
    }),
    [sessions, childFilter, statusFilter, search, listTab],
  );

  const visibleSessions = useMemo(
    () => sortSessionHubItems(filteredSessions, listTab),
    [filteredSessions, listTab],
  );

  const sessionsEmptyMessage = useMemo(() => {
    const baseCount = listTab === "upcoming" ? counts.upcoming : counts.history;

    if (baseCount === 0) {
      return SESSION_EMPTY_MESSAGES[listTab];
    }

    if (visibleSessions.length === 0) {
      return SESSION_EMPTY_MESSAGES.filtered;
    }

    return null;
  }, [listTab, counts, visibleSessions.length]);

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

  const handleBack = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard, {
      state: childFilter !== "all" ? { selectedChildId: childFilter } : undefined,
    });
  }, [navigate, childFilter]);

  const handleChildFilterChange = useCallback((value) => {
    setChildFilter(value);
    if (value !== "all") {
      updateFormField("patientId", value);
    }
  }, [updateFormField]);

  const handleSubmitRequest = useCallback(async () => {
    const result = await submitRequest();
    if (result.ok) {
      showToast("Session request submitted.");
      setActiveArea("requests");
    }
  }, [submitRequest, showToast]);

  const handleResetForm = useCallback(() => {
    resetForm(childFilter !== "all" ? childFilter : "");
  }, [resetForm, childFilter]);

  const renderSessionsPanel = () => {
    if (isLoadingSessions) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading sessions...</p>
        </section>
      );
    }

    if (sessionsError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{sessionsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchSessions}>
            Retry
          </button>
        </section>
      );
    }

    if (sessionsEmptyMessage) {
      return <SessionEmptyState message={sessionsEmptyMessage} />;
    }

    return (
      <div className="pd-task-hub-list">
        {visibleSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onCopySuccess={showToast}
            onCopyError={showToast}
            onOpenError={showToast}
          />
        ))}
      </div>
    );
  };

  const renderRequestsPanel = () => (
    <div className="pd-sessions-requests-layout">
      <SessionRequestForm
        children={children}
        specialists={form.patientId ? specialists : []}
        form={form}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        isLoadingSpecialists={isLoadingSpecialists}
        submitError={submitError}
        onFieldChange={updateFormField}
        onSubmit={handleSubmitRequest}
        onReset={handleResetForm}
      />

      <section className="pd-sessions-my-requests" aria-label="My session requests">
        <header className="pd-sessions-my-requests-head">
          <h2 className="pd-section-title">My Requests</h2>
        </header>

        {isLoadingRequests ? (
          <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
            <p className="pd-inline-loading">Loading session requests...</p>
          </section>
        ) : null}

        {!isLoadingRequests && requestsError ? (
          <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
            <p className="pd-inline-error">{requestsError}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refetchRequests}>
              Retry
            </button>
          </section>
        ) : null}

        {!isLoadingRequests && !requestsError && requests.length === 0 ? (
          <SessionEmptyState message={SESSION_EMPTY_MESSAGES.requests} />
        ) : null}

        {!isLoadingRequests && !requestsError && requests.length > 0 ? (
          <div className="pd-task-hub-list">
            {requests.map((request) => (
              <SessionRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );

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
            <h1 className="pd-task-hub-title">Sessions</h1>
            <p className="pd-task-hub-subtitle">
              View therapy sessions and request new appointments for your children.
            </p>
          </header>

          <SessionsHubAreas
            activeArea={activeArea}
            onChange={setActiveArea}
            sessionCount={sessions.length}
            requestCount={requests.length}
          />

          {activeArea === "sessions" ? (
            <div
              id="pd-sessions-panel-sessions"
              role="tabpanel"
              aria-labelledby="pd-sessions-area-sessions"
              className="pd-task-hub-panel"
            >
              <SessionsListTabs activeTab={listTab} onChange={setListTab} counts={counts} />

              <SessionFilters
                search={search}
                onSearchChange={setSearch}
                childId={childFilter}
                onChildChange={handleChildFilterChange}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                children={children}
              />

              <div
                id={`pd-sessions-list-panel-${listTab}`}
                role="tabpanel"
                aria-labelledby={`pd-sessions-list-tab-${listTab}`}
              >
                {renderSessionsPanel()}
              </div>
            </div>
          ) : (
            <div
              id="pd-sessions-panel-requests"
              role="tabpanel"
              aria-labelledby="pd-sessions-area-requests"
              className="pd-task-hub-panel"
            >
              {renderRequestsPanel()}
            </div>
          )}
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
