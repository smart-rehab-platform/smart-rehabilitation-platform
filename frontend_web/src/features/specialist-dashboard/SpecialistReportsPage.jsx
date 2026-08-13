import { ArrowLeft } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistReportDetailsPath,
} from "../../routes/specialistDashboardRoutes";
import { useSpecialistReports } from "./hooks/useSpecialistReports";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistReportsList } from "./sections/SpecialistReportsList";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistReportsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
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
    reports,
    visibleReports,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterId,
    setFilterId,
    isPatientScoped,
    patientName,
    reload,
  } = useSpecialistReports(specialistUserId, patientId);

  const pageSubtitle = useMemo(() => {
    if (isPatientScoped && patientName) {
      return `Reports for ${patientName}`;
    }
    return "View reports across your active patients.";
  }, [isPatientScoped, patientName]);

  const handleBack = useCallback(() => {
    if (isPatientScoped && patientId) {
      navigate(`${SPECIALIST_WEB_ROUTES.patients}/${encodeURIComponent(patientId)}`);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.dashboard);
  }, [navigate, isPatientScoped, patientId]);

  const handleReportClick = useCallback((report) => {
    navigate(buildSpecialistReportDetailsPath(report.id, {
      isAi: report.isAi,
      patientId: isPatientScoped ? patientId : null,
    }));
  }, [navigate, isPatientScoped, patientId]);

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
          {isPatientScoped ? (
            <div className="pd-task-hub-toolbar">
              <button type="button" className="pd-specialist-back-btn" onClick={handleBack}>
                <ArrowLeft size={18} aria-hidden="true" />
                Back to Patient
              </button>
            </div>
          ) : null}
          <div className="pd-task-hub-panel pd-specialist-reports-page">
            <header className="pd-specialist-page-header">
              <h1 className="pd-section-title">
                {isPatientScoped ? "Patient Reports" : "Reports"}
              </h1>
              <p className="pd-section-sub">{pageSubtitle}</p>
            </header>
            <SpecialistReportsList
              reports={reports}
              visibleReports={visibleReports}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterId={filterId}
              onFilterChange={setFilterId}
              isPatientScoped={isPatientScoped}
              onRetry={reload}
              onReportClick={handleReportClick}
            />
          </div>
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
