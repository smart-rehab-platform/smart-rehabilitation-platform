import { useCallback, useMemo, useState } from "react";
import { useAdminSessions } from "./hooks/useAdminSessions";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminSessionActionDialog } from "./components/AdminSessionActionDialog";
import { AdminSessionEditDialog } from "./components/AdminSessionEditDialog";
import { AdminSessionsTable } from "./sections/AdminSessionsTable";
import { AdminSessionsToolbar } from "./sections/AdminSessionsToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminSessionsSections.css";

const ACTION_SUCCESS_TOAST_KEYS = {
  complete: "completeSuccess",
  cancel: "cancelSuccess",
  noShow: "noShowSuccess",
};

export default function AdminSessionsPage() {
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
    sessions,
    filteredSessions,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    hasActiveFilters,
    isLoading,
    error,
    refresh,
  } = useAdminSessions();

  const [editingSession, setEditingSession] = useState(null);
  const [actionState, setActionState] = useState(null);

  const emptyKind = useMemo(() => {
    if (isLoading || error) {
      return null;
    }

    if (sessions.length === 0) {
      return "no-sessions";
    }

    if (filteredSessions.length === 0 && hasActiveFilters) {
      return "no-matches";
    }

    return null;
  }, [error, filteredSessions.length, hasActiveFilters, isLoading, sessions.length]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedStatus("");
  }, [setSearchQuery, setSelectedStatus]);

  const handleEditSession = useCallback((session) => {
    setEditingSession(session);
  }, []);

  const handleCloseEditSession = useCallback(() => {
    setEditingSession(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditingSession(null);
    showToast(labels.toast.updateSuccess);
    refresh();
  }, [labels.toast.updateSuccess, refresh, showToast]);

  const handleEditErrorRefresh = useCallback(async () => {
    refresh();
  }, [refresh]);

  const handleCompleteSession = useCallback((session) => {
    setActionState({ type: "complete", session });
  }, []);

  const handleCancelSession = useCallback((session) => {
    setActionState({ type: "cancel", session });
  }, []);

  const handleNoShowSession = useCallback((session) => {
    setActionState({ type: "noShow", session });
  }, []);

  const handleCloseActionDialog = useCallback(() => {
    setActionState(null);
  }, []);

  const handleActionSuccess = useCallback((actionType) => {
    setActionState(null);
    const toastKey = actionType && ACTION_SUCCESS_TOAST_KEYS[actionType];
    if (toastKey) {
      showToast(labels.toast[toastKey]);
    }
    refresh();
  }, [labels.toast, refresh, showToast]);

  const handleActionErrorRefresh = useCallback(async () => {
    refresh();
  }, [refresh]);

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
        <AdminSessionsToolbar
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          onSearchChange={setSearchQuery}
          onStatusChange={setSelectedStatus}
        />

        {error ? (
          <div className="pd-admin-sessions-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : (
          <AdminSessionsTable
            sessions={filteredSessions}
            isLoading={isLoading}
            emptyKind={emptyKind}
            onClearFilters={handleClearFilters}
            onEditSession={handleEditSession}
            onCompleteSession={handleCompleteSession}
            onCancelSession={handleCancelSession}
            onNoShowSession={handleNoShowSession}
          />
        )}
      </AdminDashboardShell>

      <AdminSessionEditDialog
        open={Boolean(editingSession)}
        session={editingSession}
        onClose={handleCloseEditSession}
        onSuccess={handleEditSuccess}
        onErrorRefresh={handleEditErrorRefresh}
      />

      <AdminSessionActionDialog
        open={Boolean(actionState)}
        actionType={actionState?.type ?? null}
        session={actionState?.session ?? null}
        onClose={handleCloseActionDialog}
        onSuccess={handleActionSuccess}
        onErrorRefresh={handleActionErrorRefresh}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
