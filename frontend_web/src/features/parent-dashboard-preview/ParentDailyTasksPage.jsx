import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  buildParentExerciseDetailsPath,
  PARENT_WEB_ROUTES,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { TaskCard } from "./components/daily-tasks/TaskCard";
import { TaskEmptyState } from "./components/daily-tasks/TaskEmptyState";
import { TaskFilters } from "./components/daily-tasks/TaskFilters";
import { TaskTabs } from "./components/daily-tasks/TaskTabs";
import { useParentDailyTasks } from "./hooks/useParentDailyTasks";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  filterHubTasks,
  getHubEmptyMessages,
  sortHubTasks,
} from "./utils/parentDailyTasksUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentDailyTasksPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const notificationUserId = parentUserId;

  const initialChildId = searchParams.get("childId")?.trim() || "all";

  const [activeTab, setActiveTab] = useState("daily");
  const [search, setSearch] = useState("");
  const [childFilter, setChildFilter] = useState(initialChildId);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("actionable");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const hubEmptyMessages = useMemo(() => getHubEmptyMessages(t), [t]);

  const {
    children,
    tasksByTab,
    isLoading,
    error,
    refetch,
  } = useParentDailyTasks(parentUserId);

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
    exercises: tasksByTab.daily,
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

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

  const tabTasks = useMemo(
    () => tasksByTab[activeTab] ?? [],
    [tasksByTab, activeTab],
  );

  const filteredTasks = useMemo(
    () => filterHubTasks(tabTasks, {
      search,
      childId: childFilter,
      status: statusFilter,
    }),
    [tabTasks, search, childFilter, statusFilter],
  );

  const visibleTasks = useMemo(
    () => sortHubTasks(filteredTasks, sortKey),
    [filteredTasks, sortKey],
  );

  const tabCounts = useMemo(() => ({
    daily: tasksByTab.daily.length,
    weekly: tasksByTab.weekly.length,
    assigned: tasksByTab.assigned.length,
  }), [tasksByTab]);

  const emptyMessage = useMemo(() => {
    if (tabTasks.length === 0) {
      return hubEmptyMessages[activeTab];
    }

    if (visibleTasks.length === 0) {
      return hubEmptyMessages.filtered;
    }

    return null;
  }, [activeTab, tabTasks.length, visibleTasks.length, hubEmptyMessages]);

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

  const handleOpenTask = useCallback((task) => {
    const path = buildParentExerciseDetailsPath(task);
    if (!path) {
      showToast(t("parent.toast.exerciseUnavailable"));
      return;
    }

    navigate(path);
  }, [navigate, showToast, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.pages.dailyTasks.loading")}</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (emptyMessage) {
      return <TaskEmptyState message={emptyMessage} />;
    }

    return (
      <div className="pd-task-hub-list">
        {visibleTasks.map((task) => (
          <TaskCard key={`${task.patientId}-${task.id}`} task={task} onOpen={handleOpenTask} />
        ))}
      </div>
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
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("parent.common.backToDashboard")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.pages.dailyTasks.title")}</h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.pages.dailyTasks.subtitle")}
            </p>
          </header>

          <TaskTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />

          <TaskFilters
            search={search}
            onSearchChange={setSearch}
            childId={childFilter}
            onChildChange={setChildFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            sortKey={sortKey}
            onSortChange={setSortKey}
            children={children}
          />

          <div
            id={`pd-task-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`pd-task-tab-${activeTab}`}
            className="pd-task-hub-panel"
          >
            {renderContent()}
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
