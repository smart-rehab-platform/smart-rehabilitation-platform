import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { parseAdminUsersRoleParam } from "../../routes/adminDashboardRoutes.js";
import { AdminUserDeleteDialog } from "./components/AdminUserDeleteDialog";
import { AdminUserFormModal } from "./components/AdminUserFormModal";
import { AdminUserStatusDialog } from "./components/AdminUserStatusDialog";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminUsersTable } from "./sections/AdminUsersTable";
import { AdminUsersToolbar } from "./sections/AdminUsersToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminUsersSections.css";

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = useMemo(
    () => parseAdminUsersRoleParam(searchParams.get("role")),
    [searchParams],
  );

  const { user } = useAuth();
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
    users,
    filteredUsers,
    presenceById,
    isLoading,
    error,
    searchQuery,
    roleFilter,
    setSearchQuery,
    setRoleFilter,
    reload,
    createUser,
    updateUser,
    updateUserStatus,
    updateSpecialistVerification,
    deleteUser,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isUpdatingVerification,
    isDeleting,
    labels,
  } = useAdminUsers();

  useEffect(() => {
    setRoleFilter(roleFromUrl);
  }, [roleFromUrl, setRoleFilter]);

  const handleRoleFilterChange = useCallback((nextRole) => {
    setRoleFilter(nextRole);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextRole) {
        next.set("role", nextRole);
      } else {
        next.delete("role");
      }
      return next;
    }, { replace: true });
  }, [setRoleFilter, setSearchParams]);

  const [formModal, setFormModal] = useState({ open: false, mode: "add", user: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, user: null, error: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null, error: null });

  const emptyKind = useMemo(() => {
    if (isLoading || error) {
      return null;
    }

    if (users.length === 0) {
      return "no-users";
    }

    if (filteredUsers.length === 0) {
      return "no-matches";
    }

    return null;
  }, [isLoading, error, users.length, filteredUsers.length]);

  const openAddUser = useCallback(() => {
    setFormModal({ open: true, mode: "add", user: null });
  }, []);

  const openEditUser = useCallback((selectedUser) => {
    setFormModal({ open: true, mode: "edit", user: selectedUser });
  }, []);

  const closeFormModal = useCallback(() => {
    if (isCreating || isUpdating) {
      return;
    }

    setFormModal({ open: false, mode: "add", user: null });
  }, [isCreating, isUpdating]);

  const handleFormSubmit = useCallback(async (form) => {
    if (formModal.mode === "edit" && formModal.user) {
      const submitError = await updateUser(formModal.user.id, form);
      if (!submitError) {
        showToast(labels.updatedSuccess);
      }
      return submitError;
    }

    const submitError = await createUser(form);
    if (!submitError) {
      showToast(labels.createdSuccess);
    }
    return submitError;
  }, [formModal.mode, formModal.user, updateUser, createUser, showToast, labels]);

  const openStatusDialog = useCallback((selectedUser) => {
    setStatusDialog({ open: true, user: selectedUser, error: null });
  }, []);

  const closeStatusDialog = useCallback(() => {
    if (isUpdatingStatus) {
      return;
    }

    setStatusDialog({ open: false, user: null, error: null });
  }, [isUpdatingStatus]);

  const confirmStatusChange = useCallback(async () => {
    if (!statusDialog.user) {
      return;
    }

    const nextActive = !statusDialog.user.isActive;
    const submitError = await updateUserStatus(statusDialog.user.id, nextActive);

    if (submitError) {
      setStatusDialog((current) => ({ ...current, error: submitError }));
      return;
    }

    showToast(nextActive ? labels.activatedSuccess : labels.deactivatedSuccess);
    setStatusDialog({ open: false, user: null, error: null });
  }, [statusDialog.user, updateUserStatus, showToast, labels]);

  const handleApproveSpecialist = useCallback(async (selectedUser) => {
    if (!selectedUser?.id || isUpdatingVerification) {
      return;
    }

    const submitError = await updateSpecialistVerification(selectedUser.id, "approved");
    if (submitError) {
      showToast(submitError);
      return;
    }

    showToast(labels.approvedSuccess);
  }, [isUpdatingVerification, updateSpecialistVerification, showToast, labels]);

  const handleRejectSpecialist = useCallback(async (selectedUser) => {
    if (!selectedUser?.id || isUpdatingVerification) {
      return;
    }

    const submitError = await updateSpecialistVerification(selectedUser.id, "rejected");
    if (submitError) {
      showToast(submitError);
      return;
    }

    showToast(labels.rejectedSuccess);
  }, [isUpdatingVerification, updateSpecialistVerification, showToast, labels]);

  const openDeleteDialog = useCallback((selectedUser) => {
    setDeleteDialog({ open: true, user: selectedUser, error: null });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (isDeleting) {
      return;
    }

    setDeleteDialog({ open: false, user: null, error: null });
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!deleteDialog.user) {
      return;
    }

    const submitError = await deleteUser(deleteDialog.user.id);

    if (submitError) {
      setDeleteDialog((current) => ({ ...current, error: submitError }));
      return;
    }

    showToast(labels.deletedSuccess);
    setDeleteDialog({ open: false, user: null, error: null });
  }, [deleteDialog.user, deleteUser, showToast, labels]);

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
        <AdminUsersToolbar
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          onSearchChange={setSearchQuery}
          onRoleFilterChange={handleRoleFilterChange}
          onAddUser={openAddUser}
        />

        {error ? (
          <div className="pd-admin-users-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
              {labels.retry}
            </button>
          </div>
        ) : (
          <AdminUsersTable
            users={filteredUsers}
            presenceById={presenceById}
            isLoading={isLoading}
            emptyKind={emptyKind}
            onEdit={openEditUser}
            onToggleStatus={openStatusDialog}
            onApprove={handleApproveSpecialist}
            onReject={handleRejectSpecialist}
            onDelete={openDeleteDialog}
          />
        )}
      </AdminDashboardShell>

      <AdminUserFormModal
        open={formModal.open}
        mode={formModal.mode}
        user={formModal.user}
        isSubmitting={formModal.mode === "edit" ? isUpdating : isCreating}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      <AdminUserStatusDialog
        open={statusDialog.open}
        user={statusDialog.user}
        isSubmitting={isUpdatingStatus}
        error={statusDialog.error}
        onClose={closeStatusDialog}
        onConfirm={confirmStatusChange}
      />

      <AdminUserDeleteDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        isSelfDelete={Boolean(
          deleteDialog.user?.id && user?.id && deleteDialog.user.id === user.id,
        )}
        isSubmitting={isDeleting}
        error={deleteDialog.error}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
