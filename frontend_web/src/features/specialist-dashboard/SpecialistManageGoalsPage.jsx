import { ArrowLeft, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import { buildSpecialistPatientDetailPath } from "../../routes/specialistDashboardRoutes";
import {
  SpecialistAddGoalDialog,
  SpecialistEditGoalDialog,
  SpecialistUpdateGoalProgressDialog,
} from "./components/SpecialistManageGoalsDialogs";
import { SpecialistManageGoalCard } from "./components/SpecialistManageGoalCard";
import { SpecialistManageGoalsPatientHeader } from "./components/SpecialistManageGoalsPatientHeader";
import { useSpecialistManageGoals } from "./hooks/useSpecialistManageGoals";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistManageGoalsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { user, isInitializing } = useAuth();
  const { t } = useLocale();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const [dialogState, setDialogState] = useState({ type: null, goal: null });

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
    goals,
    hasActivePlan,
    isLoading,
    isSaving,
    error,
    reload,
    createGoal,
    editGoal,
    updateProgress,
  } = useSpecialistManageGoals(patientId, Boolean(specialistUserId));

  const handleBack = useCallback(() => {
    if (patientId) {
      navigate(buildSpecialistPatientDetailPath(patientId));
      return;
    }
    navigate(-1);
  }, [navigate, patientId]);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, goal: null });
  }, []);

  const handleCreateGoal = useCallback(async (form) => {
    const result = await createGoal(form);
    if (result.ok) {
      showToast(result.message);
    }
    return result;
  }, [createGoal, showToast]);

  const handleEditGoal = useCallback(async (form) => {
    if (!dialogState.goal?.id) {
      return { ok: false };
    }
    const result = await editGoal(dialogState.goal.id, form);
    if (result.ok) {
      showToast(result.message);
    }
    return result;
  }, [dialogState.goal, editGoal, showToast]);

  const handleUpdateProgress = useCallback(async (form) => {
    if (!dialogState.goal?.id) {
      return { ok: false };
    }
    const result = await updateProgress(dialogState.goal.id, form);
    if (result.ok) {
      showToast(result.message);
    }
    return result;
  }, [dialogState.goal, updateProgress, showToast]);

  const renderContent = () => {
    if (isLoading && !bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.goals.loading")}</p>
        </section>
      );
    }

    if (error && !bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (!bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{t("specialist.goals.couldNotLoad")}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (!hasActivePlan) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{t("specialist.goals.noActivePlanForPatient")}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    return (
      <div className="pd-specialist-manage-goals-stack">
        <SpecialistManageGoalsPatientHeader
          patientName={bundle.patient?.fullName || t("specialist.patientDetails.notFound")}
          planTitle={bundle.plan?.title}
          profileImageUrl={bundle.patient?.profileImageUrl}
        />

        <section className="pd-specialist-manage-goals-section">
          <div className="pd-specialist-manage-goals-section-head">
            <h2 className="pd-section-title">{t("specialist.goals.sectionTitle")}</h2>
            <button
              type="button"
              className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn"
              onClick={() => setDialogState({ type: "add", goal: null })}
              disabled={isSaving}
            >
              <Plus size={14} aria-hidden="true" />
              {isSaving ? t("specialist.patientDetails.savingNote") : t("specialist.goals.addNewGoal")}
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="pd-card pd-card-pad">
              <p className="pd-section-sub">{t("specialist.goals.noGoalsForPlan")}</p>
            </div>
          ) : (
            <div className="pd-specialist-manage-goals-list">
              {goals.map((goal) => (
                <SpecialistManageGoalCard
                  key={goal.id}
                  goal={goal}
                  isSaving={isSaving}
                  onUpdateProgress={() => setDialogState({ type: "progress", goal })}
                  onEdit={() => setDialogState({ type: "edit", goal })}
                />
              ))}
            </div>
          )}
        </section>
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
        <div className="pd-specialist-manage-goals-page">
          <header className="pd-specialist-exercise-page-header">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack} disabled={isSaving}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("specialist.patientDetails.back")}
            </button>
            <div>
              <h1 className="pd-section-title">{t("specialist.patientDetails.manageGoals")}</h1>
            </div>
          </header>

          {renderContent()}
        </div>
      </SpecialistDashboardShell>

      <SpecialistAddGoalDialog
        open={dialogState.type === "add"}
        onClose={closeDialog}
        onSubmit={handleCreateGoal}
        isSaving={isSaving}
        planId={bundle?.planId ?? ""}
      />
      <SpecialistEditGoalDialog
        open={dialogState.type === "edit"}
        goal={dialogState.goal}
        onClose={closeDialog}
        onSubmit={handleEditGoal}
        isSaving={isSaving}
      />
      <SpecialistUpdateGoalProgressDialog
        open={dialogState.type === "progress"}
        goal={dialogState.goal}
        onClose={closeDialog}
        onSubmit={handleUpdateProgress}
        isSaving={isSaving}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
