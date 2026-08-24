import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTranslatedExerciseContent } from "../../hooks/useTranslatedExerciseContent";
import { deleteAdminExercise } from "../../services/adminExercisesService";
import {
  ADMIN_WEB_ROUTES,
  buildAdminExerciseEditPath,
} from "../../routes/adminDashboardRoutes";
import { AdminExerciseDeleteDialog } from "./components/AdminExerciseDeleteDialog";
import { canEditExercise } from "./utils/adminExercisesMappers";
import { useAdminExerciseDetails } from "./hooks/useAdminExerciseDetails";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminExerciseDescription } from "./sections/AdminExerciseDescription";
import { AdminExerciseDetailsHero } from "./sections/AdminExerciseDetailsHero";
import { AdminExerciseInstructionMedia } from "./sections/AdminExerciseInstructionMedia";
import { AdminExerciseInstructions } from "./sections/AdminExerciseInstructions";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminExercisesSections.css";

function AdminExerciseDetailsSkeleton() {
  return (
    <div className="pd-admin-exercise-details">
      <span className="pd-admin-exercises-skeleton-line is-button" aria-hidden="true" />

      <section className="pd-card pd-card-pad pd-admin-exercise-details-hero pd-admin-exercise-details-skeleton" aria-hidden="true">
        <div className="pd-admin-exercise-details-hero-main">
          <div className="pd-admin-exercise-details-hero-left">
            <span className="pd-admin-exercises-skeleton-icon is-hero" />
            <div className="pd-admin-exercises-skeleton-lines">
              <span className="pd-admin-exercises-skeleton-line is-wide" />
              <span className="pd-admin-exercises-skeleton-line is-medium" />
              <span className="pd-admin-exercises-skeleton-line" />
            </div>
          </div>
          <span className="pd-admin-exercises-skeleton-line is-edit" />
        </div>
      </section>

      <div className="pd-admin-exercise-details-content">
        <div className="pd-admin-exercise-details-primary">
          <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-admin-exercise-details-skeleton" aria-hidden="true">
            <span className="pd-admin-exercises-skeleton-line is-section-title" />
            <span className="pd-admin-exercises-skeleton-line is-wide" />
            <span className="pd-admin-exercises-skeleton-line is-wide" />
            <span className="pd-admin-exercises-skeleton-line" />
          </section>

          <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-admin-exercise-details-skeleton" aria-hidden="true">
            <span className="pd-admin-exercises-skeleton-line is-section-title" />
            <span className="pd-admin-exercises-skeleton-line is-wide" />
            <span className="pd-admin-exercises-skeleton-line is-wide" />
            <span className="pd-admin-exercises-skeleton-line is-medium" />
          </section>
        </div>

        <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-admin-exercise-details-skeleton" aria-hidden="true">
          <span className="pd-admin-exercises-skeleton-line is-section-title" />
          <span className="pd-admin-exercises-skeleton-media" />
        </section>
      </div>
    </div>
  );
}

export default function AdminExerciseDetailsPage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const { user } = useAuth();

  const {
    adminUser,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    handleSignOut,
    handleViewProfile,
    handleViewAllNotifications,
    handleSidebarNav,
  } = useAdminShell();

  const { exercise, isLoading, error, refresh, labels } = useAdminExerciseDetails(exerciseId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const deleteLockRef = useRef(false);
  const editActor = useMemo(() => ({
    userId: user?.id ?? null,
    role: user?.role ?? adminUser?.role ?? null,
  }), [adminUser?.role, user?.id, user?.role]);

  const canEdit = exercise ? canEditExercise(exercise, editActor) : false;
  const isNotFound = !isLoading
    && !exercise
    && error === labels.notFound;

  const translated = useTranslatedExerciseContent({
    title: exercise?.title || "",
    description: exercise?.description || "",
    instructions: exercise?.instructions || "",
  });

  const displayExercise = useMemo(() => {
    if (!exercise) {
      return null;
    }
    return {
      ...exercise,
      title: translated.title || exercise.title,
      description: translated.description || exercise.description,
      instructions: translated.instructions || exercise.instructions,
    };
  }, [exercise, translated]);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.exercises);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    if (!exerciseId) {
      return;
    }
    navigate(buildAdminExerciseEditPath(exerciseId));
  }, [exerciseId, navigate]);

  const handleOpenDelete = useCallback(() => {
    setDeleteError(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setDeleteDialogOpen(false);
    setDeleteError(null);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!exerciseId || deleteLockRef.current || isDeleting) {
      return;
    }

    deleteLockRef.current = true;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAdminExercise(exerciseId);
      setDeleteDialogOpen(false);
      showToast(labels.toast.deleteSuccess);
      navigate(ADMIN_WEB_ROUTES.exercises);
    } catch (deleteErr) {
      const message = deleteErr instanceof Error
        ? deleteErr.message
        : labels.toast.deleteFailed;
      setDeleteError(message);
    } finally {
      deleteLockRef.current = false;
      setIsDeleting(false);
    }
  }, [exerciseId, isDeleting, labels.toast.deleteFailed, labels.toast.deleteSuccess, navigate, showToast]);
  let body;

  if (isLoading) {
    body = <AdminExerciseDetailsSkeleton />;
  } else if (isNotFound) {
    body = (
      <div className="pd-admin-exercise-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-exercise-details-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {labels.back}
        </button>

        <section className="pd-card pd-card-pad pd-admin-exercise-details-empty pd-section-enter">
          <p className="pd-section-sub">{labels.notFound}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {labels.back}
          </button>
        </section>
      </div>
    );
  } else if (error || !exercise) {
    body = (
      <div className="pd-admin-exercise-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-exercise-details-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {labels.back}
        </button>

        <div className="pd-admin-exercises-error pd-section-enter">
          <p className="pd-inline-error">{error || labels.loadDetailsFailed}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
            {labels.retry}
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-exercise-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-exercise-details-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {labels.back}
        </button>

        <AdminExerciseDetailsHero
          labels={labels}
          exercise={displayExercise}
          canEdit={canEdit}
          onEdit={handleEdit}
          onDelete={handleOpenDelete}
        />
        <div className={`pd-admin-exercise-details-content${exercise.hasMedia ? "" : " is-single-column"}`}>
          <div className="pd-admin-exercise-details-primary">
            <AdminExerciseDescription labels={labels} description={displayExercise.description} />
            <AdminExerciseInstructions labels={labels} instructions={displayExercise.instructions} />
          </div>

          {exercise.hasMedia ? (
            <AdminExerciseInstructionMedia instructionMediaUrl={exercise.instructionMediaUrl} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="pd-preview">
      <AdminDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={adminUser}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onViewAllNotifications={handleViewAllNotifications}
        showToast={showToast}
      >
        {body}
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}

      <AdminExerciseDeleteDialog
        open={deleteDialogOpen}
        exerciseTitle={exercise?.title}
        isSubmitting={isDeleting}
        error={deleteError}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
