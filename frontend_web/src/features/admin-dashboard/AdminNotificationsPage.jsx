import { useCallback } from "react";
import { Bell } from "lucide-react";
import { useAdminNotificationsContext } from "./context/adminNotificationsContextValue";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminNotificationsList } from "./sections/AdminNotificationsList";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminNotificationsSections.css";

function AdminNotificationsPageContent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isUpdating,
    updatingNotificationId,
    mutationError,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useAdminNotificationsContext();

  const handleMarkAsRead = useCallback(async (notificationId) => {
    await markAsRead(notificationId);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const showInitialSkeleton = isLoading && notifications.length === 0;
  const showBlockingError = Boolean(error) && !isLoading && notifications.length === 0;
  const showEmpty = !isLoading && !error && notifications.length === 0;
  const showList = showInitialSkeleton || (!error && notifications.length > 0);

  return (
    <>
      <section className="pd-admin-notif-toolbar pd-section-enter" aria-label="Notifications header">
        <div className="pd-admin-notif-heading">
          <h1 className="pd-section-title">Notifications</h1>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={handleMarkAllAsRead}
            disabled={isUpdating}
          >
            Mark all as read
          </button>
        ) : null}
      </section>

      {mutationError ? (
        <div className="pd-admin-notif-mutation-error pd-section-enter" role="alert">
          <p className="pd-inline-error">{mutationError}</p>
        </div>
      ) : null}

      {showBlockingError ? (
        <section className="pd-card pd-card-pad pd-admin-notif-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
            Retry
          </button>
        </section>
      ) : null}

      {showEmpty ? (
        <section className="pd-card pd-card-pad pd-admin-notif-empty pd-section-enter">
          <span className="pd-admin-notif-empty-icon" aria-hidden="true">
            <Bell size={22} strokeWidth={2} />
          </span>
          <p className="pd-admin-notif-empty-copy">No notifications yet.</p>
        </section>
      ) : null}

      {showList ? (
        <AdminNotificationsList
          notifications={notifications}
          isLoading={showInitialSkeleton}
          updatingNotificationId={updatingNotificationId}
          onMarkAsRead={handleMarkAsRead}
        />
      ) : null}
    </>
  );
}

export default function AdminNotificationsPage() {
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
        <AdminNotificationsPageContent />
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
