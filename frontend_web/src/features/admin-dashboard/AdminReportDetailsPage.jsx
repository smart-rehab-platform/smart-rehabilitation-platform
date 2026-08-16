import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ADMIN_WEB_ROUTES } from "../../routes/adminDashboardRoutes";
import { AdminReportPdfActions } from "./components/AdminReportPdfActions";
import { useAdminReportDetails } from "./hooks/useAdminReportDetails";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminReportAttachment } from "./sections/AdminReportAttachment";
import { AdminReportDetailsHero } from "./sections/AdminReportDetailsHero";
import { AdminReportInformation } from "./sections/AdminReportInformation";
import { AdminReportSummary } from "./sections/AdminReportSummary";
import { parseAdminReportSource } from "./utils/adminReportsMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminReportsSections.css";

function DetailsSkeleton({ labels }) {
  return (
    <div className="pd-admin-report-details" aria-busy="true" aria-label={labels?.loadingDetails}>
      <div className="pd-card pd-card-pad pd-admin-report-details-hero">
        <span className="pd-admin-report-skeleton-line is-title" />
        <span className="pd-admin-report-skeleton-line is-sub" />
        <span className="pd-admin-report-skeleton-line is-meta" />
      </div>
      <div className="pd-admin-report-details-grid">
        <div className="pd-admin-report-details-main">
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-report-skeleton-line is-title" />
            <span className="pd-admin-report-skeleton-line" />
            <span className="pd-admin-report-skeleton-line is-sub" />
          </div>
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-report-skeleton-line is-title" />
            <span className="pd-admin-report-skeleton-line is-summary" />
            <span className="pd-admin-report-skeleton-line is-summary-short" />
          </div>
        </div>
        <div className="pd-admin-report-details-side">
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-report-skeleton-line is-meta" />
            <span className="pd-admin-report-skeleton-line is-sub" />
          </div>
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-report-skeleton-line is-meta" />
            <span className="pd-admin-report-skeleton-line is-sub" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackButton({ labels, onClick }) {
  return (
    <button type="button" className="pd-btn pd-btn-soft pd-admin-report-back" onClick={onClick}>
      <ArrowLeft size={16} aria-hidden="true" />
      {labels.back}
    </button>
  );
}

export default function AdminReportDetailsPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();

  const source = parseAdminReportSource(searchParams.get("ai"));
  const hasValidSource = source.valid;
  const isAiReport = hasValidSource ? source.isAiReport : null;

  const {
    adminUser,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    handleSignOut,
    handleViewProfile,
    handleViewAllNotifications,
    handleSidebarNav,
  } = useAdminShell();

  const {
    report: loadedReport,
    isLoading,
    error,
    errorStatus,
    refresh,
    labels,
  } = useAdminReportDetails(
    hasValidSource ? reportId : "",
    hasValidSource ? isAiReport : null,
  );

  const [localReport, setLocalReport] = useState(null);
  const report = localReport
    && loadedReport
    && localReport.id === loadedReport.id
    && Boolean(localReport.isAiReport) === Boolean(loadedReport.isAiReport)
    ? localReport
    : loadedReport;

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.reports);
  }, [navigate]);

  const handleReportUpdated = useCallback((nextReport) => {
    setLocalReport(nextReport);
  }, []);

  const handleRefresh = useCallback(async () => {
    setLocalReport(null);
    await refresh();
  }, [refresh]);

  const isNotFound = errorStatus === 404
    || (typeof error === "string" && error.toLowerCase().includes("not found"));

  let body;

  if (!hasValidSource) {
    body = (
      <div className="pd-admin-report-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-section-enter">
          <p className="pd-admin-report-empty-copy" role="alert">{labels.invalidSource}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {labels.back}
          </button>
        </section>
      </div>
    );
  } else if (isLoading) {
    body = (
      <>
        <BackButton labels={labels} onClick={handleBack} />
        <DetailsSkeleton labels={labels} />
      </>
    );
  } else if (isNotFound) {
    body = (
      <div className="pd-admin-report-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-section-enter">
          <p className="pd-admin-report-empty-copy" role="alert">{labels.notFound}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {labels.back}
          </button>
        </section>
      </div>
    );
  } else if (error) {
    body = (
      <div className="pd-admin-report-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-admin-reports-error pd-section-enter">
          <p className="pd-inline-error" role="alert">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleRefresh}>
            {labels.retry}
          </button>
        </section>
      </div>
    );
  } else if (!report) {
    body = (
      <div className="pd-admin-report-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-section-enter">
          <p className="pd-admin-report-empty-copy" role="alert">{labels.notFound}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {labels.back}
          </button>
        </section>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-report-details">
        <BackButton labels={labels} onClick={handleBack} />

        <AdminReportDetailsHero report={report} labels={labels} />

        <div className="pd-admin-report-details-grid">
          <div className="pd-admin-report-details-main">
            <AdminReportInformation report={report} labels={labels} />
            <AdminReportSummary
              summary={report.summary}
              isAiReport={Boolean(report.isAiReport)}
              labels={labels}
            />
          </div>

          <div className="pd-admin-report-details-side">
            <AdminReportAttachment report={report} labels={labels} />
            <AdminReportPdfActions
              report={report}
              labels={labels}
              onReportUpdated={handleReportUpdated}
              onRefresh={handleRefresh}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-preview">
      <AdminDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={adminUser}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onViewAllNotifications={handleViewAllNotifications}
        showToast={showToast}
      >
        {body}
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
