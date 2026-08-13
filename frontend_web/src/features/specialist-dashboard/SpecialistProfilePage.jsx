import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { buildSpecialistEditProfilePath } from "../../routes/specialistDashboardRoutes";
import { SpecialistPersonalInfo, SpecialistProfessionalInfo } from "./components/SpecialistProfileInfoCards";
import { SpecialistProfileHeader } from "./components/SpecialistProfileHeader";
import { useSpecialistPresence } from "./hooks/useSpecialistPresence";
import { useSpecialistProfile } from "./hooks/useSpecialistProfile";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistProfilePage() {
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
  } = useSpecialistProfile(specialistUserId);

  const { label: presenceLabel, isOnline } = useSpecialistPresence(specialistUserId);

  const handleEdit = useCallback(() => {
    navigate(buildSpecialistEditProfilePath());
  }, [navigate]);

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
      <div className="pd-specialist-profile-layout pd-section-enter">
        <SpecialistProfileHeader
          bundle={profile}
          presenceLabel={presenceLabel}
          isOnline={isOnline}
          onEdit={handleEdit}
        />
        <div className="pd-specialist-profile-info-grid">
          <SpecialistPersonalInfo bundle={profile} />
          <SpecialistProfessionalInfo bundle={profile} />
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
          <header className="pd-specialist-profile-page-header">
            <h1 className="pd-task-hub-title">Profile</h1>
            <p className="pd-task-hub-subtitle">
              Manage your personal and professional information.
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
