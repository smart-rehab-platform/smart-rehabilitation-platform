import { ArrowLeft, BookOpen, ChevronRight, MessageSquareText } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SpecialistExerciseInstructionMedia } from "./components/SpecialistExerciseMediaSection";
import { SpecialistExerciseCategoryBadge } from "./components/SpecialistExerciseCategoryBadge";
import { SpecialistExerciseCategoryIcon } from "./components/SpecialistExerciseCategoryIcon";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import { useTranslatedExerciseContent } from "../../hooks/useTranslatedExerciseContent";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistExerciseDetailPath,
  buildSpecialistPatientDetailPath,
  buildSpecialistReviewExercisePath,
} from "../../routes/specialistDashboardRoutes";
import { StatusBadge } from "../shared-dashboard/components/StatusBadge";
import { useSpecialistAssignedExerciseDetail } from "./hooks/useSpecialistAssignedExerciseDetail";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { getExerciseAssignmentFrequencyLabel } from "./utils/specialistAssignExerciseLocalization";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistAssignedExerciseDetailsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { assignedExerciseId } = useParams();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

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
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
    showToast,
  } = useSpecialistShell(specialistUserId);

  const {
    assignment,
    latestSubmission,
    isLoading,
    error,
    notFound,
    isDeactivating,
    deactivateError,
    reload,
    deactivate,
  } = useSpecialistAssignedExerciseDetail(
    assignedExerciseId,
    Boolean(specialistUserId),
  );

  const translated = useTranslatedExerciseContent({
    title: assignment?.exerciseTitle || "",
    description: assignment?.description || "",
    instructions: assignment?.instructions || "",
  });

  const handleBack = useCallback(() => {
    if (assignment?.patientId) {
      navigate(buildSpecialistPatientDetailPath(assignment.patientId));
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.patients);
  }, [assignment?.patientId, navigate]);

  const handleOpenLibrary = useCallback(() => {
    if (!assignment?.exerciseId) {
      return;
    }
    navigate(buildSpecialistExerciseDetailPath(assignment.exerciseId));
  }, [assignment?.exerciseId, navigate]);

  const handleOpenSubmission = useCallback(() => {
    if (!latestSubmission?.id) {
      return;
    }
    navigate(buildSpecialistReviewExercisePath(latestSubmission.id));
  }, [latestSubmission?.id, navigate]);

  const handleConfirmDeactivate = useCallback(async () => {
    if (isDeactivating) {
      return;
    }
    const result = await deactivate();
    if (result?.ok) {
      setConfirmDeactivateOpen(false);
      showToast(t("specialist.assignedExerciseDetails.deactivateSuccess"));
    }
  }, [deactivate, isDeactivating, showToast, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.assignedExerciseDetails.loading")}</p>
        </section>
      );
    }

    if (notFound) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{t("specialist.assignedExerciseDetails.notFound")}</p>
        </section>
      );
    }

    if (error && !assignment) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (!assignment) {
      return null;
    }

    const description = translated.description?.trim();
    const instructions = translated.instructions?.trim();
    const frequencyLabel = assignment.frequency
      ? getExerciseAssignmentFrequencyLabel(assignment.frequency, t)
      : t("specialist.assignedExerciseDetails.emptyValue");
    const assignedLabel =
      assignment.assignedAtLabel || t("specialist.assignedExerciseDetails.emptyValue");
    const dueLabel =
      assignment.dueDateLabel
      || t("specialist.assignedExerciseDetails.noDueDate");

    return (
      <div className="pd-specialist-exercise-details">
        <section className="pd-card pd-card-pad pd-specialist-exercise-details-hero">
          <div className="pd-specialist-exercise-details-head">
            <SpecialistExerciseCategoryIcon category={assignment.category} />
            <div className="pd-specialist-exercise-details-copy">
              <h2 className="pd-specialist-exercise-details-title" dir="auto">
                {translated.title || assignment.exerciseTitle}
              </h2>
              {assignment.category ? (
                <SpecialistExerciseCategoryBadge
                  category={assignment.category}
                  label={assignment.category}
                />
              ) : null}
              <div className="pd-specialist-assigned-exercise-status">
                <StatusBadge
                  label={assignment.statusLabel}
                  tone={assignment.isActive ? "success" : "gray"}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="pd-specialist-exercise-details-grid">
          <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
            <h3 className="pd-specialist-exercise-details-section-title">
              {t("specialist.exercises.details.description")}
            </h3>
            <p className="pd-specialist-exercise-details-body" dir="auto">
              {description || t("specialist.exercises.details.noDescription")}
            </p>
          </section>

          <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
            <h3 className="pd-specialist-exercise-details-section-title">
              {t("specialist.exercises.details.instructions")}
            </h3>
            <p className="pd-specialist-exercise-details-body" dir="auto">
              {instructions || t("specialist.exercises.details.noInstructions")}
            </p>
          </section>
        </div>

        {assignment.hasInstructionMedia ? (
          <SpecialistExerciseInstructionMedia
            mediaUrl={assignment.instructionMediaUrl}
            title={t("specialist.assignedExerciseDetails.instructionalMedia")}
          />
        ) : null}

        <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
          <h3 className="pd-specialist-exercise-details-section-title">
            {t("specialist.assignedExerciseDetails.assignmentSection")}
          </h3>
          <div className="pd-specialist-assigned-exercise-meta">
            <div className="pd-specialist-treatment-plan-meta-row">
              <span className="pd-specialist-treatment-plan-meta-label">
                {t("specialist.assignedExerciseDetails.status")}
              </span>
              <span className="pd-specialist-treatment-plan-meta-value">
                {assignment.statusLabel}
              </span>
            </div>
            <div className="pd-specialist-treatment-plan-meta-row">
              <span className="pd-specialist-treatment-plan-meta-label">
                {t("specialist.assignedExerciseDetails.frequency")}
              </span>
              <span className="pd-specialist-treatment-plan-meta-value">{frequencyLabel}</span>
            </div>
            <div className="pd-specialist-treatment-plan-meta-row">
              <span className="pd-specialist-treatment-plan-meta-label">
                {t("specialist.assignedExerciseDetails.assigned")}
              </span>
              <span className="pd-specialist-treatment-plan-meta-value">{assignedLabel}</span>
            </div>
            <div className="pd-specialist-treatment-plan-meta-row">
              <span className="pd-specialist-treatment-plan-meta-label">
                {t("specialist.assignedExerciseDetails.dueDate")}
              </span>
              <span className="pd-specialist-treatment-plan-meta-value">{dueLabel}</span>
            </div>
          </div>
        </section>

        <section className="pd-specialist-assigned-exercise-submissions">
          <h3 className="pd-specialist-subsection-title">
            {t("specialist.assignedExerciseDetails.latestSubmission")}
          </h3>
          {!latestSubmission ? (
            <div className="pd-card pd-card-pad">
              <p className="pd-section-sub">
                {t("specialist.assignedExerciseDetails.noSubmissions")}
              </p>
            </div>
          ) : (
            <button
              type="button"
              className="pd-card pd-card-pad pd-specialist-patient-list-row pd-specialist-patient-list-row-btn"
              onClick={handleOpenSubmission}
              disabled={!latestSubmission.id}
            >
              <div className="pd-specialist-assigned-exercise-submission-main">
                <MessageSquareText size={18} aria-hidden="true" />
                <div>
                  <strong>{latestSubmission.reviewStatus}</strong>
                  <p className="pd-section-sub">
                    {latestSubmission.submittedAtLabel
                      || t("specialist.assignedExerciseDetails.recentlySubmitted")}
                  </p>
                </div>
              </div>
              {latestSubmission.id ? (
                <div className="pd-specialist-patient-list-row-aside">
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
              ) : null}
            </button>
          )}
        </section>

        <div className="pd-specialist-assigned-exercise-actions">
          {assignment.exerciseId ? (
            <button
              type="button"
              className="pd-btn pd-btn-outline pd-specialist-assigned-exercise-open-library"
              onClick={handleOpenLibrary}
            >
              <BookOpen size={16} aria-hidden="true" />
              {t("specialist.assignedExerciseDetails.openLibraryExercise")}
            </button>
          ) : null}

          {assignment.isActive ? (
            <button
              type="button"
              className="pd-btn pd-btn-danger-outline"
              onClick={() => setConfirmDeactivateOpen(true)}
              disabled={isDeactivating}
            >
              {t("specialist.assignedExerciseDetails.deactivateAssignment")}
            </button>
          ) : (
            <p className="pd-section-sub pd-specialist-assigned-exercise-inactive-note">
              {t("specialist.assignedExerciseDetails.alreadyInactive")}
            </p>
          )}
        </div>
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
        <div className="pd-specialist-exercise-details-page">
          <header className="pd-specialist-exercise-page-header">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("specialist.assignedExerciseDetails.back")}
            </button>
            <h1 className="pd-section-title">{t("specialist.assignedExerciseDetails.title")}</h1>
          </header>

          {renderContent()}
        </div>
      </SpecialistDashboardShell>

      {confirmDeactivateOpen ? (
        <div className="pd-modal-backdrop" role="presentation">
          <div
            className="pd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="specialist-deactivate-assignment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="specialist-deactivate-assignment-title" className="pd-modal-title">
              {t("specialist.assignedExerciseDetails.deactivateTitle")}
            </h2>
            <p className="pd-section-sub">
              {t("specialist.assignedExerciseDetails.deactivateBody")}
            </p>
            {deactivateError ? (
              <p className="pd-inline-error" role="alert">{deactivateError}</p>
            ) : null}
            <div className="pd-modal-actions">
              <button
                type="button"
                className="pd-btn pd-btn-soft"
                onClick={() => setConfirmDeactivateOpen(false)}
                disabled={isDeactivating}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="pd-btn pd-btn-danger-outline"
                onClick={handleConfirmDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating
                  ? t("specialist.assignedExerciseDetails.deactivating")
                  : t("specialist.assignedExerciseDetails.deactivateConfirm")}
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
