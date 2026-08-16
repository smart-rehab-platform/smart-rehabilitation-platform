import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildAdminSupportRequestDetailsPath } from "../../routes/adminDashboardRoutes";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminSupportRequests } from "./hooks/useAdminSupportRequests";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import {
  AdminSupportRequestsTable,
  AdminSupportRequestsToolbar,
} from "./sections/AdminSupportRequestsTable";
import "../shared-dashboard/styles/dashboardTokens.css";
import "../shared-dashboard/styles/supportRequestSections.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminComplaintsSections.css";

export default function AdminSupportRequestsPage() {
  const navigate = useNavigate();
  const shell = useAdminShell();
  const {
    labels,
    requests,
    specialistOptions,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedSpecialistId,
    setSelectedSpecialistId,
    hasActiveFilters,
    clearFilters,
    isLoading,
    isRefreshing,
    error,
    specialistsError,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    refetch,
  } = useAdminSupportRequests();

  const handleViewRequest = useCallback((requestId) => {
    navigate(buildAdminSupportRequestDetailsPath(requestId));
  }, [navigate]);

  const showInitialSkeleton = isLoading && requests.length === 0 && !error;
  const showBlockingError = Boolean(error) && requests.length === 0 && !isLoading;
  let emptyKind = null;
  if (!isLoading && !error && requests.length === 0) {
    emptyKind = hasActiveFilters ? "no-matches" : "no-requests";
  }

  return (
    <div className="pd-preview">
      <AdminDashboardShell
        collapsed={shell.sidebarCollapsed}
        mobileOpen={shell.mobileNavOpen}
        navItems={shell.navItems}
        badges={shell.badges}
        user={shell.adminUser}
        notificationsOpen={shell.notificationsOpen}
        onNotificationsOpenChange={shell.setNotificationsOpen}
        onToggleCollapse={() => shell.setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => shell.setMobileNavOpen(true)}
        onCloseMobile={() => shell.setMobileNavOpen(false)}
        onNavAction={shell.handleSidebarNav}
        onSignOut={shell.handleSignOut}
        onViewProfile={shell.handleViewProfile}
        onViewAllNotifications={shell.handleViewAllNotifications}
        showToast={shell.showToast}
      >
        <AdminSupportRequestsToolbar
          labels={labels}
          selectedStatus={selectedStatus}
          selectedCategory={selectedCategory}
          selectedSpecialistId={selectedSpecialistId}
          specialistOptions={specialistOptions}
          specialistsError={specialistsError}
          isRefreshing={isRefreshing}
          onStatusChange={setSelectedStatus}
          onCategoryChange={setSelectedCategory}
          onSpecialistChange={setSelectedSpecialistId}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          onRefresh={refetch}
        />

        {showInitialSkeleton ? (
          <section className="pd-card pd-card-pad">
            <p className="pd-inline-loading">{labels.loading}</p>
          </section>
        ) : null}

        {showBlockingError ? (
          <section className="pd-card pd-card-pad pd-admin-complaints-error">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
              {labels.retry}
            </button>
          </section>
        ) : null}

        {!showInitialSkeleton && !showBlockingError ? (
          <AdminSupportRequestsTable
            labels={labels}
            requests={requests}
            isLoading={false}
            emptyKind={emptyKind}
            onViewRequest={handleViewRequest}
          />
        ) : null}

        {hasMore ? (
          <div className="pd-admin-complaints-load-more">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              disabled={isLoadingMore}
              onClick={loadMore}
            >
              {isLoadingMore ? labels.loadingMore : labels.loadMore}
            </button>
            {loadMoreError ? <p className="pd-inline-error">{loadMoreError}</p> : null}
          </div>
        ) : null}
      </AdminDashboardShell>

      {shell.toast ? (
        <div className="pd-toast" role="status" aria-live="polite">{shell.toast}</div>
      ) : null}
    </div>
  );
}
