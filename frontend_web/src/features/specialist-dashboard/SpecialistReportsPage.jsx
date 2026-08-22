import { ArrowLeft } from "lucide-react";
import neurologyIcon from "../../assets/icons/neurology.svg";
import descriptionIcon from "../../assets/icons/description.svg";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistReportDetailsPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistCreateReportDialog } from "./components/SpecialistCreateReportDialog";
import { SpecialistGenerateAiReportDialog } from "./components/SpecialistGenerateAiReportDialog";
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
  const { t } = useLocale();
  const specialistUserId = isInitializing ? null : user?.id ?? null;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

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
    isGeneratingAiReport,
    generationError,
    clearGenerationError,
    generateAiReport,
    isCreatingRegularReport,
    regularCreationError,
    clearRegularCreationError,
    createRegularReport,
  } = useSpecialistReports(specialistUserId, patientId);

  const pageSubtitle = useMemo(() => {
    if (isPatientScoped && patientName) {
      return t("specialist.reports.subtitleForPatient", { name: patientName });
    }
    return t("specialist.reports.subtitle");
  }, [isPatientScoped, patientName, t]);

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

  const handleOpenCreateDialog = useCallback(() => {
    clearRegularCreationError();
    setCreateDialogOpen(true);
  }, [clearRegularCreationError]);

  const handleOpenGenerateDialog = useCallback(() => {
    clearGenerationError();
    setGenerateDialogOpen(true);
  }, [clearGenerationError]);

  const handleCreateRegularReport = useCallback(async (payload) => {
    const result = await createRegularReport(payload);
    if (result?.ok) {
      showToast(t("specialist.reports.create.success"));
    }
    return result;
  }, [createRegularReport, showToast, t]);

  const handleGenerateAiReport = useCallback(async (payload) => {
    const result = await generateAiReport(payload);
    if (result?.ok) {
      showToast(t("specialist.reports.generate.successReview"));
      const createdId = result.report?.id;
      if (createdId) {
        navigate(buildSpecialistReportDetailsPath(createdId, {
          isAi: true,
          patientId: payload.patientId || patientId || null,
        }));
      }
    }
    return result;
  }, [generateAiReport, navigate, patientId, showToast, t]);

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
                {t("specialist.reports.backToPatient")}
              </button>
            </div>
          ) : null}
          <div className="pd-task-hub-panel pd-specialist-reports-page">
            <header className="pd-specialist-page-header pd-specialist-reports-page-header">
              <div className="pd-specialist-reports-page-header-row">
                <div className="pd-specialist-reports-page-heading">
                  <h1 className="pd-section-title">
                    {isPatientScoped ? t("specialist.reports.patientTitle") : t("specialist.reports.title")}
                  </h1>
                  <p className="pd-section-sub">{pageSubtitle}</p>
                </div>
                <div className="pd-specialist-reports-page-actions">
                  <button
                    type="button"
                    className="pd-btn pd-btn-soft pd-specialist-reports-create-btn"
                    onClick={handleOpenCreateDialog}
                    aria-label={t("specialist.reports.create.action")}
                  >
                    <img
                      src={descriptionIcon}
                      alt=""
                      aria-hidden="true"
                      className="pd-platform-icon"
                      width={18}
                      height={18}
                    />
                    {t("specialist.reports.create.action")}
                  </button>
                  <button
                    type="button"
                    className="pd-btn pd-btn-primary pd-specialist-reports-generate-btn"
                    onClick={handleOpenGenerateDialog}
                    aria-label={t("specialist.reports.generate.action")}
                  >
                    <img
                      src={neurologyIcon}
                      alt=""
                      aria-hidden="true"
                      className="pd-platform-icon"
                      width={18}
                      height={18}
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                    {t("specialist.reports.generate.action")}
                  </button>
                </div>
              </div>
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

      <SpecialistCreateReportDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        specialistUserId={specialistUserId}
        initialPatientId={patientId}
        isCreating={isCreatingRegularReport}
        creationError={regularCreationError}
        onClearCreationError={clearRegularCreationError}
        onCreate={handleCreateRegularReport}
      />

      <SpecialistGenerateAiReportDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        specialistUserId={specialistUserId}
        initialPatientId={patientId}
        isGenerating={isGeneratingAiReport}
        generationError={generationError}
        onClearGenerationError={clearGenerationError}
        onGenerate={handleGenerateAiReport}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
