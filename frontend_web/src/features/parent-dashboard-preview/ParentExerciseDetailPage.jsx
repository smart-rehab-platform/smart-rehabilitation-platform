import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PARENT_WEB_ROUTES } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock, exerciseStatusMeta } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { InstructionMediaCard } from "./components/InstructionMediaCard";
import { ExerciseSubmissionForm } from "./components/ExerciseSubmissionForm";
import { StatusBadge } from "./components/StatusBadge";
import { useParentExerciseDetail } from "./hooks/useParentExerciseDetail";
import { useExerciseSubmission } from "./hooks/useExerciseSubmission";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import {
  getExerciseSubmissionStateMessage,
  isExerciseActionable,
  mapParentFromAuth,
} from "./utils/parentDashboardMappers";
import "./styles/parentDashboardTokens.css";

function formatFrequencyLabel(frequency) {
  if (!frequency) {
    return null;
  }

  if (frequency === "one_time") {
    return "One time";
  }

  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

function ExerciseDetailState({ message, isError = false }) {
  return (
    <section className="pd-card pd-card-pad pd-exercise-detail-state pd-section-enter">
      <p className={isError ? "pd-inline-error" : "pd-inline-loading"}>{message}</p>
    </section>
  );
}

export default function ParentExerciseDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isInitializing } = useAuth();
  const assignedExerciseId = searchParams.get("assignedExerciseId")?.trim() || null;
  const patientId = searchParams.get("patientId")?.trim() || null;

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const notificationUserId = isInitializing ? null : user?.id ?? null;

  const { viewModel, isLoading, error, refetch } = useParentExerciseDetail(
    assignedExerciseId,
    patientId,
  );

  const isActionable = viewModel ? isExerciseActionable(viewModel.status) : false;

  const handleSubmissionSuccess = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard, {
      state: {
        selectedChildId: patientId || viewModel?.patientId || undefined,
        refreshDashboard: true,
        toastMessage: "Exercise submitted successfully.",
      },
    });
  }, [navigate, patientId, viewModel?.patientId]);

  const submission = useExerciseSubmission({
    assignedExerciseId,
    isActionable,
    onRefresh: refetch,
    onSuccess: handleSubmissionSuccess,
  });

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(notificationUserId);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: patientId,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

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

  const statusMeta = viewModel?.status
    ? exerciseStatusMeta[viewModel.status] || exerciseStatusMeta.todo
    : null;

  const handleBack = useCallback(() => {
    if (submission.isSubmitting) {
      return;
    }

    navigate(PARENT_WEB_ROUTES.dashboard, {
      state: patientId ? { selectedChildId: patientId } : undefined,
    });
  }, [navigate, patientId, submission.isSubmitting]);

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

  const renderContent = () => {
    if (!assignedExerciseId) {
      return (
        <ExerciseDetailState
          message="No exercise was specified. Return to the dashboard and select a task."
          isError
        />
      );
    }

    if (isLoading) {
      return <ExerciseDetailState message="Loading exercise details..." />;
    }

    if (error) {
      return <ExerciseDetailState message={error} isError />;
    }

    if (!viewModel) {
      return (
        <ExerciseDetailState
          message="Exercise details are unavailable."
          isError
        />
      );
    }

    const frequencyLabel = formatFrequencyLabel(viewModel.frequency);
    const submissionStateMessage = getExerciseSubmissionStateMessage(viewModel.status);
    const showSubmissionForm = isActionable || submission.partialFailure;

    return (
      <div className="pd-exercise-detail-grid pd-section-enter">
        <section className="pd-card pd-card-pad pd-exercise-detail-hero" aria-label="Exercise overview">
          <div className="pd-exercise-detail-head">
            <div className="pd-exercise-detail-title-row">
              <h1 className="pd-exercise-detail-title">{viewModel.title}</h1>
              {statusMeta ? (
                <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
              ) : null}
            </div>
            {viewModel.childName ? (
              <p className="pd-exercise-detail-child">For {viewModel.childName}</p>
            ) : null}
          </div>

          {(frequencyLabel || viewModel.dueDate) ? (
            <ul className="pd-exercise-detail-meta">
              {frequencyLabel ? (
                <li>
                  <strong>Frequency</strong>
                  <span>{frequencyLabel}</span>
                </li>
              ) : null}
              {viewModel.dueDate ? (
                <li>
                  <strong>Due date</strong>
                  <span>{viewModel.dueDate}</span>
                </li>
              ) : null}
            </ul>
          ) : null}

          {submissionStateMessage && !submission.partialFailure ? (
            <p className="pd-exercise-submission-state">{submissionStateMessage}</p>
          ) : null}
        </section>

        <section className="pd-card pd-card-pad pd-exercise-detail-instructions" aria-label="Instructions">
          <h2 className="pd-section-title">Instructions</h2>
          {viewModel.instructions ? (
            <p className="pd-exercise-detail-instructions-body">{viewModel.instructions}</p>
          ) : (
            <p className="pd-exercise-detail-instructions-empty">
              Follow the specialist instructions for this exercise.
            </p>
          )}
        </section>

        {viewModel.instructionMediaUrl ? (
          <InstructionMediaCard
            mediaUrl={viewModel.instructionMediaUrl}
            mediaKind={viewModel.instructionMediaKind}
          />
        ) : null}

        {showSubmissionForm ? (
          <ExerciseSubmissionForm
            parentNotes={submission.parentNotes}
            onNotesChange={submission.setParentNotes}
            selectedFile={submission.selectedFile}
            onFileSelect={submission.handleFileSelect}
            onFileRemove={submission.clearSelectedFile}
            validationError={submission.validationError}
            submitError={submission.submitError}
            isSubmitting={submission.isSubmitting}
            canSubmit={submission.canSubmit}
            submitLabel={submission.submitLabel}
            isRetryStatus={viewModel.status === "needs_retry"}
            onSubmit={submission.submitExercise}
          />
        ) : submissionStateMessage ? (
          <section className="pd-card pd-card-pad pd-exercise-submission-closed pd-section-enter" aria-label="Submission status">
            <h2 className="pd-section-title">Submission</h2>
            <p className="pd-exercise-submission-state">{submissionStateMessage}</p>
          </section>
        ) : null}
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
        <div className="pd-exercise-detail-page">
          <div className="pd-exercise-detail-toolbar">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={handleBack}
              disabled={submission.isSubmitting}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Dashboard
            </button>
          </div>

          {renderContent()}
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
