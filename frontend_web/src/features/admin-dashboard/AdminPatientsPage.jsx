import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildAdminPatientDetailsPath } from "../../routes/adminDashboardRoutes";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminPatients } from "./hooks/useAdminPatients";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminPatientsTable } from "./sections/AdminPatientsTable";
import { AdminPatientsToolbar } from "./sections/AdminPatientsToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminPatientsSections.css";

export default function AdminPatientsPage() {
  const navigate = useNavigate();
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

  const {
    patients,
    filteredPatients,
    conditionOptions,
    isLoading,
    error,
    searchQuery,
    conditionFilter,
    setSearchQuery,
    setConditionFilter,
    reload,
  } = useAdminPatients();

  const emptyKind = useMemo(() => {
    if (isLoading || error) {
      return null;
    }

    if (patients.length === 0) {
      return "no-patients";
    }

    if (filteredPatients.length === 0) {
      return "no-matches";
    }

    return null;
  }, [isLoading, error, patients.length, filteredPatients.length]);

  const handleViewPatient = useCallback((patientId) => {
    navigate(buildAdminPatientDetailsPath(patientId));
  }, [navigate]);

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
        <AdminPatientsToolbar
          searchQuery={searchQuery}
          conditionFilter={conditionFilter}
          conditionOptions={conditionOptions}
          onSearchChange={setSearchQuery}
          onConditionFilterChange={setConditionFilter}
        />

        {error ? (
          <div className="pd-admin-patients-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
              Retry
            </button>
          </div>
        ) : (
          <AdminPatientsTable
            patients={filteredPatients}
            isLoading={isLoading}
            emptyKind={emptyKind}
            onViewPatient={handleViewPatient}
          />
        )}
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
