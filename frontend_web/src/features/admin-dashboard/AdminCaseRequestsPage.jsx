import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildAdminCaseRequestDetailsPath } from "../../routes/adminDashboardRoutes";
import { useAdminCaseRequests } from "./hooks/useAdminCaseRequests";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminCaseRequestsTable } from "./sections/AdminCaseRequestsTable";
import { AdminCaseRequestsToolbar } from "./sections/AdminCaseRequestsToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminCaseRequestsSections.css";

export default function AdminCaseRequestsPage() {
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
    labels,
    items,
    categoryOptions,
    pagination,
    searchQuery,
    statusFilter,
    categoryFilter,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    emptyKind,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    reload,
    loadMore,
    retryLoadMore,
  } = useAdminCaseRequests();

  const handleViewRequest = useCallback((requestId) => {
    navigate(buildAdminCaseRequestDetailsPath(requestId));
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
        <AdminCaseRequestsToolbar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          categoryOptions={categoryOptions}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
        />

        {error ? (
          <div className="pd-admin-case-requests-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
              {labels.retry}
            </button>
          </div>
        ) : (
          <>
            <AdminCaseRequestsTable
              items={items}
              isLoading={isLoading}
              emptyKind={emptyKind}
              onViewRequest={handleViewRequest}
            />

            {!isLoading && !error && pagination.hasNextPage ? (
              <div className="pd-admin-case-requests-load-more pd-section-enter">
                {loadMoreError ? (
                  <>
                    <p className="pd-inline-error">{loadMoreError}</p>
                    <button type="button" className="pd-btn pd-btn-soft" onClick={retryLoadMore}>
                      {labels.retry}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="pd-btn pd-btn-soft"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? labels.loadingMore : labels.loadMore}
                  </button>
                )}
              </div>
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
