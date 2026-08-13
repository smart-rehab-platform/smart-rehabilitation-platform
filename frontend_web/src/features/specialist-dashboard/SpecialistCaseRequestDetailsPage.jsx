import { ArrowLeft, MessagesSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
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
          ? "Please wait while assessment notes are being saved."
          : isAccepting
            ? "Please wait while the patient profile is being created."
            : isRejecting
              ? "Please wait while the case is being rejected."
              : "Please wait while the assessment is starting.",
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
      showToast("Unable to copy.");
    }
  }, [showToast]);

  const handleOpenConversation = useCallback(() => {
    if (!detail?.conversationId) {
      return;
    }
    navigate(buildSpecialistMessagesPath(detail.conversationId));
  }, [detail, navigate]);

  const handleOpenPatient = useCallback(() => {
    if (!detail?.patientId) {
      showToast("Patient profile is unavailable for this request.");
      return;
    }
    navigate(buildSpecialistPatientDetailPath(detail.patientId));
  }, [detail, navigate, showToast]);

  const handleSaveNotes = useCallback(async () => {
    const notes = notesDraft.trim();
    if (!notes) {
      showToast("Assessment notes are required.");
      return;
    }
    if (notes.length > NOTES_MAX) {
      showToast("Assessment notes must not exceed 10000 characters.");
      return;
    }
    const success = await saveAssessmentNotes(notes);
    if (success) {
      setNotesDraft(notes);
      setNotesSeedKey(detail?.id || null);
      showToast("Assessment notes updated successfully");
    }
  }, [notesDraft, saveAssessmentNotes, showToast, detail?.id]);

  const handleConfirmStart = useCallback(async () => {
    setConfirmDialog(null);
    const success = await startAssessment();
    if (success) {
      showToast("Assessment started successfully");
    }
  }, [startAssessment, showToast]);

  const handleConfirmAccept = useCallback(async () => {
    setConfirmDialog(null);
    const patientId = await acceptCase();
    if (patientId) {
      showToast("Patient profile created successfully.");
      navigate(buildSpecialistPatientDetailPath(patientId));
    }
  }, [acceptCase, navigate, showToast]);

  const handleConfirmReject = useCallback(async () => {
    const reason = rejectReason.trim();
    if (reason.length < 5) {
      setRejectError("reason must be at least 5 characters");
      return;
    }
    if (reason.length > 2000) {
      setRejectError("reason must not exceed 2000 characters");
      return;
    }
    setRejectError("");
    setConfirmDialog(null);
    const success = await rejectCase(reason);
    if (success) {
      setRejectReason("");
      showToast("Case request rejected successfully");
    }
  }, [rejectReason, rejectCase, showToast]);

  const openAcceptFlow = useCallback(() => {
    const savedNotes = detail?.assessmentNotes?.trim() || "";
    if (!savedNotes) {
      showToast("Save assessment notes before accepting this case.");
      return;
    }
    if (notesDirty) {
      showToast("Save your assessment notes before accepting.");
      return;
    }
    setConfirmDialog("accept");
  }, [detail?.assessmentNotes, notesDirty, showToast]);

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
              Back to Case Requests
            </button>
          </div>

          <header className="pd-task-hub-header">
            <div>
              <h1>Case Request</h1>
              <p className="pd-section-sub">
                Review the submitted information before starting the assessment.
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
              <p>{error || "Case request not found."}</p>
              <div className="pd-specialist-case-state-actions">
                <button type="button" className="pd-btn pd-btn-primary" onClick={reload}>
                  Retry
                </button>
                <button type="button" className="pd-btn pd-btn-ghost" onClick={handleBack}>
                  Back
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
                    Retry
                  </button>
                </div>
              ) : null}

              <section className="pd-card pd-card-pad pd-specialist-case-summary">
                <div className="pd-specialist-case-summary-main">
                  <strong className="pd-specialist-case-summary-title">{detail.childName}</strong>
                  {detail.categoryName ? (
                    <span className="pd-specialist-case-summary-category">{detail.categoryName}</span>
                  ) : null}
                  <div className="pd-specialist-case-summary-meta">
                    <StatusBadge label={detail.statusLabel} tone={detail.statusTone} />
                    <span>{detail.headerDateLabel}</span>
                  </div>
                  {detail.parentName ? (
                    <p className="pd-specialist-case-summary-parent">Parent: {detail.parentName}</p>
                  ) : null}
                </div>
              </section>

              <div className="pd-specialist-case-details-grid">
                <SpecialistCaseRequestTimeline steps={detail.timelineSteps} />
                <SpecialistCaseRequestChildInfo detail={detail} />
              </div>

              {detail.isRejected ? (
                <section className="pd-card pd-card-pad pd-specialist-case-rejection">
                  <h2 className="pd-specialist-case-section-title">Rejection Reason</h2>
                  <p className="pd-specialist-case-field-value">
                    {detail.rejectionReason?.trim() || "No rejection reason was provided."}
                  </p>
                </section>
              ) : null}

              {detail.isConverted ? (
                <section className="pd-card pd-card-pad pd-specialist-case-conversion">
                  <h2 className="pd-specialist-case-section-title">
                    Patient profile created successfully.
                  </h2>
                  {detail.patientId ? (
                    <button
                      type="button"
                      className="pd-btn pd-btn-primary"
                      onClick={handleOpenPatient}
                    >
                      Open Patient Profile
                    </button>
                  ) : (
                    <p className="pd-section-sub">
                      Converted status is present, but no patient profile id was returned.
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
                onCopyEmail={() => copyText(detail.parent?.email, "Email copied")}
                onCopyPhone={() => copyText(detail.parent?.phone, "Phone number copied")}
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
                    Open Conversation
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
                      {isAccepting ? "Creating patient profile..." : "Accept Case"}
                    </button>
                    <button
                      type="button"
                      className="pd-btn pd-btn-danger-outline"
                      onClick={openRejectFlow}
                      disabled={hasActiveMutation}
                    >
                      {isRejecting ? "Rejecting..." : "Reject Case"}
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
                    {isStartingAssessment ? "Starting..." : "Start Assessment"}
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
              <h2>Start Assessment</h2>
              <p>
                Contact the parent first if you have not already. Start the preliminary assessment for this case?
              </p>
              <div className="pd-specialist-case-dialog-actions">
                <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setConfirmDialog(null)}>
                  Cancel
                </button>
                <button type="button" className="pd-btn pd-btn-primary" onClick={handleConfirmStart}>
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmDialog === "accept" ? (
          <div className="pd-specialist-case-dialog-backdrop" role="presentation">
            <div className="pd-card pd-card-pad pd-specialist-case-dialog" role="dialog" aria-modal="true">
              <h2>Accept Case</h2>
              <p>
                Accept this case for continued rehabilitation follow-up?
                <br />
                <br />
                The patient profile will not be created yet.
              </p>
              <div className="pd-specialist-case-dialog-actions">
                <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setConfirmDialog(null)}>
                  Cancel
                </button>
                <button type="button" className="pd-btn pd-btn-primary" onClick={handleConfirmAccept}>
                  Accept Case
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmDialog === "reject" ? (
          <div className="pd-specialist-case-dialog-backdrop" role="presentation">
            <div className="pd-card pd-card-pad pd-specialist-case-dialog" role="dialog" aria-modal="true">
              <h2>Reject Case</h2>
              <p>This reason will be visible to the parent.</p>
              <label className="pd-form-label" htmlFor="sp-case-reject-reason">
                Reason for rejection
              </label>
              <textarea
                id="sp-case-reject-reason"
                className="pd-input pd-specialist-case-notes-input"
                rows={4}
                maxLength={2000}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Enter rejection reason"
              />
              {rejectError ? <p className="pd-specialist-case-reject-error">{rejectError}</p> : null}
              <div className="pd-specialist-case-dialog-actions">
                <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setConfirmDialog(null)}>
                  Cancel
                </button>
                <button type="button" className="pd-btn pd-btn-danger-outline" onClick={handleConfirmReject}>
                  Reject Case
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </SpecialistDashboardShell>
    </div>
  );
}
