export function AdminUserStatusDialog({
  open,
  user,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}) {
  if (!open || !user) {
    return null;
  }

  const willDeactivate = user.isActive;

  return (
    <div className="pd-admin-modal-backdrop" role="presentation" onClick={() => !isSubmitting && onClose?.()}>
      <div
        className="pd-admin-modal pd-admin-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-status-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-user-status-title" className="pd-admin-modal-title">
          {willDeactivate ? "Deactivate User" : "Activate User"}
        </h2>
        <p className="pd-admin-modal-copy">
          {willDeactivate
            ? "This user will lose access to the platform until reactivated."
            : "This user will regain access to the platform."}
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
            className={`pd-btn ${willDeactivate ? "pd-btn-danger" : "pd-btn-primary"}`}
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : willDeactivate
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
