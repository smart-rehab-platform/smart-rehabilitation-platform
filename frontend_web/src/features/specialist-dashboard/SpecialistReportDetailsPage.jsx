import { ArrowLeft, FileText, Link2 } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistPatientReportsPath,
} from "../../routes/specialistDashboardRoutes";
import { UserProfileAvatar } from "../shared-dashboard/components/UserProfileAvatar";
import { StatusBadge } from "../shared-dashboard/components/StatusBadge";
import { useSpecialistReportDetails } from "./hooks/useSpecialistReportDetails";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { formatReportDateLabel } from "./utils/specialistReportMappers";
import { getInitials } from "./utils/specialistScheduleUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistReportDetailsPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();
  const isAiReport = searchParams.get("ai") === "1";
  const patientId = searchParams.get("patientId");
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

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
    detail,
    isLoading,
    isExporting,
    error,
    reload,
    generatePdf,
  } = useSpecialistReportDetails(reportId, isAiReport);

  const handleBack = useCallback(() => {
    if (patientId) {
      navigate(buildSpecialistPatientReportsPath(patientId));
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.reports);
  }, [navigate, patientId]);

  const handleViewPdf = useCallback(() => {
    if (!detail?.pdfUrl) {
      return;
    }
    window.open(detail.pdfUrl, "_blank", "noopener,noreferrer");
  }, [detail]);

  const handleCopyPdfLink = useCallback(async () => {
    if (!detail?.pdfUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(detail.pdfUrl);
      showToast("PDF link copied to clipboard");
    } catch {
      showToast("Unable to copy PDF link.");
    }
  }, [detail, showToast]);

  const handleGeneratePdf = useCallback(async () => {
    const ok = await generatePdf();
    if (ok) {
      showToast("PDF generated successfully");
    }
  }, [generatePdf, showToast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading report...</p>
        </section>
      );
    }

    if (error && !detail) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            Retry
          </button>
        </section>
      );
    }

    if (!detail) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">Report not found.</p>
        </section>
      );
    }

    return (
      <div className="pd-specialist-report-detail-content">
        <section className="pd-card pd-card-pad pd-specialist-report-detail-header">
          <div className="pd-specialist-report-detail-head-row">
            <UserProfileAvatar
              imageUrl={null}
              initials={getInitials(detail.patientName, "P")}
              alt=""
              shellClassName="pd-avatar pd-specialist-preview-avatar"
              fallbackClassName="pd-avatar pd-specialist-preview-avatar"
              className="pd-avatar-photo"
            />
            <strong>{detail.patientName}</strong>
          </div>
          <h2 className="pd-specialist-report-detail-title">{detail.title}</h2>
          <div className="pd-specialist-report-card-meta">
            <StatusBadge label={detail.typeBadgeLabel} tone="blue" />
            {detail.isAi ? <StatusBadge label="AI" tone="purple" /> : null}
            <span className="pd-section-sub">{detail.dateLabel}</span>
          </div>
          {detail.periodStart && detail.periodEnd ? (
            <p className="pd-section-sub">
              Period: {formatReportDateLabel(detail.periodStart)} – {formatReportDateLabel(detail.periodEnd)}
            </p>
          ) : null}
        </section>

        <section className="pd-card pd-card-pad pd-specialist-report-info">
          <h3 className="pd-specialist-review-section-title">Report Information</h3>
          <dl className="pd-specialist-report-info-grid">
            <div>
              <dt>Patient</dt>
              <dd>{detail.patientName}</dd>
            </div>
            <div>
              <dt>Specialist</dt>
              <dd>{detail.isAi ? "—" : (detail.specialistName || "—")}</dd>
            </div>
            <div>
              <dt>Report Type</dt>
              <dd>{detail.typeBadgeLabel}</dd>
            </div>
            <div>
              <dt>Created Date</dt>
              <dd>{detail.dateLabel}</dd>
            </div>
            {detail.isPdfReady ? (
              <div>
                <dt>Status</dt>
                <dd><StatusBadge label="PDF Ready" tone="success" /></dd>
              </div>
            ) : null}
          </dl>
        </section>

        {detail.sections.map((section) => (
          <section key={section.title} className="pd-card pd-card-pad pd-specialist-report-section">
            <h3 className="pd-specialist-review-section-title">{section.title}</h3>
            <p className="pd-specialist-report-section-body">{section.content}</p>
          </section>
        ))}

        {detail.isPdfReady && detail.pdfUrl ? (
          <>
            <section className="pd-card pd-card-pad pd-specialist-report-attachment">
              <div className="pd-specialist-report-attachment-row">
                <FileText size={18} aria-hidden="true" />
                <span className="pd-section-sub">{detail.pdfUrl}</span>
              </div>
            </section>
            <button type="button" className="pd-btn pd-btn-primary pd-specialist-review-submit" onClick={handleViewPdf}>
              View PDF
            </button>
            <button type="button" className="pd-btn pd-btn-soft pd-specialist-report-copy-link" onClick={handleCopyPdfLink}>
              <Link2 size={16} aria-hidden="true" />
              Copy PDF Link
            </button>
          </>
        ) : (
          <button
            type="button"
            className="pd-btn pd-btn-primary pd-specialist-review-submit"
            onClick={handleGeneratePdf}
            disabled={isExporting}
          >
            {isExporting ? "Generating PDF..." : "Generate PDF"}
          </button>
        )}

        {error ? <p className="pd-inline-error">{error}</p> : null}
      </div>
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
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Reports
            </button>
          </div>
          <div className="pd-task-hub-panel pd-specialist-report-detail-page">
            {renderContent()}
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
