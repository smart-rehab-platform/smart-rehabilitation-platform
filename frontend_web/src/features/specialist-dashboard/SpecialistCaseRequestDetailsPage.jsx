import { ArrowLeft, MessagesSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistMessagesPath,
  buildSpecialistPatientDetailPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistCaseRequestAttachments } from "./components/SpecialistCaseRequestAttachment";
import { SpecialistCaseRequestTimeline } from "./components/SpecialistCaseRequestTimeline";
import { useSpecialistCaseRequestDetails } from "./hooks/useSpecialistCaseRequestDetails";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistCaseRequestAssessmentNotes } from "./sections/SpecialistCaseRequestAssessmentNotes";
import { SpecialistCaseRequestCaseInfo } from "./sections/SpecialistCaseRequestCaseInfo";
import { SpecialistCaseRequestChildInfo } from "./sections/SpecialistCaseRequestChildInfo";
import { SpecialistCaseRequestDiagnosisTreatment } from "./sections/SpecialistCaseRequestDiagnosisTreatment";
import { SpecialistCaseRequestParentInfo } from "./sections/SpecialistCaseRequestParentInfo";
import { StatusBadge } from "../shared-dashboard/components/StatusBadge";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

const NOTES_MAX = 10000;

export default function SpecialistCaseRequestDetailsPage() {
  const navigate = useNavigate();
  const { caseRequestId } = useParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const [notesDraft, setNotesDraft] = useState("");
  const [notesSeedKey, setNotesSeedKey] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

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
    isRefreshing,
    error,
    actionError,
    clearActionError,
    isStartingAssessment,
    isSavingNotes,
    isAccepting,
    isRejecting,
    hasActiveMutation,
    reload,
    startAssessment,
    saveAssessmentNotes,
    acceptCase,
    rejectCase,
  } = useSpecialistCaseRequestDetails(specialistUserId, caseRequestId);

  const editableNotesKey = detail?.canEditAssessmentNotes ? detail.id : null;
  if (editableNotesKey && editableNotesKey !== notesSeedKey) {
    setNotesSeedKey(editableNotesKey);
    setNotesDraft(detail.assessmentNotes || "");
  } else if (!editableNotesKey && notesSeedKey) {
    setNotesSeedKey(null);
  }

  useEffect(() => {
    if (actionError) {
      showToast(actionError);
      clearActionError();
    }
  }, [actionError, clearActionError, showToast]);

  const notesDirty = useMemo(() => {
    const saved = (detail?.assessmentNotes || "").trim();
    return notesDraft.trim() !== saved;
  }, [detail?.assessmentNotes, notesDraft]);

  const handleBack = useCallback(() => {
    if (hasActiveMutation) {
      showToast(
        isSavingNotes
          ? t("specialist.caseRequests.toast.waitSavingNotes")
          : isAccepting
            ? t("specialist.caseRequests.toast.waitCreatingProfile")
            : isRejecting
              ? t("specialist.caseRequests.toast.waitRejecting")
              : t("specialist.caseRequests.toast.waitStartingAssessment"),
      );
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.caseRequests);
  }, [
    hasActiveMutation,
    isSavingNotes,
    isAccepting,
    isRejecting,
    navigate,
    showToast,
    t,
  ]);

  const copyText = useCallback(async (value, successMessage) => {
    const trimmed = value?.trim() || "";
    if (!trimmed) {
      return;
    }
    try {
      await navigator.clipboard.writeText(trimmed);
      showToast(successMessage);
    } catch {
      showToast(t("specialist.caseRequests.copyFailed"));
    }
  }, [showToast, t]);

  const handleOpenConversation = useCallback(() => {
    if (!detail?.conversationId) {
      return;
    }
    navigate(buildSpecialistMessagesPath(detail.conversationId));
  }, [detail, navigate]);

  const handleOpenPatient = useCallback(() => {
    if (!detail?.patientId) {
      showToast(t("specialist.caseRequests.toast.patientProfileUnavailable"));
      return;
    }
    navigate(buildSpecialistPatientDetailPath(detail.patientId));
  }, [detail, navigate, showToast, t]);

  const handleSaveNotes = useCallback(async () => {
    const notes = notesDraft.trim();
    if (!notes) {
      showToast(t("specialist.caseRequests.validation.assessmentNotesRequired"));
      return;
    }
    if (notes.length > NOTES_MAX) {
      showToast(t("specialist.caseRequests.validation.assessmentNotesMaxLength"));
      return;
    }
    const success = await saveAssessmentNotes(notes);
    if (success) {
      setNotesDraft(notes);
      setNotesSeedKey(detail?.id || null);
      showToast(t("specialist.caseRequests.toast.assessmentNotesUpdated"));
    }
  }, [notesDraft, saveAssessmentNotes, showToast, detail?.id, t]);

  const handleConfirmStart = useCallback(async () => {
    setConfirmDialog(null);
    const success = await startAssessment();
    if (success) {
      showToast(t("specialist.caseRequests.toast.assessmentStarted"));
    }
  }, [startAssessment, showToast, t]);

  const handleConfirmAccept = useCallback(async () => {
    setConfirmDialog(null);
    const patientId = await acceptCase();
    if (patientId) {
      showToast(t("specialist.caseRequests.toast.patientProfileCreated"));
      navigate(buildSpecialistPatientDetailPath(patientId));
    }
  }, [acceptCase, navigate, showToast, t]);

  const handleConfirmReject = useCallback(async () => {
    const reason = rejectReason.trim();
    if (reason.length < 5) {
      setRejectError(t("specialist.caseRequests.validation.rejectReasonMinLength"));
      return;
    }
    if (reason.length > 2000) {
      setRejectError(t("specialist.caseRequests.validation.rejectReasonMaxLength"));
      return;
    }
    setRejectError("");
    setConfirmDialog(null);
    const success = await rejectCase(reason);
    if (success) {
      setRejectReason("");
      showToast(t("specialist.caseRequests.toast.caseRejected"));
    }
  }, [rejectReason, rejectCase, showToast, t]);

  const openAcceptFlow = useCallback(() => {
    const savedNotes = detail?.assessmentNotes?.trim() || "";
    if (!savedNotes) {
      showToast(t("specialist.caseRequests.validation.saveNotesBeforeAccept"));
      return;
    }
    if (notesDirty) {
      showToast(t("specialist.caseRequests.validation.saveNotesBeforeAcceptDirty"));
      return;
    }
    setConfirmDialog("accept");
  }, [detail?.assessmentNotes, notesDirty, showToast, t]);

  const openRejectFlow = useCallback(() => {
    setRejectReason("");
    setRejectError("");
    setConfirmDialog("reject");
  }, []);

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
        <div className="pd-task-hub-page pd-specialist-case-details-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              {t("specialist.caseRequests.back")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <div>
              <h1>{t("specialist.caseRequests.detailsTitle")}</h1>
              <p className="pd-section-sub">
                {t("specialist.caseRequests.detailsIntro")}
              </p>
            </div>
          </header>

          {isRefreshing ? (
            <div className="pd-specialist-case-refresh-bar" aria-hidden="true" />
          ) : null}

          {isLoading && !detail ? (
            <div className="pd-card pd-card-pad pd-specialist-case-request-skeleton" aria-busy="true" />
          ) : null}

          {!isLoading && !detail ? (
            <div className="pd-card pd-card-pad pd-specialist-case-state-card">
              <p>{error || t("specialist.caseRequests.notFound")}</p>
              <div className="pd-specialist-case-state-actions">
                <button type="button" className="pd-btn pd-btn-primary" onClick={reload}>
                  {t("common.retry")}
                </button>
                <button type="button" className="pd-btn pd-btn-ghost" onClick={handleBack}>
                  {t("specialist.caseRequests.backShort")}
                </button>
              </div>
            </div>
          ) : null}

          {detail ? (
            <>
              {error ? (
                <div className="pd-card pd-card-pad pd-specialist-case-state-card">
                  <p>{error}</p>
                  <button type="button" className="pd-btn pd-btn-primary" onClick={reload}>
                    {t("common.retry")}
                  </button>
                </div>
              ) : null}

              <section className="pd-card pd-card-pad pd-specialist-case-summary">
                <div className="pd-specialist-case-summary-main">
                  <strong className="pd-specialist-case-summary-title" dir="auto">{detail.childName}</strong>
                  {detail.categoryName ? (
                    <span className="pd-specialist-case-summary-category">{detail.categoryName}</span>
                  ) : null}
                  <div className="pd-specialist-case-summary-meta">
                    <StatusBadge label={detail.statusLabel} tone={detail.statusTone} />
                    <span>{detail.headerDateLabel}</span>
                  </div>
                  {detail.parentName ? (
                    <p className="pd-specialist-case-summary-parent">
                      {t("specialist.caseRequests.parentLabel", { name: detail.parentName })}
                    </p>
                  ) : null}
                </div>
              </section>

              <div className="pd-specialist-case-details-grid">
                <SpecialistCaseRequestTimeline steps={detail.timelineSteps} />
                <SpecialistCaseRequestChildInfo detail={detail} />
              </div>

              {detail.isRejected ? (
                <section className="pd-card pd-card-pad pd-specialist-case-rejection">
                  <h2 className="pd-specialist-case-section-title">
                    {t("specialist.caseRequests.rejectionReason")}
                  </h2>
                  <p className="pd-specialist-case-field-value" dir="auto">
                    {detail.rejectionReason?.trim() || t("specialist.caseRequests.noRejectionReason")}
                  </p>
                </section>
              ) : null}

              {detail.isConverted ? (
                <section className="pd-card pd-card-pad pd-specialist-case-conversion">
                  <h2 className="pd-specialist-case-section-title">
                    {t("specialist.caseRequests.profileCreated")}
                  </h2>
                  {detail.patientId ? (
                    <button
                      type="button"
                      className="pd-btn pd-btn-primary"
                      onClick={handleOpenPatient}
                    >
                      {t("specialist.caseRequests.openPatientProfile")}
                    </button>
                  ) : (
                    <p className="pd-section-sub">
                      {t("specialist.caseRequests.convertedMissingPatientId")}
                    </p>
                  )}
                </section>
              ) : null}

              <div className="pd-specialist-case-details-grid">
                <SpecialistCaseRequestCaseInfo detail={detail} />
                <SpecialistCaseRequestDiagnosisTreatment detail={detail} />
              </div>

              <SpecialistCaseRequestParentInfo
                detail={detail}
                onCopyEmail={() => copyText(detail.parent?.email, t("specialist.caseRequests.copyEmail"))}
                onCopyPhone={() => copyText(detail.parent?.phone, t("specialist.caseRequests.copyPhone"))}
              />

              <SpecialistCaseRequestAttachments
                attachments={detail.attachments}
                onOpenError={showToast}
              />

              <SpecialistCaseRequestAssessmentNotes
                detail={detail}
                notesDraft={notesDraft}
                onNotesChange={setNotesDraft}
                onSave={handleSaveNotes}
                isSaving={isSavingNotes}
                canSave={notesDirty && !hasActiveMutation}
                disabled={hasActiveMutation}
              />

              <div className="pd-specialist-case-actions">
                {detail.conversationId ? (
                  <button
                    type="button"
                    className="pd-btn pd-btn-primary"
                    onClick={handleOpenConversation}
                    disabled={hasActiveMutation}
                  >
                    <MessagesSquare size={16} aria-hidden="true" />
                    {t("specialist.caseRequests.openConversation")}
                  </button>
                ) : null}

                {detail.canAcceptOrReject ? (
                  <>
                    <button
                      type="button"
                      className="pd-btn pd-btn-primary"
                      onClick={openAcceptFlow}
                      disabled={hasActiveMutation}
                    >
                      {isAccepting
                        ? t("specialist.caseRequests.creatingPatientProfile")
                        : t("specialist.caseRequests.acceptCase")}
                    </button>
                    <button
                      type="button"
                      className="pd-btn pd-btn-danger-outline"
                      onClick={openRejectFlow}
                      disabled={hasActiveMutation}
                    >
                      {isRejecting
                        ? t("specialist.caseRequests.rejecting")
                        : t("specialist.caseRequests.rejectCase")}
                    </button>
                  </>
                ) : null}

                {detail.canStartAssessment ? (
                  <button
                    type="button"
                    className="pd-btn pd-btn-ghost"
                    onClick={() => setConfirmDialog("start")}
                    disabled={hasActiveMutation}
                  >
                    {isStartingAssessment
                      ? t("specialist.caseRequests.startingAssessment")
                      : t("specialist.caseRequests.startAssessment")}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {toast ? <div className="pd-toast" role="status">{toast}</div> : null}

        {confirmDialog === "start" ? (
          <div className="pd-specialist-case-dialog-backdrop" role="presentation">
            <div className="pd-card pd-card-pad pd-specialist-case-dialog" role="dialog" aria-modal="true">
              <h2>{t("specialist.caseRequests.dialogs.startAssessmentTitle")}</h2>
              <p>{t("specialist.caseRequests.dialogs.startAssessmentBody")}</p>
              <div className="pd-specialist-case-dialog-actions">
                <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setConfirmDialog(null)}>
                  {t("common.cancel")}
                </button>
                <button type="button" className="pd-btn pd-btn-primary" onClick={handleConfirmStart}>
                  {t("specialist.caseRequests.startAssessment")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmDialog === "accept" ? (
          <div className="pd-specialist-case-dialog-backdrop" role="presentation">
            <div className="pd-card pd-card-pad pd-specialist-case-dialog" role="dialog" aria-modal="true">
              <h2>{t("specialist.caseRequests.dialogs.acceptTitle")}</h2>
              <p style={{ whiteSpace: "pre-line" }}>{t("specialist.caseRequests.dialogs.acceptBody")}</p>
              <div className="pd-specialist-case-dialog-actions">
                <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setConfirmDialog(null)}>
                  {t("common.cancel")}
                </button>
                <button type="button" className="pd-btn pd-btn-primary" onClick={handleConfirmAccept}>
                  {t("specialist.caseRequests.acceptCase")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmDialog === "reject" ? (
          <div className="pd-specialist-case-dialog-backdrop" role="presentation">
            <div className="pd-card pd-card-pad pd-specialist-case-dialog" role="dialog" aria-modal="true">
              <h2>{t("specialist.caseRequests.dialogs.rejectTitle")}</h2>
              <p>{t("specialist.caseRequests.dialogs.rejectBody")}</p>
              <label className="pd-form-label" htmlFor="sp-case-reject-reason">
                {t("specialist.caseRequests.dialogs.rejectReasonLabel")}
              </label>
              <textarea
                id="sp-case-reject-reason"
                className="pd-input pd-specialist-case-notes-input"
                rows={4}
                maxLength={2000}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder={t("specialist.caseRequests.dialogs.rejectReasonPlaceholder")}
              />
              {rejectError ? <p className="pd-specialist-case-reject-error">{rejectError}</p> : null}
              <div className="pd-specialist-case-dialog-actions">
                <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setConfirmDialog(null)}>
                  {t("common.cancel")}
                </button>
                <button type="button" className="pd-btn pd-btn-danger-outline" onClick={handleConfirmReject}>
                  {t("specialist.caseRequests.rejectCase")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </SpecialistDashboardShell>
    </div>
  );
}
