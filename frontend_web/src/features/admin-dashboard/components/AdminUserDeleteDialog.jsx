import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminUsersLabels } from "../utils/adminUsersLocalization.js";

export function AdminUserDeleteDialog({
  open,
  user,
  isSelfDelete = false,
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
          {isSelfDelete ? labels.dialogs.deleteSelfTitle : labels.dialogs.deleteTitle}
        </h2>
        <p className="pd-admin-modal-copy">
          {isSelfDelete
            ? labels.dialogs.deleteSelfBody
            : t("admin.users.dialogs.deleteBody", { name: user.fullName })}
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
            className="pd-btn pd-btn-danger"
            onClick={() => onConfirm?.()}
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.dialogs.deleting : labels.actions.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
