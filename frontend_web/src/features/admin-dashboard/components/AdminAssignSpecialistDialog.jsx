export function AdminAssignSpecialistDialog({
  open,
  specialistName,
  isSubmitting = false,
  error = null,
  labels,
  onClose,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  const message = specialistName
    ? labels.assignBody(specialistName)
    : labels.assignBodyGeneric;

  return (
    <div className="pd-admin-modal-backdrop" role="presentation" onClick={() => !isSubmitting && onClose?.()}>
      <div
        className="pd-admin-modal pd-admin-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-assign-specialist-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-assign-specialist-title" className="pd-admin-modal-title">
          {labels.assignTitle}
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
            className="pd-btn pd-btn-primary"
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.assigning : labels.assignConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
