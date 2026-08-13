import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildAdminReportDetailsPath } from "../../routes/adminDashboardRoutes";
import { useAdminReports } from "./hooks/useAdminReports";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminReportsGrid } from "./sections/AdminReportsGrid";
import { AdminReportsToolbar } from "./sections/AdminReportsToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminReportsSections.css";

export default function AdminReportsPage() {
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
    reports,
    filteredReports,
    query,
    setQuery,
    selectedFilter,
    setSelectedFilter,
    filterOptions,
    isLoading,
    error,
    aiError,
    refresh,
  } = useAdminReports();

  const hasActiveFilters = Boolean(query.trim() || (selectedFilter && selectedFilter !== "all"));

  const emptyKind = useMemo(() => {
    if (isLoading || error) {
      return null;
    }

    if (reports.length === 0) {
      return "no-reports";
    }

    if (filteredReports.length === 0 && hasActiveFilters) {
      return "no-matches";
    }

    return null;
  }, [error, filteredReports.length, hasActiveFilters, isLoading, reports.length]);

  const handleClearFilters = useCallback(() => {
    setQuery("");
    setSelectedFilter("all");
  }, [setQuery, setSelectedFilter]);

  const handleOpenReport = useCallback((report) => {
    if (!report?.id) {
      return;
    }

    navigate(buildAdminReportDetailsPath(report.id, Boolean(report.isAiReport)));
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
        <AdminReportsToolbar
          query={query}
          selectedFilter={selectedFilter}
          filterOptions={filterOptions}
          onQueryChange={setQuery}
          onFilterChange={setSelectedFilter}
        />

        {error ? (
          <section className="pd-card pd-card-pad pd-admin-reports-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              Retry
            </button>
          </section>
        ) : (
          <>
            {aiError ? (
              <div className="pd-admin-reports-ai-warning pd-section-enter" role="status">
                <p>Some AI reports could not be loaded.</p>
                <button type="button" className="pd-btn pd-btn-soft pd-btn-compact" onClick={refresh}>
                  Retry
                </button>
              </div>
            ) : null}

            {emptyKind === "no-reports" ? (
              <section className="pd-card pd-card-pad pd-admin-reports-empty pd-section-enter">
                <p className="pd-admin-reports-empty-copy">No reports available yet.</p>
              </section>
            ) : null}

            {emptyKind === "no-matches" ? (
              <section className="pd-card pd-card-pad pd-admin-reports-empty pd-section-enter">
                <p className="pd-admin-reports-empty-copy">No reports match your search or filter.</p>
                <button type="button" className="pd-btn pd-btn-soft" onClick={handleClearFilters}>
                  Clear filters
                </button>
              </section>
            ) : null}

            {emptyKind == null ? (
              <AdminReportsGrid
                reports={filteredReports}
                isLoading={isLoading}
                onOpenReport={handleOpenReport}
              />
            ) : null}
          </>
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
