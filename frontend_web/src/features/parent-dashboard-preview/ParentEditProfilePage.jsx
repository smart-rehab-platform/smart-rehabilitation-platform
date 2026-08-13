import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { buildParentProfilePath } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { ParentProfileErrorState } from "./components/profile/ParentProfileErrorState";
import { ParentProfileForm } from "./components/profile/ParentProfileForm";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { useParentProfile } from "./hooks/useParentProfile";
import { useParentProfileForm } from "./hooks/useParentProfileForm";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import { PROFILE_EMPTY_MESSAGES } from "./utils/parentProfileUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentEditProfilePage() {
  const navigate = useNavigate();
  const { user, isInitializing, refreshSession } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    profile,
    isLoading,
    error,
    refetch,
    replaceProfile,
  } = useParentProfile(parentUserId);

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(parentUserId);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  const handleRefreshSession = useCallback(async () => refreshSession(), [refreshSession]);

  const {
    formValues,
    fieldErrors,
    saveError,
    isSaving,
    isDirty,
    avatarPreviewUrl,
    avatarError,
    setFieldValue,
    handleAvatarSelect,
    resetForm,
    saveProfile,
  } = useParentProfileForm({
    profile,
    onProfileSaved: replaceProfile,
    onRefreshSession: handleRefreshSession,
  });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    document.body.classList.add("pd-preview-drawer-open");
    return () => document.body.classList.remove("pd-preview-drawer-open");
  }, [mobileNavOpen]);

  const badges = useMemo(() => ({
    notifications:
      !notificationsError && !isLoadingNotifications && unreadCount > 0
        ? unreadCount
        : null,
    messages: messageUnreadCount > 0 ? messageUnreadCount : null,
  }), [
    notificationsError,
    isLoadingNotifications,
    unreadCount,
    messageUnreadCount,
  ]);

  const handleBack = useCallback(() => {
    navigate(buildParentProfilePath());
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
        <section className="pd-card pd-card-pad pd-profile-state pd-section-enter">
          <p className="pd-inline-loading">Loading profile...</p>
        </section>
      );
    }

    if (error) {
      return (
        <ParentProfileErrorState
          message={error || PROFILE_EMPTY_MESSAGES.loadError}
          onRetry={refetch}
        />
      );
    }

    if (!profile) {
      return (
        <ParentProfileErrorState
          message="Profile unavailable."
          onRetry={refetch}
        />
      );
    }

    return (
      <ParentProfileForm
        profile={profile}
        formValues={formValues}
        fieldErrors={fieldErrors}
        avatarPreviewUrl={avatarPreviewUrl}
        avatarError={avatarError}
        isSaving={isSaving}
        isDirty={isDirty}
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
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={parentDashboardMock.navItems}
        badges={badges}
        parent={parent}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        onNotificationSelect={navigation.handleNotificationSelect}
        onViewAllNotifications={navigation.handleViewAllNotifications}
        onSignOut={navigation.handleSignOut}
        onViewProfile={navigation.handleViewProfile}
        onMessages={navigation.handleMessages}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={closeMobileNav}
        onNavAction={navigation.handleSidebarNav}
      >
        <div className="pd-profile-page pd-section-enter">
          <div className="pd-profile-page-toolbar">
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-back-link"
              onClick={handleBack}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to profile
            </button>
          </div>

          <header className="pd-profile-page-header">
            <h1 className="pd-task-hub-title">Edit Profile</h1>
            <p className="pd-task-hub-subtitle">
              Update your contact details and parent information.
            </p>
          </header>

          {renderContent()}
        </div>
      </ParentDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
