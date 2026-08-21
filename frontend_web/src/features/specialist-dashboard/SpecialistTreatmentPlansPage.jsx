import { ArrowLeft, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistCreateTreatmentPlanPath,
  buildSpecialistEditTreatmentPlanPath,
} from "../../routes/specialistDashboardRoutes";
import { loadSpecialistAssignedPatients } from "../../services/specialistTreatmentPlanService";
import { SpecialistTreatmentPlanPatientPicker } from "./components/SpecialistTreatmentPlanPatientPicker";
import { useSpecialistTreatmentPlans } from "./hooks/useSpecialistTreatmentPlans";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistTreatmentPlansList } from "./sections/SpecialistTreatmentPlansList";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistTreatmentPlansPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPatients, setPickerPatients] = useState([]);

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
    plans,
    visiblePlans,
    activePatientIds,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterId,
    setFilterId,
    reload,
  } = useSpecialistTreatmentPlans(specialistUserId);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.dashboard);
  }, [navigate]);

  const handlePlanClick = useCallback((plan) => {
    if (!plan?.id) {
      return;
    }
    navigate(buildSpecialistEditTreatmentPlanPath(plan.id));
  }, [navigate]);

  const handleOpenPatientPicker = useCallback(async () => {
    if (!specialistUserId) {
      return;
    }
    try {
      const patients = await loadSpecialistAssignedPatients(specialistUserId);
      if (patients.length === 0) {
        showToast(t("specialist.treatmentPlans.toast.noPatients"));
        return;
      }
      setPickerPatients(patients);
      setPickerOpen(true);
    } catch (pickerError) {
      showToast(pickerError instanceof Error ? pickerError.message : t("specialist.treatmentPlans.errors.loadPatientsFailed"));
    }
  }, [specialistUserId, showToast, t]);

  const handlePatientSelect = useCallback((patient) => {
    setPickerOpen(false);
    if (!patient?.id) {
      return;
    }
    navigate(buildSpecialistCreateTreatmentPlanPath(patient.id, patient.name));
  }, [navigate]);

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
        <div className="pd-task-hub-page pd-specialist-treatment-plan-edit-shell">
          <div className="pd-task-hub-panel pd-specialist-treatment-plans-page pd-specialist-treatment-plan-edit-page">
            <header className="pd-specialist-treatment-plan-page-header">
              <button
                type="button"
                className="pd-specialist-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                {t("specialist.treatmentPlans.back")}
              </button>
              <div className="pd-specialist-treatment-plan-page-header-row">
                <div className="pd-specialist-treatment-plan-page-heading">
                  <h1 className="pd-section-title">{t("specialist.treatmentPlans.title")}</h1>
                  <p className="pd-section-sub">{t("specialist.treatmentPlans.subtitle")}</p>
                </div>
                <button
                  type="button"
                  className="pd-btn pd-btn-primary pd-specialist-treatment-plan-toolbar-add"
                  onClick={handleOpenPatientPicker}
                  aria-label={t("specialist.treatmentPlans.addPlanAriaLabel")}
                >
                  <Plus size={18} aria-hidden="true" />
                  {t("specialist.treatmentPlans.addPlan")}
                </button>
              </div>
            </header>
            <SpecialistTreatmentPlansList
              plans={plans}
              visiblePlans={visiblePlans}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterId={filterId}
              onFilterChange={setFilterId}
              onRetry={reload}
              onPlanClick={handlePlanClick}
              onAddPlan={handleOpenPatientPicker}
            />
          </div>
        </div>
      </SpecialistDashboardShell>

      <SpecialistTreatmentPlanPatientPicker
        open={pickerOpen}
        patients={pickerPatients}
        activePatientIds={activePatientIds}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePatientSelect}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
