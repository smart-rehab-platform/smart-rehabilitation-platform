import { useCallback, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistMessagesPath,
  buildSpecialistPatientAiRecommendationsPath,
  buildSpecialistPatientAssignExercisePath,
  buildSpecialistPatientGoalsPath,
  buildSpecialistPatientReportsPath,
  buildSpecialistPatientSpeechAnalysisPath,
  buildSpecialistCreateTreatmentPlanPath,
  buildSpecialistEditTreatmentPlanPath,
  buildSpecialistReviewExercisePath,
} from "../../routes/specialistDashboardRoutes";
import { useSpecialistPatientDetails } from "./hooks/useSpecialistPatientDetails";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistAddNoteDialog } from "./components/SpecialistAddNoteDialog";
import { SpecialistAssignedExercises } from "./sections/SpecialistAssignedExercises";
import { SpecialistFamilyPatternInsight } from "./sections/SpecialistFamilyPatternInsight";
import {
  SpecialistNotesSection,
  SpecialistPatientFooterActions,
} from "./sections/SpecialistNotesSection";
import { SpecialistPatientGoals } from "./sections/SpecialistPatientGoals";
import {
  SpecialistPatientHeader,
  SpecialistPatientMessageParentButton,
} from "./sections/SpecialistPatientHeader";
import { SpecialistPatientQuickStats } from "./sections/SpecialistPatientQuickStats";
import { SpecialistPatientTreatmentPlan } from "./sections/SpecialistPatientTreatmentPlan";
import { SpecialistRecentSubmissions } from "./sections/SpecialistRecentSubmissions";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistPatientDetailsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const goalsRef = useRef(null);
  const exercisesRef = useRef(null);
  const submissionsRef = useRef(null);

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
    details,
    isLoading,
    error,
    isSavingNote,
    familyPattern,
    familyPatternDetails,
    isLoadingFamilyPattern,
    familyPatternError,
    isOpeningConversation,
    refetch,
    addNote,
    openMessageParent,
    loadFamilyPatternDetailsPanel,
    retryFamilyPattern,
  } = useSpecialistPatientDetails(patientId, specialistUserId);

  const scrollToSection = useCallback((target) => {
    const map = {
      goals: goalsRef,
      exercises: exercisesRef,
      submissions: submissionsRef,
    };
    const node = map[target]?.current;
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (target === "reports") {
      navigate(buildSpecialistPatientReportsPath(patientId));
    }
  }, [navigate, patientId]);

  const handleBack = useCallback(() => {
    navigate(SPECIALIST_WEB_ROUTES.patients);
  }, [navigate]);

  const handleMessageParent = useCallback(async () => {
    try {
      const conversationId = await openMessageParent();
      if (conversationId) {
        navigate(buildSpecialistMessagesPath(conversationId));
      }
    } catch (messageError) {
      showToast(messageError instanceof Error ? messageError.message : "Unable to open conversation.");
    }
  }, [openMessageParent, navigate, showToast]);

  const handleAddNote = useCallback(async (noteText) => {
    const ok = await addNote(noteText);
    if (ok) {
      showToast("Note saved");
    }
    return ok;
  }, [addNote, showToast]);

  const handleReviewExercises = useCallback(() => {
    const pending = (details?.recentSubmissions || []).filter(
      (submission) => submission.reviewStatusRaw === "pending",
    );
    if (pending.length > 0 && pending[0].id) {
      navigate(buildSpecialistReviewExercisePath(pending[0].id));
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.reviews);
  }, [details, navigate]);

  const handleSubmissionClick = useCallback((submission) => {
    if (!submission?.id) {
      return;
    }
    navigate(buildSpecialistReviewExercisePath(submission.id));
  }, [navigate]);

  const handleAssignExercise = useCallback(() => {
    const plan = details?.treatmentPlan;
    if (!plan?.isActive) {
      showToast("An active treatment plan is required before assigning an exercise.");
      navigate(SPECIALIST_WEB_ROUTES.treatmentPlans);
      return;
    }
    navigate(buildSpecialistPatientAssignExercisePath(patientId, plan.id));
  }, [details, navigate, patientId, showToast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading patient details...</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            Retry
          </button>
        </section>
      );
    }

    if (!details) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">Patient not found.</p>
        </section>
      );
    }

    return (
      <div className="pd-specialist-patient-details">
        <SpecialistPatientHeader
          patient={details.patient}
          diagnosis={details.diagnosis}
          overallProgressPercent={details.overallProgressPercent}
        />

        <SpecialistPatientMessageParentButton
          onClick={handleMessageParent}
          isLoading={isOpeningConversation}
        />

        <SpecialistPatientQuickStats stats={details.stats} onStatClick={scrollToSection} />

        <SpecialistFamilyPatternInsight
          insight={familyPattern}
          isLoading={isLoadingFamilyPattern}
          error={familyPatternError}
          details={familyPatternDetails}
          onRetry={retryFamilyPattern}
          onOpenDetails={loadFamilyPatternDetailsPanel}
        />

        <SpecialistPatientTreatmentPlan
          treatmentPlan={details.treatmentPlan}
          onCreatePlan={() => navigate(
            buildSpecialistCreateTreatmentPlanPath(patientId, details.patient.fullName),
          )}
          onEditPlan={() => {
            if (details.treatmentPlan?.id) {
              navigate(buildSpecialistEditTreatmentPlanPath(details.treatmentPlan.id));
            }
          }}
        />

        <div ref={goalsRef}>
          <SpecialistPatientGoals
            goals={details.goals}
            hasActivePlan={Boolean(details.treatmentPlan?.isActive)}
            onManageGoals={() => navigate(buildSpecialistPatientGoalsPath(patientId))}
          />
        </div>

        <div ref={exercisesRef}>
          <SpecialistAssignedExercises
            exercises={details.assignedExercises}
            onAssignExercise={handleAssignExercise}
          />
        </div>

        <div ref={submissionsRef}>
          <SpecialistRecentSubmissions
            submissions={details.recentSubmissions}
            onReviewExercises={handleReviewExercises}
            onSubmissionClick={handleSubmissionClick}
          />
        </div>

        <SpecialistNotesSection
          notes={details.notes}
          onAddNote={() => setNoteDialogOpen(true)}
        />

        <SpecialistPatientFooterActions
          hasActivePlan={Boolean(details.treatmentPlan?.isActive)}
          onReviewExercises={handleReviewExercises}
          onViewReports={() => navigate(buildSpecialistPatientReportsPath(patientId))}
          onCreateTreatmentPlan={() => navigate(
            buildSpecialistCreateTreatmentPlanPath(patientId, details.patient.fullName),
          )}
          onEditTreatmentPlan={() => {
            if (details.treatmentPlan?.id) {
              navigate(buildSpecialistEditTreatmentPlanPath(details.treatmentPlan.id));
            } else {
              showToast("No treatment plan found for this patient.");
            }
          }}
          onAiRecommendations={() => navigate(buildSpecialistPatientAiRecommendationsPath(patientId))}
          onSpeechAnalysis={() => navigate(buildSpecialistPatientSpeechAnalysisPath(patientId))}
        />
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
              Back to Patients
            </button>
          </div>
          <div className="pd-task-hub-panel">{renderContent()}</div>
        </div>
      </SpecialistDashboardShell>

      <SpecialistAddNoteDialog
        key={noteDialogOpen ? "open" : "closed"}
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        onSubmit={handleAddNote}
        isSaving={isSavingNote}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
