import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistPatientDetailPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistTreatmentPlanForm } from "./components/SpecialistTreatmentPlanForm";
import { useSpecialistTreatmentPlanCreate } from "./hooks/useSpecialistTreatmentPlanCreate";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistTreatmentPlanCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") || "";
  const patientName = searchParams.get("patientName") || "";
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
    patients,
    isLoadingPatients,
    isSaving,
    error,
    validationMessage,
    selectedPatientId,
    selectedPatientName,
    title,
    startDate,
    endDate,
    isPatientLocked,
    setTitle,
    setStartDate,
    setEndDate,
    selectPatient,
    create,
  } = useSpecialistTreatmentPlanCreate(specialistUserId, { patientId, patientName });

  const handleBack = useCallback(() => {
    if (patientId) {
      navigate(buildSpecialistPatientDetailPath(patientId));
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.treatmentPlans);
  }, [navigate, patientId]);

  const handleCreate = useCallback(async () => {
    const result = await create();
    if (result.ok) {
      showToast("Treatment plan created successfully");
      handleBack();
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [create, showToast, handleBack]);

  const renderContent = () => {
    if (isLoadingPatients && !isPatientLocked) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading patients...</p>
        </section>
      );
    }

    return (
      <SpecialistTreatmentPlanForm
        mode="create"
        patientName={selectedPatientName}
        title={title}
        startDate={startDate}
        endDate={endDate}
        isSaving={isSaving}
        validationMessage={validationMessage}
        errorMessage={error}
        showStatusSelector={false}
        showActiveBadge
        showPatientSelector={!isPatientLocked}
        patients={patients}
        selectedPatientId={selectedPatientId}
        isPatientLocked={isPatientLocked}
        onTitleChange={setTitle}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onPatientChange={selectPatient}
        onSubmit={handleCreate}
        onCancel={handleBack}
      />
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
          <div className="pd-task-hub-panel pd-specialist-treatment-plan-create-page pd-specialist-treatment-plan-edit-page">
            <header className="pd-specialist-treatment-plan-page-header">
              <button
                type="button"
                className="pd-specialist-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </button>
              <div className="pd-specialist-treatment-plan-page-heading">
                <h1 className="pd-section-title">Create Treatment Plan</h1>
                <p className="pd-section-sub">
                  Create a treatment plan and define its active period.
                </p>
              </div>
            </header>
            <div className="pd-specialist-treatment-plan-edit-content">
              {renderContent()}
            </div>
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
