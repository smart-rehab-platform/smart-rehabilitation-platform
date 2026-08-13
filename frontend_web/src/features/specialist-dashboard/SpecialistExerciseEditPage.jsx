import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { buildSpecialistExerciseDetailPath } from "../../routes/specialistDashboardRoutes";
import { SpecialistExerciseEditForm } from "./components/SpecialistExerciseEditForm";
import { useSpecialistExerciseEdit } from "./hooks/useSpecialistExerciseEdit";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { canEditExercise } from "./utils/specialistExerciseMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistExerciseEditPage() {
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
    showToast,
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
  } = useSpecialistShell(specialistUserId);

  const {
    exercise,
    categories,
    isLoading,
    isUploading,
    isBusy,
    uploadProgress,
    error,
    mediaError,
    notFound,
    forbidden,
    fieldErrors,
    categoryId,
    title,
    description,
    instructions,
    language,
    instructionMediaUrl,
    pendingMediaFile,
    clearInstructionMedia,
    setCategoryId,
    setTitle,
    setDescription,
    setInstructions,
    setLanguage,
    selectMediaFile,
    removeMedia,
    undoMediaRemoval,
    reload,
    save,
  } = useSpecialistExerciseEdit(exerciseId, Boolean(specialistUserId));

  const handleBack = useCallback(() => {
    if (exerciseId) {
      navigate(buildSpecialistExerciseDetailPath(exerciseId));
      return;
    }
    navigate(-1);
  }, [navigate, exerciseId]);

  const handleSave = useCallback(async () => {
    const result = await save();
    if (result.ok) {
      showToast("Exercise updated successfully");
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

    if (forbidden || (exercise && !canEditExercise(exercise, { userId: user?.id, role: user?.role }))) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">You do not have permission to edit this exercise.</p>
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

    return (
      <SpecialistExerciseEditForm
        mode="edit"
        title={title}
        categoryId={categoryId}
        language={language}
        description={description}
        instructions={instructions}
        categories={categories}
        fieldErrors={fieldErrors}
        isBusy={isBusy}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        instructionMediaUrl={instructionMediaUrl}
        pendingMediaFile={pendingMediaFile}
        clearInstructionMedia={clearInstructionMedia}
        mediaError={mediaError}
        onTitleChange={setTitle}
        onCategoryChange={setCategoryId}
        onLanguageChange={setLanguage}
        onDescriptionChange={setDescription}
        onInstructionsChange={setInstructions}
        onSelectMediaFile={selectMediaFile}
        onRemoveMedia={removeMedia}
        onUndoMediaRemoval={undoMediaRemoval}
        onCancel={handleBack}
        onSave={handleSave}
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
        <div className="pd-specialist-exercise-edit-page">
          <header className="pd-specialist-exercise-page-header">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>
            <h1 className="pd-section-title">Edit Exercise</h1>
          </header>

          {error && exercise ? (
            <div className="pd-specialist-exercise-inline-error">
              <p className="pd-inline-error">{error}</p>
            </div>
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
