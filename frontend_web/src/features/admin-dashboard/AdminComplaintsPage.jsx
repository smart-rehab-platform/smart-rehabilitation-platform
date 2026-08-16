import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildAdminComplaintDetailsPath } from "../../routes/adminDashboardRoutes";
import { useAdminComplaints } from "./hooks/useAdminComplaints";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminComplaintsTable } from "./sections/AdminComplaintsTable";
import { AdminComplaintsToolbar } from "./sections/AdminComplaintsToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminComplaintsSections.css";

export default function AdminComplaintsPage() {
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
    complaints,
    specialistOptions,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedSpecialistId,
    setSelectedSpecialistId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    dateRangeError,
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
    refresh,
  } = useAdminComplaints();

  const handleViewComplaint = useCallback((complaintId) => {
    navigate(buildAdminComplaintDetailsPath(complaintId));
  }, [navigate]);

  const showInitialSkeleton = isLoading && complaints.length === 0 && !error;
  const showInlineRefreshError = Boolean(error) && complaints.length > 0;
  const showBlockingError = Boolean(error) && complaints.length === 0 && !isLoading;
  const showTableUpdating = (isLoading || isRefreshing) && complaints.length > 0;

  let emptyKind = null;
  if (!isLoading && !error && complaints.length === 0) {
    emptyKind = hasActiveFilters ? "no-matches" : "no-complaints";
  }

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
        <AdminComplaintsToolbar
          selectedStatus={selectedStatus}
          selectedCategory={selectedCategory}
          selectedSpecialistId={selectedSpecialistId}
          specialistOptions={specialistOptions}
          specialistsError={specialistsError}
          fromDate={fromDate}
          toDate={toDate}
          dateRangeError={dateRangeError}
          hasActiveFilters={hasActiveFilters}
          isRefreshing={isRefreshing || showTableUpdating}
          onStatusChange={setSelectedStatus}
          onCategoryChange={setSelectedCategory}
          onSpecialistChange={setSelectedSpecialistId}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onClearFilters={clearFilters}
        />

        {showBlockingError ? (
          <div className="pd-admin-complaints-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : null}

        {showInlineRefreshError ? (
          <div className="pd-admin-complaints-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : null}

        {!showBlockingError ? (
          <>
            <div className={showTableUpdating ? "pd-admin-complaints-table-wrap is-updating" : undefined}>
              <AdminComplaintsTable
                complaints={complaints}
                isLoading={showInitialSkeleton}
                emptyKind={emptyKind}
                onViewComplaint={handleViewComplaint}
              />
            </div>

            {!showInitialSkeleton && !emptyKind && hasMore ? (
              <div className="pd-admin-complaints-load-more pd-section-enter">
                {loadMoreError ? (
                  <>
                    <p className="pd-inline-error">{loadMoreError}</p>
                    <button type="button" className="pd-btn pd-btn-soft" onClick={loadMore}>
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
        ) : null}
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
