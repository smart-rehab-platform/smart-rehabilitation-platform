import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";
import { getAdminExercisesLabels } from "../utils/adminExercisesLocalization.js";

export function AdminExerciseDeleteDialog({
  open,
  exerciseTitle,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);
  useAdminDialogEscape(open, onClose, { disabled: isSubmitting });

  if (!open) {
    return null;
  }

  const title = exerciseTitle?.trim() || labels.emptyDisplay;

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
          {labels.dialogs.deleteTitle}
        </h2>
        <p className="pd-admin-modal-copy">
          {labels.dialogs.deleteBody(title)}
        </p>

        {error ? <p className="pd-inline-error" role="alert">{error}</p> : null}

        <div className="pd-admin-modal-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={() => onClose?.()}
            disabled={isSubmitting}
          >
            {labels.dialogs.cancel}
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-danger"
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
            aria-label={`${labels.dialogs.confirm} ${title}`}
          >
            {isSubmitting ? labels.dialogs.deleting : labels.dialogs.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
