import { ArrowLeft, ClipboardList } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import { buildSpecialistPatientDetailPath } from "../../routes/specialistDashboardRoutes";
import { UserProfileAvatar } from "../shared-dashboard/components/UserProfileAvatar";
import { SpecialistAssignExerciseAssignmentForm } from "./components/SpecialistAssignExerciseAssignmentForm";
import { SpecialistAssignExerciseSelectedSummary } from "./components/SpecialistAssignExerciseSelectedSummary";
import { useSpecialistAssignExercise } from "./hooks/useSpecialistAssignExercise";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistExerciseLibraryGrid } from "./sections/SpecialistExerciseLibraryGrid";
import { getInitials } from "./utils/specialistScheduleUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistAssignExercisePage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId") ?? "";
  const { user, isInitializing } = useAuth();
  const { t } = useLocale();
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
    patient,
    isLoadingPatient,
    patientError,
    hasActivePlan,
    exercises,
    visibleExercises,
    categoryFilters,
    isLoadingExercises,
    exercisesError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    emptyMessage,
    reloadExercises,
    selectedExerciseId,
    selectExercise,
    selectedExercise,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    dueDate,
    setDueDate,
    clearDueDate,
    isSubmitting,
    submitError,
    fieldErrors,
    assign,
    handleCancel,
    isBusy,
  } = useSpecialistAssignExercise(patientId, planId, Boolean(specialistUserId));

  const libraryEmptyMessage = useMemo(() => {
    if (exercises.length > 0 && visibleExercises.length === 0) {
      return t("specialist.assignExercise.noMatchSearch");
    }
    return emptyMessage;
  }, [exercises.length, visibleExercises.length, emptyMessage, t]);

  const handleAssign = useCallback(async () => {
    const result = await assign();
    if (result.ok) {
      showToast(t("specialist.assignExercise.success"));
      navigate(buildSpecialistPatientDetailPath(patientId));
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [assign, showToast, navigate, patientId, t]);

  const renderContent = () => {
    if (!hasActivePlan) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{t("specialist.patientDetails.toast.activePlanRequired")}</p>
        </section>
      );
    }

    if (isLoadingPatient) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.assignExercise.loadingPatient")}</p>
        </section>
      );
    }

    if (patientError && !patient) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{patientError}</p>
        </section>
      );
    }

    return (
      <div className="pd-specialist-assign-exercise-layout">
        <section className="pd-card pd-card-pad pd-specialist-assign-exercise-library">
          <h2 className="pd-specialist-assign-exercise-section-title">
            {t("specialist.assignExercise.selectExercise")}
          </h2>
          <SpecialistExerciseLibraryGrid
            exercises={exercises}
            visibleExercises={visibleExercises}
            categoryFilters={categoryFilters}
            isLoading={isLoadingExercises}
            error={exercisesError}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            emptyMessage={libraryEmptyMessage}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onRetry={reloadExercises}
            onExerciseClick={selectExercise}
            selectedExerciseId={selectedExerciseId}
          />
          {fieldErrors.exercise ? (
            <p className="pd-specialist-exercise-error">{fieldErrors.exercise}</p>
          ) : null}
        </section>

        <div className="pd-specialist-assign-exercise-side">
          <SpecialistAssignExerciseSelectedSummary exercise={selectedExercise} />

          <SpecialistAssignExerciseAssignmentForm
            frequency={frequency}
            startDate={startDate}
            dueDate={dueDate}
            fieldErrors={fieldErrors}
            isBusy={isBusy}
            onFrequencyChange={setFrequency}
            onStartDateChange={setStartDate}
            onDueDateChange={setDueDate}
            onClearDueDate={clearDueDate}
          />

          {submitError || fieldErrors.form ? (
            <div className="pd-specialist-exercise-inline-error">
              <p className="pd-inline-error">{submitError || fieldErrors.form}</p>
            </div>
          ) : null}

          <div className="pd-specialist-assign-exercise-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={handleCancel}
              disabled={isBusy}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={handleAssign}
              disabled={isBusy}
            >
              <ClipboardList size={16} aria-hidden="true" />
              {isSubmitting
                ? t("specialist.assignExercise.assigning")
                : t("specialist.assignExercise.assignExercise")}
            </button>
          </div>
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
        <div className="pd-specialist-assign-exercise-page">
          <header className="pd-specialist-exercise-page-header">
            <button type="button" className="pd-specialist-back-btn" onClick={handleCancel} disabled={isBusy}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("specialist.patientDetails.back")}
            </button>
            <div>
              <h1 className="pd-section-title">{t("specialist.assignExercise.title")}</h1>
              <p className="pd-section-sub">{t("specialist.assignExercise.subtitle")}</p>
            </div>
          </header>

          {patient ? (
            <section className="pd-card pd-card-pad pd-specialist-assign-exercise-patient">
              <p className="pd-specialist-assign-exercise-patient-label">
                {t("specialist.assignExercise.patientLabel")}
              </p>
              <div className="pd-specialist-assign-exercise-patient-main">
                <UserProfileAvatar
                  imageUrl={patient.profileImageUrl}
                  initials={getInitials(patient.fullName)}
                  alt=""
                  sizeClassName="pd-specialist-assign-exercise-patient-avatar"
                />
                <div className="pd-specialist-assign-exercise-patient-copy">
                  <h2 className="pd-specialist-assign-exercise-patient-name" dir="auto">
                    {patient.fullName}
                  </h2>
                  {patient.age != null ? (
                    <p className="pd-specialist-assign-exercise-patient-meta">
                      {t("specialist.patientDetails.ageYears", { count: patient.age })}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {renderContent()}
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
