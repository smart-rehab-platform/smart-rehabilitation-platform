import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PARENT_WEB_ROUTES, buildParentEditProfilePath } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { ParentProfileErrorState } from "./components/profile/ParentProfileErrorState";
import { ParentProfileHeader } from "./components/profile/ParentProfileHeader";
import { ParentParentInfo, ParentPersonalInfo } from "./components/profile/ParentProfileInfoCards";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { useParentProfile } from "./hooks/useParentProfile";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import { PROFILE_EMPTY_MESSAGES } from "./utils/parentProfileUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentProfilePage() {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();
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
    navigate(PARENT_WEB_ROUTES.dashboard);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(buildParentEditProfilePath());
  }, [navigate]);

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
      <div className="pd-profile-layout pd-section-enter">
        <ParentProfileHeader profile={profile} onEdit={handleEdit} />
        <div className="pd-profile-info-grid">
          <ParentPersonalInfo profile={profile} />
          <ParentParentInfo profile={profile} />
        </div>
      </div>
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
              Back to dashboard
            </button>
          </div>

          <header className="pd-profile-page-header">
            <h1 className="pd-task-hub-title">Profile</h1>
            <p className="pd-task-hub-subtitle">
              Manage your personal and account information.
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
