import { ArrowLeft, Link2 } from "lucide-react";
import descriptionIcon from "../../assets/icons/description.svg";
import neurologyIcon from "../../assets/icons/neurology.svg";
import { useCallback, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistPatientReportsPath,
} from "../../routes/specialistDashboardRoutes";
import { UserProfileAvatar } from "../shared-dashboard/components/UserProfileAvatar";
import { StatusBadge } from "../shared-dashboard/components/StatusBadge";
import { SpecialistAiReportStructuredContent } from "./components/SpecialistAiReportStructuredContent";
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
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

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
    isDiscarding,
    isSavingDraft,
    isEditing,
    draftForm,
    error,
    reload,
    generatePdf,
    discardReport,
    startEditing,
    cancelEditing,
    updateDraftField,
    saveDraft,
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

  const handleApproveAndGeneratePdf = useCallback(async () => {
    const ok = await generatePdf();
    if (ok) {
      showToast(
        detail?.isAi
          ? t("specialist.reports.review.approvedSuccess")
          : t("specialist.reports.pdf.generatedSuccess"),
      );
    }
  }, [detail?.isAi, generatePdf, showToast, t]);

  const handleStartEditing = useCallback(() => {
    startEditing();
  }, [startEditing]);

  const handleCancelEditing = useCallback(() => {
    cancelEditing();
  }, [cancelEditing]);

  const handleSaveDraft = useCallback(async () => {
    const ok = await saveDraft();
    if (ok) {
      showToast(t("specialist.reports.edit.saveSuccess"));
    }
  }, [saveDraft, showToast, t]);

  const handleOpenDiscardConfirm = useCallback(() => {
    setDiscardConfirmOpen(true);
  }, []);

  const handleCancelDiscard = useCallback(() => {
    setDiscardConfirmOpen(false);
  }, []);

  const handleConfirmDiscard = useCallback(async () => {
    const ok = await discardReport();
    if (!ok) {
      setDiscardConfirmOpen(false);
      return;
    }
    setDiscardConfirmOpen(false);
    showToast(t("specialist.reports.discard.success"));
    handleBack();
  }, [discardReport, handleBack, showToast, t]);

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

    const isAwaitingAiReview = Boolean(detail.isAi && detail.isAwaitingReview);

    return (
      <div className="pd-specialist-report-detail-content">
        <section className="pd-card pd-card-pad pd-specialist-report-detail-header">
          <div className="pd-specialist-report-detail-head-row">
            <img
              src={detail.isAi ? neurologyIcon : descriptionIcon}
              alt=""
              aria-hidden="true"
              className={`pd-platform-icon pd-specialist-report-type-icon${detail.isAi ? " is-ai" : ""}`}
              width={22}
              height={22}
            />
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
            {detail.isPdfReady ? (
              <StatusBadge
                label={detail.pdfReadyLabel || t("specialist.reports.status.pdfReady")}
                tone="success"
              />
            ) : isAwaitingAiReview ? (
              <StatusBadge
                label={detail.awaitingReviewLabel || t("specialist.reports.status.awaitingReview")}
                tone="warning"
              />
            ) : null}
            <span className="pd-section-sub">{detail.dateLabel}</span>
          </div>
          {isAwaitingAiReview ? (
            <p className="pd-section-sub">
              {isEditing
                ? t("specialist.reports.edit.editingBanner")
                : t("specialist.reports.review.banner")}
            </p>
          ) : null}
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
              <dd>{detail.specialistName || t("auth.shared.emptyDisplay")}</dd>
            </div>
            <div>
              <dt>{t("specialist.reports.labels.reportType")}</dt>
              <dd>{detail.typeBadgeLabel}</dd>
            </div>
            <div>
              <dt>{t("specialist.reports.labels.createdDate")}</dt>
              <dd>{detail.dateLabel}</dd>
            </div>
            {detail.isPdfReady || isAwaitingAiReview ? (
              <div>
                <dt>{t("specialist.reports.labels.status")}</dt>
                <dd>
                  {detail.isPdfReady ? (
                    <StatusBadge
                      label={detail.pdfReadyLabel || t("specialist.reports.status.pdfReady")}
                      tone="success"
                    />
                  ) : (
                    <StatusBadge
                      label={detail.awaitingReviewLabel || t("specialist.reports.status.awaitingReview")}
                      tone="warning"
                    />
                  )}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        {detail.isAi && (detail.aiStructuredSummary?.isStructured || isEditing) ? (
          <SpecialistAiReportStructuredContent
            detail={detail}
            isEditing={isEditing}
            draftForm={draftForm}
            onDraftFieldChange={updateDraftField}
            draftDisabled={isSavingDraft}
          />
        ) : (
          detail.sections.map((section) => (
            <section key={section.title} className="pd-card pd-card-pad pd-specialist-report-section">
              <h3 className="pd-specialist-review-section-title">{section.titleLabel || section.title}</h3>
              <p className="pd-specialist-report-section-body" dir="auto">{section.content}</p>
            </section>
          ))
        )}

        {detail.isPdfReady && detail.pdfUrl ? (
          <>
            <button type="button" className="pd-btn pd-btn-primary pd-specialist-review-submit" onClick={handleViewPdf}>
              {t("specialist.reports.pdf.view")}
            </button>
            <button type="button" className="pd-btn pd-btn-soft pd-specialist-report-copy-link" onClick={handleCopyPdfLink}>
              <Link2 size={16} aria-hidden="true" />
              {t("specialist.reports.pdf.copyLink")}
            </button>
          </>
        ) : isAwaitingAiReview && isEditing ? (
          <div className="pd-specialist-report-review-actions">
            <button
              type="button"
              className="pd-btn pd-btn-primary pd-specialist-review-submit"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft
                ? t("specialist.reports.edit.saving")
                : t("specialist.reports.edit.saveChanges")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={handleCancelEditing}
              disabled={isSavingDraft}
            >
              {t("specialist.reports.edit.cancelEditing")}
            </button>
          </div>
        ) : isAwaitingAiReview ? (
          <div className="pd-specialist-report-review-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={handleStartEditing}
              disabled={isExporting || isDiscarding || isSavingDraft}
            >
              {t("specialist.reports.edit.editReport")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-primary pd-specialist-review-submit"
              onClick={handleApproveAndGeneratePdf}
              disabled={isExporting || isDiscarding || isSavingDraft || isEditing}
            >
              {isExporting
                ? t("specialist.reports.review.approving")
                : t("specialist.reports.review.approveAndGeneratePdf")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-danger-outline pd-specialist-report-discard-btn"
              onClick={handleOpenDiscardConfirm}
              disabled={isExporting || isDiscarding || isSavingDraft || isEditing}
            >
              {t("specialist.reports.discard.action")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="pd-btn pd-btn-primary pd-specialist-review-submit"
            onClick={handleApproveAndGeneratePdf}
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

      {discardConfirmOpen ? (
        <div className="pd-specialist-case-dialog-backdrop" role="presentation">
          <div
            className="pd-card pd-card-pad pd-specialist-case-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-ai-report-discard-title"
          >
            <h2 id="sp-ai-report-discard-title">{t("specialist.reports.discard.confirmTitle")}</h2>
            <p>{t("specialist.reports.discard.confirmBody")}</p>
            <div className="pd-specialist-case-dialog-actions">
              <button
                type="button"
                className="pd-btn pd-btn-ghost"
                onClick={handleCancelDiscard}
                disabled={isDiscarding}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="pd-btn pd-btn-danger-outline"
                onClick={handleConfirmDiscard}
                disabled={isDiscarding}
              >
                {isDiscarding
                  ? t("specialist.reports.discard.discarding")
                  : t("specialist.reports.discard.confirmAction")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
