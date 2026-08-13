import { ArrowLeft, Pencil } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SpecialistExerciseInstructionMedia } from "./components/SpecialistExerciseMediaSection";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistExerciseEditPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistExerciseCategoryBadge } from "./components/SpecialistExerciseCategoryBadge";
import { SpecialistExerciseCategoryIcon } from "./components/SpecialistExerciseCategoryIcon";
import { useSpecialistExerciseDetail } from "./hooks/useSpecialistExerciseDetail";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { canEditExercise } from "./utils/specialistExerciseMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistExerciseDetailsPage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
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
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
    showToast,
  } = useSpecialistShell(specialistUserId);

  const {
    exercise,
    isLoading,
    error,
    notFound,
    reload,
  } = useSpecialistExerciseDetail(exerciseId, Boolean(specialistUserId));

  const handleBack = useCallback(() => {
    navigate(SPECIALIST_WEB_ROUTES.exercises);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    if (!exerciseId) {
      return;
    }
    navigate(buildSpecialistExerciseEditPath(exerciseId));
  }, [navigate, exerciseId]);

  const canEdit = exercise
    ? canEditExercise(exercise, { userId: user?.id, role: user?.role })
    : false;

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading exercise...</p>
        </section>
      );
    }

    if (notFound) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">Exercise not found.</p>
        </section>
      );
    }

    if (error && !exercise) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            Retry
          </button>
        </section>
      );
    }

    if (!exercise) {
      return null;
    }

    const description = exercise.description?.trim();
    const instructions = exercise.instructions?.trim();

    return (
      <div className="pd-specialist-exercise-details">
        <section className="pd-card pd-card-pad pd-specialist-exercise-details-hero">
          <div className="pd-specialist-exercise-details-head">
            <SpecialistExerciseCategoryIcon category={exercise.category} size={24} />
            <div className="pd-specialist-exercise-details-copy">
              <h2 className="pd-specialist-exercise-details-title">{exercise.title}</h2>
              {exercise.category ? (
                <SpecialistExerciseCategoryBadge label={exercise.category} />
              ) : null}
              <p className="pd-specialist-exercise-details-meta">
                Language: {exercise.languageLabel}
              </p>
              {exercise.createdByName ? (
                <p className="pd-specialist-exercise-details-meta">
                  Created by {exercise.createdByName}
                </p>
              ) : null}
            </div>
            {canEdit ? (
              <button
                type="button"
                className="pd-btn pd-btn-outline pd-specialist-exercise-edit-btn"
                onClick={handleEdit}
              >
                <Pencil size={16} aria-hidden="true" />
                Edit Exercise
              </button>
            ) : null}
          </div>
        </section>

        <div className="pd-specialist-exercise-details-grid">
          <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
            <h3 className="pd-specialist-exercise-details-section-title">Description</h3>
            <p className="pd-specialist-exercise-details-body">
              {description || "No description available."}
            </p>
          </section>

          <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
            <h3 className="pd-specialist-exercise-details-section-title">Instructions</h3>
            <p className="pd-specialist-exercise-details-body">
              {instructions || "No instructions available."}
            </p>
          </section>
        </div>

        {exercise.instructionMediaUrl ? (
          <SpecialistExerciseInstructionMedia mediaUrl={exercise.instructionMediaUrl} />
        ) : null}
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
              Back to Exercises
            </button>
            <h1 className="pd-section-title">Exercise Details</h1>
          </header>

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
