export function AdminUserDeleteDialog({
  open,
  user,
  isSelfDelete = false,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}) {
  if (!open || !user) {
    return null;
  }

  return (
    <div className="pd-admin-modal-backdrop" role="presentation" onClick={() => !isSubmitting && onClose?.()}>
      <div
        className="pd-admin-modal pd-admin-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-user-delete-title" className="pd-admin-modal-title">
          {isSelfDelete ? "Delete your account?" : "Delete user?"}
        </h2>
        <p className="pd-admin-modal-copy">
          {isSelfDelete
            ? "You are about to delete your own admin account. This action cannot be undone."
            : `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`}
        </p>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <div className="pd-admin-modal-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={() => onClose?.()}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-danger"
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
