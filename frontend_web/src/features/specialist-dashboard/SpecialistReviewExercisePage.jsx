import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistPatientSpeechAnalysisPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistReviewHeader } from "./components/SpecialistReviewHeader";
import { SpecialistSubmissionMedia } from "./components/SpecialistSubmissionMedia";
import { useSpecialistExerciseReview } from "./hooks/useSpecialistExerciseReview";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistReviewForm } from "./sections/SpecialistReviewForm";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistReviewExercisePage() {
  const navigate = useNavigate();
  const { submissionId } = useParams();
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
    bundle,
    isLoading,
    error,
    starRating,
    setStarRating,
    feedback,
    setFeedback,
    requiresRetry,
    setRequiresRetry,
    isSubmitting,
    submitError,
    reload,
    submitReview,
    isUpdate,
  } = useSpecialistExerciseReview(submissionId, specialistUserId);

  const hasAudio = bundle?.media?.some((item) => item.mediaType.toLowerCase() === "audio") ?? false;

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.reviews);
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    const ok = await submitReview();
    if (ok) {
      showToast("Review submitted successfully");
      handleBack();
    }
  }, [submitReview, showToast, handleBack]);

  const handleSpeechAnalysis = useCallback(() => {
    const patientId = bundle?.submission?.patientId;
    if (!patientId || !submissionId) {
      return;
    }
    navigate(buildSpecialistPatientSpeechAnalysisPath(patientId, submissionId));
  }, [bundle, submissionId, navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading submission...</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            Retry
          </button>
        </section>
      );
    }

    if (!bundle?.submission) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">Submission not found.</p>
        </section>
      );
    }

    return (
      <div className="pd-specialist-review-content">
        <SpecialistReviewHeader submission={bundle.submission} />
        <div className="pd-specialist-review-body-grid">
          <SpecialistSubmissionMedia mediaItems={bundle.media} />
          <SpecialistReviewForm
            starRating={starRating}
            onStarRatingChange={setStarRating}
            feedback={feedback}
            onFeedbackChange={setFeedback}
            requiresRetry={requiresRetry}
            onRequiresRetryChange={setRequiresRetry}
            isSubmitting={isSubmitting}
            submitError={submitError}
            isUpdate={isUpdate}
            onSubmit={handleSubmit}
            showSpeechAnalysis={hasAudio && Boolean(bundle.submission.patientId)}
            onSpeechAnalysis={handleSpeechAnalysis}
          />
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
        <div className="pd-task-hub-page pd-specialist-review-shell">
          <div className="pd-task-hub-panel pd-specialist-review-page">
            <header className="pd-specialist-review-page-header">
              <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
                <ArrowLeft size={18} aria-hidden="true" />
                Back to Reviews
              </button>
              <h1 className="pd-section-title">Review Exercise</h1>
              <p className="pd-specialist-review-page-subtitle">
                Review the submitted exercise media and provide feedback.
              </p>
            </header>
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
