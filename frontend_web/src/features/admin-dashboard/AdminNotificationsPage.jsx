import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  buildAdminComplaintDetailsPath,
  buildAdminSupportRequestDetailsPath,
} from "../../routes/adminDashboardRoutes";
import { useAdminNotificationsContext } from "./context/adminNotificationsContextValue";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminNotificationsList } from "./sections/AdminNotificationsList";
import { resolveAdminNotificationRoute } from "./utils/adminNotificationsMappers";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminNotificationsSections.css";

function AdminNotificationsPageContent() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    labels,
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
    const notification = notifications.find((entry) => entry.id === notificationId);
    await markAsRead(notificationId);

    const route = resolveAdminNotificationRoute(notification, {
      buildSupportRequestDetailPath: buildAdminSupportRequestDetailsPath,
      buildComplaintDetailPath: buildAdminComplaintDetailsPath,
    });

    if (route) {
      navigate(route);
    }
  }, [markAsRead, navigate, notifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const showInitialLoading = isLoading && notifications.length === 0;
  const showBlockingError = Boolean(error) && !isLoading && notifications.length === 0;
  const showEmpty = !isLoading && !error && notifications.length === 0;

  const renderContent = () => {
    if (showInitialLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{labels.loading}</p>
        </section>
      );
    }

    if (showBlockingError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
            {labels.retry}
          </button>
        </section>
      );
    }

    if (showEmpty) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-empty pd-section-enter">
          <p className="pd-task-hub-empty-message">{labels.empty}</p>
        </section>
      );
    }

    return (
      <AdminNotificationsList
        notifications={notifications}
        labels={labels}
        updatingNotificationId={updatingNotificationId}
        onMarkAsRead={handleMarkAsRead}
      />
    );
  };

  return (
    <div className="pd-task-hub-page">
      <div className="pd-task-hub-toolbar pd-notifications-page-toolbar">
        <div className="pd-notification-hub-toolbar-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft pd-btn-sm"
            onClick={refresh}
            disabled={isLoading}
          >
            {labels.refresh}
          </button>

          {unreadCount > 0 ? (
            <button
              type="button"
              className="pd-btn pd-btn-primary pd-btn-sm"
              onClick={handleMarkAllAsRead}
              disabled={isUpdating || isLoading}
            >
              {labels.markAllRead}
            </button>
          ) : null}
        </div>
      </div>

      <header className="pd-task-hub-header" aria-label={labels.toolbarAriaLabel}>
        <h1 className="pd-task-hub-title">{labels.title}</h1>
        <p className="pd-task-hub-subtitle">{labels.subtitle}</p>
      </header>

      {mutationError ? (
        <div className="pd-admin-notif-mutation-error pd-section-enter" role="alert">
          <p className="pd-inline-error">{mutationError}</p>
        </div>
      ) : null}

      <div className="pd-task-hub-panel">{renderContent()}</div>
    </div>
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
