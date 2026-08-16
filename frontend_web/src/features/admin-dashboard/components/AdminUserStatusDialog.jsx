import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminUsersLabels } from "../utils/adminUsersLocalization.js";

export function AdminUserStatusDialog({
  open,
  user,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminUsersLabels(t), [t]);

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
          {willDeactivate ? labels.dialogs.deactivateTitle : labels.dialogs.activateTitle}
        </h2>
        <p className="pd-admin-modal-copy">
          {willDeactivate ? labels.dialogs.deactivateBody : labels.dialogs.activateBody}
        </p>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <div className="pd-admin-modal-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={() => onClose?.()}
            disabled={isSubmitting}
          >
            {labels.form.cancel}
          </button>
          <button
            type="button"
            className={`pd-btn ${willDeactivate ? "pd-btn-danger" : "pd-btn-primary"}`}
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? labels.form.saving
              : willDeactivate
                ? labels.actions.deactivate
                : labels.actions.activate}
          </button>
        </div>
      </div>
    </div>
  );
}
