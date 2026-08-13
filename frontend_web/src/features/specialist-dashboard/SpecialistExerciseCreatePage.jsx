import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistExerciseDetailPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistExerciseEditForm } from "./components/SpecialistExerciseEditForm";
import { useSpecialistExerciseCreate } from "./hooks/useSpecialistExerciseCreate";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistExerciseCreatePage() {
  const navigate = useNavigate();
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
    categories,
    isLoading,
    isUploading,
    isBusy,
    uploadProgress,
    error,
    mediaError,
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
  } = useSpecialistExerciseCreate(Boolean(specialistUserId));

  const handleBack = useCallback(() => {
    navigate(SPECIALIST_WEB_ROUTES.exercises);
  }, [navigate]);

  const handleSave = useCallback(async () => {
    const result = await save();
    if (result.ok && result.exercise?.id) {
      showToast("Exercise created successfully");
      navigate(buildSpecialistExerciseDetailPath(result.exercise.id));
      return;
    }
    if (result.ok) {
      showToast("Exercise created successfully");
      navigate(SPECIALIST_WEB_ROUTES.exercises);
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [save, showToast, navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading categories...</p>
        </section>
      );
    }

    if (error && categories.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            Retry
          </button>
        </section>
      );
    }

    if (categories.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">No exercise categories available yet.</p>
        </section>
      );
    }

    return (
      <SpecialistExerciseEditForm
        mode="create"
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
        <div className="pd-specialist-exercise-create-page">
          <header className="pd-specialist-exercise-page-header">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>
            <h1 className="pd-section-title">Add Exercise</h1>
            <p className="pd-section-sub">
              Add therapy exercises to the shared library for assignment.
            </p>
          </header>

          {error && categories.length > 0 ? (
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
