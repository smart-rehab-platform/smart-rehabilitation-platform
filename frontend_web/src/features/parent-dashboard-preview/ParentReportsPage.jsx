import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PARENT_WEB_ROUTES } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { ReportCard } from "./components/reports/ReportCard";
import { ReportFilters } from "./components/reports/ReportFilters";
import { ReportsEmptyState } from "./components/reports/ReportsEmptyState";
import { useParentReports } from "./hooks/useParentReports";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  REPORT_EMPTY_MESSAGES,
  buildReportTypeFilterOptions,
  filterReports,
  sortReports,
} from "./utils/parentReportsUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentReportsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const notificationUserId = parentUserId;

  const initialChildId = searchParams.get("childId")?.trim() || "all";

  const [search, setSearch] = useState("");
  const [childFilter, setChildFilter] = useState(initialChildId);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    children,
    reports,
    reportCount,
    isLoading,
    error,
    refetch,
  } = useParentReports(parentUserId);

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

  const reportTypeOptions = useMemo(
    () => buildReportTypeFilterOptions(reports),
    [reports],
  );

  const filteredReports = useMemo(
    () => filterReports(reports, {
      search,
      childId: childFilter,
      reportType: typeFilter,
    }),
    [reports, search, childFilter, typeFilter],
  );

  const visibleReports = useMemo(
    () => sortReports(filteredReports, sortKey),
    [filteredReports, sortKey],
  );

  const emptyMessage = useMemo(() => {
    if (reports.length === 0) {
      return REPORT_EMPTY_MESSAGES.none;
    }

    if (visibleReports.length === 0) {
      return REPORT_EMPTY_MESSAGES.filtered;
    }

    return null;
  }, [reports.length, visibleReports.length]);

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading reports...</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            Retry
          </button>
        </section>
      );
    }

    if (emptyMessage) {
      return <ReportsEmptyState message={emptyMessage} />;
    }

    return (
      <div className="pd-task-hub-list">
        {visibleReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onOpenError={showToast}
          />
        ))}
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
            <button type="button" className="pd-btn pd-btn-ghost pd-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Dashboard
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">Reports</h1>
            <p className="pd-task-hub-subtitle">
              View progress reports for your linked children.
              {!isLoading && !error ? ` ${reportCount} report${reportCount === 1 ? "" : "s"} loaded.` : ""}
            </p>
          </header>

          {!isLoading && !error && reports.length > 0 ? (
            <ReportFilters
              search={search}
              onSearchChange={setSearch}
              childId={childFilter}
              onChildChange={setChildFilter}
              reportType={typeFilter}
              onReportTypeChange={setTypeFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
              children={children}
              reportTypeOptions={reportTypeOptions}
            />
          ) : null}

          <div className="pd-task-hub-panel">{renderContent()}</div>
        </div>

        {toast ? (
          <div className="pd-toast" role="status" aria-live="polite">
            {toast}
          </div>
        ) : null}
      </ParentDashboardShell>
    </div>
  );
}
