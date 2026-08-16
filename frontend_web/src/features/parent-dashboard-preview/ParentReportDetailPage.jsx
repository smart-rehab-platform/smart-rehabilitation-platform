import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  buildParentReportsPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { ReportFileAction } from "./components/reports/ReportFileAction";
import { ReportSummarySections } from "./components/reports/ReportSummarySections";
import { useParentReportDetail } from "./hooks/useParentReportDetail";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import "./styles/parentDashboardTokens.css";

export default function ParentReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const notificationUserId = parentUserId;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    report,
    isLoading,
    error,
    refetch,
  } = useParentReportDetail(reportId);

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
    selectedChildId: report?.patientId ?? null,
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
    navigate(buildParentReportsPath(report?.patientId));
  }, [navigate, report?.patientId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.pages.reports.loadingDetail")}</p>
        </section>
      );
    }

    if (error || !report) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error || t("parent.pages.reports.notFound")}</p>
          <div className="pd-report-detail-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
              {t("parent.common.retry")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-ghost"
              onClick={() => navigate(buildParentReportsPath(report?.patientId))}
            >
              {t("parent.common.backToReports")}
            </button>
          </div>
        </section>
      );
    }

    return (
      <article className="pd-card pd-card-pad pd-report-detail-card pd-section-enter">
        <header className="pd-report-detail-head">
          {report.title ? (
            <h1 className="pd-report-detail-title">{report.title}</h1>
          ) : (
            <h1 className="pd-report-detail-title">{t("parent.pages.reports.detailTitle")}</h1>
          )}
          {report.reportTypeLabel ? (
            <span className="pd-report-type-badge">{report.reportTypeLabel}</span>
          ) : null}
        </header>

        <ul className="pd-task-hub-card-meta pd-report-detail-meta">
          {report.childName ? (
            <li>
              <strong>{t("parent.common.child")}</strong>
              <span>{report.childName}</span>
            </li>
          ) : null}
          {report.generatedDate ? (
            <li>
              <strong>{t("parent.pages.reports.generated")}</strong>
              <span>{report.generatedDate}</span>
            </li>
          ) : null}
          {report.authorName ? (
            <li>
              <strong>{t("parent.common.specialist")}</strong>
              <span>{report.authorName}</span>
            </li>
          ) : null}
        </ul>

        <ReportFileAction report={report} onOpenError={showToast} />

        <ReportSummarySections summaryRaw={report.summaryRaw} />
      </article>
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
            <button type="button" className="pd-btn pd-btn-ghost pd-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              {t("parent.common.backToReports")}
            </button>
          </div>

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
