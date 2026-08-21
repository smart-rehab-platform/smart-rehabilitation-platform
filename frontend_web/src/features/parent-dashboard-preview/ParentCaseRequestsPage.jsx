import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  PARENT_WEB_ROUTES,
  buildParentCaseRequestDetailPath,
  buildParentCaseRequestNewPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { useParentCaseRequests } from "./hooks/useParentCaseRequests";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  filterCaseRequests,
  getCaseRequestsEmptyMessage,
  getCaseRequestsFilteredEmptyMessage,
  sortCaseRequests,
} from "./utils/parentCaseRequestsUtils";
import { CaseRequestChildAvatar } from "./components/case-requests/CaseRequestChildAvatar";
import { CaseRequestFilters } from "./components/case-requests/CaseRequestFilters";
import "./styles/parentDashboardTokens.css";

export default function ParentCaseRequestsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest");

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const { requests, isLoading, error, refetch } = useParentCaseRequests();
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
    selectedChildId: null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  const filteredRequests = useMemo(
    () => filterCaseRequests(requests, { search, status: statusFilter }),
    [requests, search, statusFilter],
  );

  const visibleRequests = useMemo(
    () => sortCaseRequests(filteredRequests, sortKey),
    [filteredRequests, sortKey],
  );

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

  const handleBack = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard);
  }, [navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.caseRequests.loading")}</p>
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

    if (requests.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>{getCaseRequestsEmptyMessage(t)}</p>
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            onClick={() => navigate(buildParentCaseRequestNewPath())}
          >
            {t("parent.caseRequests.newRequest")}
          </button>
        </section>
      );
    }

    if (visibleRequests.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>{getCaseRequestsFilteredEmptyMessage(t)}</p>
        </section>
      );
    }

    return (
      <div className="pd-case-request-list">
        {visibleRequests.map((request) => (
          <button
            key={request.id}
            type="button"
            className="pd-card pd-case-request-card"
            onClick={() => navigate(buildParentCaseRequestDetailPath(request.id))}
            aria-label={t("parent.caseRequests.viewRequestAria", {
              childName: request.childName,
            })}
          >
            <div className="pd-case-request-card-row">
              <div className="pd-case-request-card-identity">
                <CaseRequestChildAvatar
                  childName={request.childName}
                  imageUrl={request.childImageUrl}
                  size="md"
                />
                <div className="pd-case-request-card-identity-copy">
                  <strong className="pd-case-request-card-name">{request.childName}</strong>
                  {request.categoryName ? (
                    <p className="pd-case-meta">{request.categoryName}</p>
                  ) : null}
                </div>
              </div>

              <div className="pd-case-request-card-meta">
                {request.submittedLabel ? (
                  <p className="pd-case-meta pd-case-meta-submitted">
                    {t("parent.caseRequests.submittedOn", { date: request.submittedLabel })}
                  </p>
                ) : null}
                {request.statusSubtitle ? (
                  <p className="pd-case-status-note">{request.statusSubtitle}</p>
                ) : null}
              </div>

              <div className="pd-case-request-card-status">
                <span className={`pd-status-pill pd-status-${request.status}`}>
                  {request.statusLabel}
                </span>
              </div>
            </div>
          </button>
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
              {t("parent.caseRequests.backToDashboard")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={() => navigate(buildParentCaseRequestNewPath())}
            >
              <Plus size={16} aria-hidden="true" />
              {t("parent.caseRequests.newRequest")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.caseRequests.title")}</h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.caseRequests.subtitle")}
            </p>
          </header>

          {!isLoading && !error && requests.length > 0 ? (
            <CaseRequestFilters
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
            />
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
