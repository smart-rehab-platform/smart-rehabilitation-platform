import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { SPECIALIST_WEB_ROUTES } from "../../routes/specialistDashboardRoutes";
import { SpecialistTreatmentPlanForm } from "./components/SpecialistTreatmentPlanForm";
import { useSpecialistTreatmentPlanEdit } from "./hooks/useSpecialistTreatmentPlanEdit";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistTreatmentPlanGoalsPreview } from "./sections/SpecialistTreatmentPlanGoalsPreview";
import { getTreatmentPlanStatusMeta } from "./utils/specialistTreatmentPlanMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

function computeGoalsOverallProgress(goals) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return null;
  }
  const total = goals.reduce((sum, goal) => sum + (goal.completionPercent || 0), 0);
  return Math.round(total / goals.length);
}

export default function SpecialistTreatmentPlanEditPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
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
    isSaving,
    error,
    unauthorized,
    validationMessage,
    title,
    status,
    startDate,
    endDate,
    setTitle,
    setStatus,
    setStartDate,
    setEndDate,
    reload,
    save,
  } = useSpecialistTreatmentPlanEdit(specialistUserId, planId);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.treatmentPlans);
  }, [navigate]);

  const handleSave = useCallback(async () => {
    const result = await save();
    if (result.ok) {
      showToast("Treatment plan updated successfully");
      handleBack();
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [save, showToast, handleBack]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading treatment plan...</p>
        </section>
      );
    }

    if (unauthorized) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">Treatment plan not found or you do not have access.</p>
        </section>
      );
    }

    if (error && !bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            Retry
          </button>
        </section>
      );
    }

    if (!bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">Treatment plan not found.</p>
        </section>
      );
    }

    return (
      <div className="pd-specialist-treatment-plan-edit-content">
        <SpecialistTreatmentPlanForm
          mode="edit"
          patientName={bundle.patientName}
          overallProgressPercent={computeGoalsOverallProgress(bundle.goals)}
          planStatusLabel={getTreatmentPlanStatusMeta(status).label}
          planStatusTone={getTreatmentPlanStatusMeta(status).tone}
          title={title}
          status={status}
          startDate={startDate}
          endDate={endDate}
          isSaving={isSaving}
          validationMessage={validationMessage}
          errorMessage={error}
          onTitleChange={setTitle}
          onStatusChange={setStatus}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSubmit={handleSave}
          onCancel={handleBack}
          beforeActions={(
            <section className="pd-specialist-treatment-plan-goals-section">
              <h2 className="pd-specialist-treatment-plan-section-title">Current Goals</h2>
              <SpecialistTreatmentPlanGoalsPreview goals={bundle.goals} variant="edit" />
            </section>
          )}
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
        <div className="pd-task-hub-page pd-specialist-treatment-plan-edit-shell">
          <div className="pd-task-hub-panel pd-specialist-treatment-plan-edit-page">
            <header className="pd-specialist-treatment-plan-page-header">
              <button
                type="button"
                className="pd-specialist-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </button>
              <h1 className="pd-section-title">Edit Treatment Plan</h1>
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
