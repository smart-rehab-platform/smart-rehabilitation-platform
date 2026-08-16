import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  buildSpecialistCreateSessionPath,
} from "../../routes/specialistDashboardRoutes";
import { useSpecialistSessionRequests } from "./hooks/useSpecialistSessionRequests";
import { useSpecialistSessions } from "./hooks/useSpecialistSessions";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistSessionRequestsList } from "./sections/SpecialistSessionRequestsList";
import { SpecialistSessionsCalendarView } from "./sections/SpecialistSessionsCalendarView";
import { SpecialistSessionsList } from "./sections/SpecialistSessionsList";
import {
  buildSessionSectionTabs,
  buildSessionViewTabs,
} from "./utils/specialistSessionsLocalization";
import {
  normalizeCalendarDate,
  normalizeSessionListFilterId,
  startOfMonth,
} from "./utils/specialistSessionMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistSessionsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get("view") === "calendar" ? "calendar" : "list";
  const initialFilterId = normalizeSessionListFilterId(searchParams.get("filter"));
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const [sectionTab, setSectionTab] = useState("sessions");
  const [viewMode, setViewMode] = useState(initialView);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => normalizeCalendarDate(new Date()));
  const today = useMemo(() => normalizeCalendarDate(new Date()), []);

  const sectionTabs = useMemo(() => buildSessionSectionTabs(t), [t]);
  const viewTabs = useMemo(() => buildSessionViewTabs(t), [t]);

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
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
  } = useSpecialistShell(specialistUserId);

  const {
    visibleSessions,
    isLoading: isSessionsLoading,
    error: sessionsError,
    searchQuery,
    setSearchQuery,
    filterId,
    setFilterId,
    emptyMessage: sessionsEmptyMessage,
    reload: reloadSessions,
    getDaySessions,
    dayHasSessions,
  } = useSpecialistSessions(specialistUserId, { initialFilterId });

  const {
    visibleRequests,
    isLoading: isRequestsLoading,
    error: requestsError,
    filterId: requestFilterId,
    setFilterId: setRequestFilterId,
    emptyMessage: requestsEmptyMessage,
    reload: reloadRequests,
  } = useSpecialistSessionRequests(sectionTab === "requests");

  const selectedDaySessions = useMemo(
    () => getDaySessions(selectedDate),
    [getDaySessions, selectedDate],
  );

  const handleMonthChange = useCallback((direction) => {
    setVisibleMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + direction, 1);
      const nextMonthIsCurrent = next.getFullYear() === today.getFullYear()
        && next.getMonth() === today.getMonth();
      setSelectedDate(nextMonthIsCurrent ? today : normalizeCalendarDate(next));
      return next;
    });
  }, [today]);

  const handleScheduleSession = useCallback(() => {
    navigate(buildSpecialistCreateSessionPath());
  }, [navigate]);

  const renderSessionsContent = () => {
    if (isSessionsLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.sessions.loading")}</p>
        </section>
      );
    }

    if (sessionsError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{sessionsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reloadSessions}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (viewMode === "calendar") {
      return (
        <SpecialistSessionsCalendarView
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          today={today}
          dayHasSessions={dayHasSessions}
          daySessions={selectedDaySessions}
          onMonthChange={handleMonthChange}
          onSelectDate={setSelectedDate}
        />
      );
    }

    return (
      <SpecialistSessionsList
        sessions={visibleSessions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterId={filterId}
        onFilterChange={setFilterId}
        emptyMessage={sessionsEmptyMessage}
      />
    );
  };

  const renderRequestsContent = () => {
    if (isRequestsLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.sessions.loadingRequests")}</p>
        </section>
      );
    }

    return (
      <SpecialistSessionRequestsList
        requests={visibleRequests}
        filterId={requestFilterId}
        onFilterChange={setRequestFilterId}
        emptyMessage={requestsEmptyMessage}
        error={requestsError}
        onRetry={reloadRequests}
      />
    );
  };

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
        <div className="pd-task-hub-page pd-specialist-sessions-shell">
          <div className="pd-task-hub-panel pd-specialist-sessions-page">
            <header className="pd-specialist-sessions-header">
              <div>
                <h1 className="pd-section-title">{t("specialist.sessions.title")}</h1>
                <p className="pd-section-sub">{t("specialist.sessions.subtitle")}</p>
              </div>
              {sectionTab === "sessions" ? (
                <button
                  type="button"
                  className="pd-btn pd-btn-primary pd-specialist-sessions-schedule-btn"
                  onClick={handleScheduleSession}
                >
                  <Plus size={18} aria-hidden="true" />
                  {t("specialist.sessions.scheduleSession")}
                </button>
              ) : null}
            </header>

            <div
              className="pd-specialist-sessions-segmented"
              role="tablist"
              aria-label={t("specialist.sessions.tabs.sectionsAriaLabel")}
            >
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={sectionTab === tab.id}
                  className={`pd-specialist-sessions-segment${sectionTab === tab.id ? " is-active" : ""}`}
                  onClick={() => setSectionTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {sectionTab === "sessions" ? (
              <>
                <div
                  className="pd-specialist-sessions-view-toggle"
                  role="tablist"
                  aria-label={t("specialist.sessions.view.ariaLabel")}
                >
                  {viewTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={viewMode === tab.id}
                      className={`pd-specialist-sessions-view-tab${viewMode === tab.id ? " is-active" : ""}`}
                      onClick={() => setViewMode(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {renderSessionsContent()}
              </>
            ) : (
              renderRequestsContent()
            )}
          </div>
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
