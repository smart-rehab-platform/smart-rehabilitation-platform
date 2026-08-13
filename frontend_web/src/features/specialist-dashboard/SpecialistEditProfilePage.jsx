import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { buildSpecialistProfilePath } from "../../routes/specialistDashboardRoutes";
import { SpecialistProfileForm } from "./components/SpecialistProfileForm";
import { useSpecialistEditProfile } from "./hooks/useSpecialistEditProfile";
import { useSpecialistProfile } from "./hooks/useSpecialistProfile";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistEditProfilePage() {
  const navigate = useNavigate();
  const { user, isInitializing, refreshSession } = useAuth();
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
    profile,
    isLoading,
    error,
    refetch,
    replaceProfile,
  } = useSpecialistProfile(specialistUserId);

  const handleRefreshSession = useCallback(async () => refreshSession(), [refreshSession]);

  const {
    formValues,
    fieldErrors,
    saveError,
    isSaving,
    avatarPreviewUrl,
    avatarError,
    setFieldValue,
    handleAvatarSelect,
    resetForm,
    saveProfile,
  } = useSpecialistEditProfile({
    profile,
    onProfileSaved: replaceProfile,
    onRefreshSession: handleRefreshSession,
  });

  const handleBack = useCallback(() => {
    navigate(buildSpecialistProfilePath());
  }, [navigate]);

  const handleCancel = useCallback(() => {
    resetForm();
    handleBack();
  }, [resetForm, handleBack]);

  const handleSave = useCallback(async () => {
    const result = await saveProfile();
    if (result.ok) {
      showToast("Profile updated successfully");
      handleBack();
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [saveProfile, showToast, handleBack]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading profile...</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            Retry
          </button>
        </section>
      );
    }

    if (!profile) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">Profile unavailable.</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            Retry
          </button>
        </section>
      );
    }

    return (
      <SpecialistProfileForm
        profile={profile}
        formValues={formValues}
        fieldErrors={fieldErrors}
        avatarPreviewUrl={avatarPreviewUrl}
        avatarError={avatarError}
        isSaving={isSaving}
        saveError={saveError}
        onFieldChange={setFieldValue}
        onAvatarSelect={handleAvatarSelect}
        onCancel={handleCancel}
        onSubmit={handleSave}
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
        onNotificationSelect={handleNotificationSelect}
        onViewAllNotifications={handleViewAllNotifications}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onMessages={handleMessages}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        showToast={showToast}
      >
        <div className="pd-specialist-profile-page pd-section-enter">
          <div className="pd-specialist-profile-page-toolbar">
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-back-link"
              onClick={handleBack}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to profile
            </button>
          </div>

          <header className="pd-specialist-profile-page-header">
            <h1 className="pd-task-hub-title">Edit Profile</h1>
            <p className="pd-task-hub-subtitle">
              Update your personal and professional details.
            </p>
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
