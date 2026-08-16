export function AdminPatientAssignmentsUnlinkDialog({
  open,
  title,
  message,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
  labels,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="pd-admin-modal-backdrop" role="presentation" onClick={() => !isSubmitting && onClose?.()}>
      <div
        className="pd-admin-modal pd-admin-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-patient-assignments-unlink-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-patient-assignments-unlink-title" className="pd-admin-modal-title">
          {title}
        </h2>
        <p className="pd-admin-modal-copy">{message}</p>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <div className="pd-admin-modal-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={() => onClose?.()}
            disabled={isSubmitting}
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-danger"
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.unlinking : labels.unlink}
          </button>
        </div>
      </div>
    </div>
  );
}
