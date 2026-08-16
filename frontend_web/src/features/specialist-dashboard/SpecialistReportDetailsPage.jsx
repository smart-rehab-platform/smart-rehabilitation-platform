import { ArrowLeft, FileText, Link2 } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistPatientReportsPath,
} from "../../routes/specialistDashboardRoutes";
import { UserProfileAvatar } from "../shared-dashboard/components/UserProfileAvatar";
import { StatusBadge } from "../shared-dashboard/components/StatusBadge";
import { useSpecialistReportDetails } from "./hooks/useSpecialistReportDetails";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
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
  const { t } = useLocale();
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
      showToast(t("specialist.reports.pdf.linkCopied"));
    } catch {
      showToast(t("specialist.reports.pdf.copyFailed"));
    }
  }, [detail, showToast, t]);

  const handleGeneratePdf = useCallback(async () => {
    const ok = await generatePdf();
    if (ok) {
      showToast(t("specialist.reports.pdf.generatedSuccess"));
    }
  }, [generatePdf, showToast, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.reports.loadingDetail")}</p>
        </section>
      );
    }

    if (error && !detail) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (!detail) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{t("specialist.reports.notFound")}</p>
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
          <h2 className="pd-specialist-report-detail-title">{detail.titleLabel || detail.title}</h2>
          <div className="pd-specialist-report-card-meta">
            <StatusBadge label={detail.typeBadgeLabel} tone="blue" />
            {detail.isAi ? <StatusBadge label={detail.aiBadgeLabel || t("specialist.reports.type.ai")} tone="purple" /> : null}
            <span className="pd-section-sub">{detail.dateLabel}</span>
          </div>
          {detail.periodStart && detail.periodEnd ? (
            <p className="pd-section-sub">
              {t("specialist.reports.labels.period")}
              {": "}
              {detail.periodStartLabel}
              {" – "}
              {detail.periodEndLabel}
            </p>
          ) : null}
        </section>

        <section className="pd-card pd-card-pad pd-specialist-report-info">
          <h3 className="pd-specialist-review-section-title">{t("specialist.reports.labels.reportInformation")}</h3>
          <dl className="pd-specialist-report-info-grid">
            <div>
              <dt>{t("specialist.reports.labels.patient")}</dt>
              <dd>{detail.patientName}</dd>
            </div>
            <div>
              <dt>{t("specialist.reports.labels.specialist")}</dt>
              <dd>{detail.isAi ? t("auth.shared.emptyDisplay") : (detail.specialistName || t("auth.shared.emptyDisplay"))}</dd>
            </div>
            <div>
              <dt>{t("specialist.reports.labels.reportType")}</dt>
              <dd>{detail.typeBadgeLabel}</dd>
            </div>
            <div>
              <dt>{t("specialist.reports.labels.createdDate")}</dt>
              <dd>{detail.dateLabel}</dd>
            </div>
            {detail.isPdfReady ? (
              <div>
                <dt>{t("specialist.reports.labels.status")}</dt>
                <dd><StatusBadge label={detail.pdfReadyLabel || t("specialist.reports.status.pdfReady")} tone="success" /></dd>
              </div>
            ) : null}
          </dl>
        </section>

        {detail.sections.map((section) => (
          <section key={section.title} className="pd-card pd-card-pad pd-specialist-report-section">
            <h3 className="pd-specialist-review-section-title">{section.titleLabel || section.title}</h3>
            <p className="pd-specialist-report-section-body" dir="auto">{section.content}</p>
          </section>
        ))}

        {detail.isPdfReady && detail.pdfUrl ? (
          <>
            <section className="pd-card pd-card-pad pd-specialist-report-attachment">
              <div className="pd-specialist-report-attachment-row">
                <FileText size={18} aria-hidden="true" />
                <span className="pd-section-sub" dir="auto">{detail.pdfUrl}</span>
              </div>
            </section>
            <button type="button" className="pd-btn pd-btn-primary pd-specialist-review-submit" onClick={handleViewPdf}>
              {t("specialist.reports.pdf.view")}
            </button>
            <button type="button" className="pd-btn pd-btn-soft pd-specialist-report-copy-link" onClick={handleCopyPdfLink}>
              <Link2 size={16} aria-hidden="true" />
              {t("specialist.reports.pdf.copyLink")}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="pd-btn pd-btn-primary pd-specialist-review-submit"
            onClick={handleGeneratePdf}
            disabled={isExporting}
          >
            {isExporting ? t("specialist.reports.pdf.generating") : t("specialist.reports.pdf.generate")}
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
              {t("specialist.reports.backToReports")}
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
