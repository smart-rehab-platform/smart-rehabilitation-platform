import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { SPECIALIST_WEB_ROUTES } from "../../routes/specialistDashboardRoutes";
import { SpecialistScheduleSessionForm } from "./components/SpecialistScheduleSessionForm";
import { useSpecialistScheduleSessionCreate } from "./hooks/useSpecialistScheduleSessionCreate";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistScheduleSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") || "";
  const notes = searchParams.get("notes") || "";
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
    selectedPatient,
    isLoadingPatients,
    isSaving,
    error,
    fieldErrors,
    title,
    scheduledDate,
    scheduledTime,
    duration,
    locationOrLink,
    sessionNotes,
    setTitle,
    setScheduledDate,
    setScheduledTime,
    setDuration,
    setLocationOrLink,
    setSessionNotes,
    selectPatient,
    create,
  } = useSpecialistScheduleSessionCreate(specialistUserId, { patientId, notes });

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.sessions);
  }, [navigate]);

  const handleCreate = useCallback(async () => {
    const result = await create();
    if (result.ok) {
      showToast("Session scheduled successfully.");
      handleBack();
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [create, showToast, handleBack]);

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
        <div className="pd-task-hub-page pd-specialist-schedule-session-shell">
          <div className="pd-task-hub-panel pd-specialist-schedule-session-page">
            <header className="pd-specialist-schedule-session-header">
              <button
                type="button"
                className="pd-specialist-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </button>
              <div className="pd-specialist-schedule-session-heading">
                <h1 className="pd-section-title">Schedule Session</h1>
                <p className="pd-section-sub">
                  Schedule a session for one of your assigned patients.
                </p>
              </div>
            </header>

            <SpecialistScheduleSessionForm
              patients={patients}
              selectedPatient={selectedPatient}
              title={title}
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
              duration={duration}
              locationOrLink={locationOrLink}
              sessionNotes={sessionNotes}
              isSaving={isSaving}
              isLoadingPatients={isLoadingPatients}
              fieldErrors={fieldErrors}
              errorMessage={error}
              onTitleChange={setTitle}
              onScheduledDateChange={setScheduledDate}
              onScheduledTimeChange={setScheduledTime}
              onDurationChange={setDuration}
              onLocationOrLinkChange={setLocationOrLink}
              onSessionNotesChange={setSessionNotes}
              onPatientSelect={selectPatient}
              onSubmit={handleCreate}
              onCancel={handleBack}
            />
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
