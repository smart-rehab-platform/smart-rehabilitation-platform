import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { getRoleLabel } from "../../routes/roleRouting";
import { uploadAdminProfileImage } from "../../services/adminProfileService";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminProfileAccountSection } from "./sections/AdminProfileAccountSection";
import { AdminProfileCard } from "./sections/AdminProfileCard";
import { mapAdminFromAuth } from "./utils/adminDashboardUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminProfileSections.css";

function readTrimmed(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function AdminProfileSkeleton() {
  return (
    <section
      className="pd-card pd-card-pad pd-admin-profile-skeleton pd-section-enter"
      aria-busy="true"
      aria-label="Profile loading"
    >
      <div className="pd-admin-profile-skeleton-grid">
        <span className="pd-admin-profile-skeleton-avatar" />
        <div className="pd-admin-profile-skeleton-copy">
          <span className="pd-admin-profile-skeleton-line is-label" />
          <span className="pd-admin-profile-skeleton-line is-value" />
          <span className="pd-admin-profile-skeleton-line is-label" />
          <span className="pd-admin-profile-skeleton-line is-value" />
          <span className="pd-admin-profile-skeleton-line is-label" />
          <span className="pd-admin-profile-skeleton-line is-value" />
        </div>
      </div>
    </section>
  );
}

export default function AdminProfilePage() {
  const { user, isInitializing, refreshSession } = useAuth();
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

  const [isUploading, setIsUploading] = useState(false);

  const profile = useMemo(() => {
    if (!user) {
      return null;
    }

    const mapped = mapAdminFromAuth(user);
    const fullName = readTrimmed(user.full_name) || readTrimmed(user.fullName) || "—";
    const email = readTrimmed(user.email) || "—";
    const role = getRoleLabel(user.role) || mapped.role || "Admin";

    return {
      fullName,
      email,
      role,
      initials: mapped.initials || "AD",
      profileImageUrl: mapped.profileImageUrl || null,
    };
  }, [user]);

  const handleSelectFile = useCallback(async (file) => {
    if (!file || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      await uploadAdminProfileImage(file);
      const refreshed = await refreshSession();
      if (!refreshed) {
        throw new Error("Photo uploaded but profile could not be refreshed.");
      }
      showToast("Profile photo updated successfully.");
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "Failed to upload profile image.";
      showToast(message);
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, refreshSession, showToast]);

  const showLoading = isInitializing;
  const showUnavailable = !isInitializing && !profile;

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
        <section className="pd-admin-profile-toolbar pd-section-enter" aria-label="Profile header">
          <div className="pd-admin-profile-heading">
            <h1 className="pd-section-title">Profile</h1>
            <p className="pd-section-sub">Manage your account information.</p>
          </div>
        </section>

        <div className="pd-admin-profile-layout">
          {showLoading ? <AdminProfileSkeleton /> : null}

          {showUnavailable ? (
            <section className="pd-card pd-card-pad pd-admin-profile-state pd-section-enter">
              <p className="pd-inline-error">Unable to load your profile. Please sign in again.</p>
              <button type="button" className="pd-btn pd-btn-soft" onClick={handleSignOut}>
                Logout
              </button>
            </section>
          ) : null}

          {!showLoading && profile ? (
            <>
              <AdminProfileCard
                fullName={profile.fullName}
                email={profile.email}
                role={profile.role}
                initials={profile.initials}
                imageUrl={profile.profileImageUrl}
                isUploading={isUploading}
                onSelectFile={handleSelectFile}
              />

              <AdminProfileAccountSection onLogout={handleSignOut} />
            </>
          ) : null}
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
