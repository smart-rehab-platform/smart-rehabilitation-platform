import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_WEB_ROUTES,
  buildAdminExerciseDetailsPath,
} from "../../routes/adminDashboardRoutes";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminUpsertExercise } from "./hooks/useAdminUpsertExercise";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminExerciseForm } from "./sections/AdminExerciseForm";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminExercisesSections.css";

const FORM_SUBTITLE = "Add therapy exercises to the shared library for assignment.";

function AdminExerciseFormSkeleton() {
  return (
    <div className="pd-admin-exercise-form-shell pd-admin-exercise-form-skeleton" aria-hidden="true">
      <div className="pd-admin-exercise-form-grid">
        <span className="pd-admin-exercises-skeleton-line is-field" />
        <span className="pd-admin-exercises-skeleton-line is-field" />
      </div>
      <span className="pd-admin-exercises-skeleton-line is-wide" />
      <span className="pd-admin-exercises-skeleton-line is-textarea" />
      <span className="pd-admin-exercises-skeleton-line is-textarea is-tall" />
      <span className="pd-admin-exercises-skeleton-media is-form" />
      <div className="pd-admin-exercise-form-actions">
        <span className="pd-admin-exercises-skeleton-line is-edit" />
        <span className="pd-admin-exercises-skeleton-line is-edit" />
      </div>
    </div>
  );
}

export default function AdminUpsertExercisePage({ mode = "create" }) {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const isEdit = mode === "edit";

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

  const {
    submit,
    refreshExercise,
    refreshCategories,
    setCategoryId,
    setLanguage,
    setTitle,
    setDescription,
    setInstructions,
    handleSelectMediaFile,
    handleRemoveNewMedia,
    handleRemoveExistingMedia,
    ...upsertState
  } = useAdminUpsertExercise({ mode, exerciseId });

  const handleBack = useCallback(() => {
    if (isEdit && exerciseId) {
      navigate(buildAdminExerciseDetailsPath(exerciseId));
      return;
    }

    navigate(ADMIN_WEB_ROUTES.exercises);
  }, [exerciseId, isEdit, navigate]);

  const handleCancel = useCallback(() => {
    handleBack();
  }, [handleBack]);

  const handleSubmit = useCallback(async () => {
    const result = await submit();
    if (!result.ok) {
      return;
    }

    showToast(isEdit ? "Exercise updated successfully." : "Exercise created successfully.");

    if (isEdit && exerciseId) {
      navigate(buildAdminExerciseDetailsPath(exerciseId));
      return;
    }

    navigate(ADMIN_WEB_ROUTES.exercises);
  }, [exerciseId, isEdit, navigate, showToast, submit]);

  const pageTitle = isEdit ? "Edit Exercise" : "Add Exercise";
  const backLabel = isEdit ? "Back to Exercise Details" : "Back to Exercise Library";
  const isNotFound = isEdit
    && !upsertState.isLoadingExercise
    && upsertState.loadError
    && upsertState.loadError.toLowerCase().includes("exercise not found");

  let body;

  if (isEdit && upsertState.isLoadingExercise) {
    body = <AdminExerciseFormSkeleton />;
  } else if (isNotFound) {
    body = (
      <section className="pd-card pd-card-pad pd-admin-exercise-details-empty pd-section-enter">
        <p className="pd-section-sub">Exercise not found.</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={() => navigate(ADMIN_WEB_ROUTES.exercises)}>
          Back to Exercise Library
        </button>
      </section>
    );
  } else if (isEdit && upsertState.loadError) {
    body = (
      <div className="pd-admin-exercises-error pd-section-enter">
        <p className="pd-inline-error">{upsertState.loadError}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={refreshExercise}>
          Retry
        </button>
      </div>
    );
  } else {
    body = (
      <AdminExerciseForm
        isEdit={isEdit}
        categories={upsertState.categories}
        isLoadingCategories={upsertState.isLoadingCategories}
        categoriesError={upsertState.categoriesError}
        onRetryCategories={refreshCategories}
        categoryId={upsertState.categoryId}
        onCategoryChange={setCategoryId}
        language={upsertState.language}
        onLanguageChange={setLanguage}
        title={upsertState.title}
        onTitleChange={setTitle}
        description={upsertState.description}
        onDescriptionChange={setDescription}
        instructions={upsertState.instructions}
        onInstructionsChange={setInstructions}
        fieldErrors={upsertState.fieldErrors}
        formError={upsertState.formError}
        isBusy={upsertState.isBusy}
        canSubmit={upsertState.canSubmit}
        isUploading={upsertState.isUploading}
        isSubmitting={upsertState.isSubmitting}
        showExistingMedia={upsertState.showExistingMedia}
        currentMediaUrl={upsertState.currentMediaUrl}
        newMediaFile={upsertState.newMediaFile}
        newMediaPreviewUrl={upsertState.newMediaPreviewUrl}
        mediaError={upsertState.mediaError}
        onSelectMediaFile={handleSelectMediaFile}
        onRemoveNewMedia={handleRemoveNewMedia}
        onRemoveExistingMedia={handleRemoveExistingMedia}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
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
        <div className="pd-admin-exercise-upsert">
          <button type="button" className="pd-btn pd-btn-soft pd-admin-exercise-details-back" onClick={handleBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            {backLabel}
          </button>

          <header className="pd-admin-exercise-upsert-header pd-section-enter">
            <h1 className="pd-section-title">{pageTitle}</h1>
            <p className="pd-section-sub">{FORM_SUBTITLE}</p>
          </header>

          <div className="pd-admin-exercise-form-shell pd-section-enter">
            {body}
          </div>
        </div>
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
