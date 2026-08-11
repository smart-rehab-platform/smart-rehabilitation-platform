import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { SPECIALIST_WEB_ROUTES } from "../../routes/specialistDashboardRoutes";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistNotificationsList } from "./sections/SpecialistNotificationsList";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistNotificationsPage() {
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
    fullNotifications,
    isLoadingNotifications,
    notificationsError,
    unreadCount,
    isMarkingAllRead,
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
    markAllNotificationsRead,
    refetchNotifications,
  } = useSpecialistShell(specialistUserId);

  const handleBack = useCallback(() => {
    navigate(SPECIALIST_WEB_ROUTES.dashboard);
  }, [navigate]);

  const handleMarkAllAsRead = useCallback(async () => {
    const ok = await markAllNotificationsRead();
    if (!ok) {
      showToast("Unable to mark all notifications as read.");
    }
  }, [markAllNotificationsRead, showToast]);

  const handleSelectNotification = useCallback(async (notification) => {
    const ok = await handleNotificationSelect(notification);
    if (!ok) {
      showToast("Unable to mark notification as read.");
    }
  }, [handleNotificationSelect, showToast]);

  const renderContent = () => {
    if (isLoadingNotifications) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading notifications...</p>
        </section>
      );
    }

    if (notificationsError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{notificationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchNotifications}>
            Retry
          </button>
        </section>
      );
    }

    if (fullNotifications.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-section-sub">No notifications yet.</p>
        </section>
      );
    }

    return (
      <SpecialistNotificationsList
        notifications={fullNotifications}
        onSelect={handleSelectNotification}
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
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-ghost pd-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Dashboard
            </button>
            {unreadCount > 0 ? (
              <div className="pd-specialist-notifications-mark-all">
                <button
                  type="button"
                  className="pd-btn pd-btn-primary pd-btn-sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead || isLoadingNotifications}
                >
                  Mark all as read
                </button>
              </div>
            ) : null}
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">Notifications</h1>
            <p className="pd-task-hub-subtitle">
              Stay updated on your patients and clinical activity
            </p>
          </header>

          <div className="pd-task-hub-panel">{renderContent()}</div>
        </div>

        {toast ? (
          <div className="pd-toast" role="status" aria-live="polite">
            {toast}
          </div>
        ) : null}
      </SpecialistDashboardShell>
    </div>
  );
}
