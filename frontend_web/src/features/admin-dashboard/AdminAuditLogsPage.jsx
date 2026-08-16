import { useMemo } from "react";
import { useAdminAuditLogs } from "./hooks/useAdminAuditLogs";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminAuditLogsTable } from "./sections/AdminAuditLogsTable";
import { AdminAuditLogsToolbar } from "./sections/AdminAuditLogsToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminAuditLogsSections.css";

export default function AdminAuditLogsPage() {
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
    logs,
    userOptions,
    actionOptions,
    entityOptions,
    labels,
    selectedUserId,
    setSelectedUserId,
    selectedAction,
    setSelectedAction,
    selectedEntity,
    setSelectedEntity,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    dateRangeError,
    hasActiveFilters,
    clearFilters,
    isInitialLoading,
    isRefreshing,
    error,
    usersError,
    refresh,
  } = useAdminAuditLogs();

  const emptyKind = useMemo(() => {
    if (isInitialLoading || error) {
      return null;
    }

    if (logs.length > 0) {
      return null;
    }

    return hasActiveFilters ? "no-matches" : "no-logs";
  }, [error, hasActiveFilters, isInitialLoading, logs.length]);

  const showTable = !error || logs.length > 0;
  const showBlockingError = Boolean(error) && logs.length === 0 && !isInitialLoading;
  const showInlineError = Boolean(error) && logs.length > 0;

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
        <AdminAuditLogsToolbar
          labels={labels}
          userOptions={userOptions}
          actionOptions={actionOptions}
          entityOptions={entityOptions}
          selectedUserId={selectedUserId}
          selectedAction={selectedAction}
          selectedEntity={selectedEntity}
          fromDate={fromDate}
          toDate={toDate}
          dateRangeError={dateRangeError}
          usersError={usersError}
          hasActiveFilters={hasActiveFilters}
          isRefreshing={isRefreshing}
          onUserChange={setSelectedUserId}
          onActionChange={setSelectedAction}
          onEntityChange={setSelectedEntity}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onClearFilters={clearFilters}
        />

        {showBlockingError ? (
          <div className="pd-admin-audit-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : null}

        {showInlineError ? (
          <div className="pd-admin-audit-inline-error pd-section-enter" role="alert">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : null}

        {showTable ? (
          <AdminAuditLogsTable
            logs={logs}
            labels={labels}
            isInitialLoading={isInitialLoading}
            isRefreshing={isRefreshing}
            emptyKind={emptyKind}
          />
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
