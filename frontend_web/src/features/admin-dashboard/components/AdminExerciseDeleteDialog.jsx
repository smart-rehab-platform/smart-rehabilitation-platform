import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";

export function AdminExerciseDeleteDialog({
  open,
  exerciseTitle,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}) {
  useAdminDialogEscape(open, onClose, { disabled: isSubmitting });

  if (!open) {
    return null;
  }

  const title = exerciseTitle?.trim() || "this exercise";

  return (
    <div
      className="pd-admin-modal-backdrop"
      role="presentation"
      onClick={() => !isSubmitting && onClose?.()}
    >
      <div
        className="pd-admin-modal pd-admin-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-exercise-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-exercise-delete-title" className="pd-admin-modal-title">
          Delete Exercise
        </h2>
        <p className="pd-admin-modal-copy">
          Are you sure you want to delete &quot;{title}&quot;?
        </p>
        <p className="pd-admin-modal-copy">This action cannot be undone.</p>

        {error ? <p className="pd-inline-error" role="alert">{error}</p> : null}

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
            aria-label={`Delete exercise ${title}`}
          >
            {isSubmitting ? "Deleting..." : "Delete Exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}
