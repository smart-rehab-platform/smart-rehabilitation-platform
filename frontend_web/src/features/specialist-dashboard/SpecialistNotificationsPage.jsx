import { useCallback, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import { SPECIALIST_WEB_ROUTES } from "../../routes/specialistDashboardRoutes";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistNotificationsList } from "./sections/SpecialistNotificationsList";
import { getSpecialistNotificationsPageLabels } from "./utils/specialistNotificationsLocalization.js";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistNotificationsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistNotificationsPageLabels(t), [t]);
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

  const handleRefresh = useCallback(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    const ok = await markAllNotificationsRead();
    if (!ok) {
      showToast(pageLabels.markAllReadFailed);
    }
  }, [markAllNotificationsRead, showToast, pageLabels.markAllReadFailed]);

  const handleSelectNotification = useCallback(async (notification) => {
    const ok = await handleNotificationSelect(notification);
    if (!ok) {
      showToast(pageLabels.markReadFailed);
    }
  }, [handleNotificationSelect, showToast, pageLabels.markReadFailed]);

  const renderContent = () => {
    if (isLoadingNotifications) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{pageLabels.loading}</p>
        </section>
      );
    }

    if (notificationsError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{notificationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchNotifications}>
            {pageLabels.retry}
          </button>
        </section>
      );
    }

    if (fullNotifications.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-section-sub">{pageLabels.empty}</p>
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
          <div className="pd-task-hub-toolbar pd-notifications-page-toolbar">
            <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              {pageLabels.backToDashboard}
            </button>
            <div className="pd-notification-hub-toolbar-actions">
              <button
                type="button"
                className="pd-btn pd-btn-soft pd-btn-sm"
                onClick={handleRefresh}
                disabled={isLoadingNotifications}
              >
                {pageLabels.refresh}
              </button>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="pd-btn pd-btn-primary pd-btn-sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead || isLoadingNotifications}
                >
                  {pageLabels.markAllRead}
                </button>
              ) : null}
            </div>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{pageLabels.title}</h1>
            <p className="pd-task-hub-subtitle">
              {pageLabels.subtitle}
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
