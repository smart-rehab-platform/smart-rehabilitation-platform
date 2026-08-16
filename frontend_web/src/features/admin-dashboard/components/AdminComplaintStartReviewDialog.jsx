import { useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { startAdminComplaintReview } from "../../../services/adminComplaintsService";
import { isInvalidComplaintStatusTransitionError } from "../utils/adminComplaintsMappers";
import {
  friendlyComplaintErrorLocalized,
  getAdminComplaintsLabels,
} from "../utils/adminComplaintsLocalization.js";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";

function AdminComplaintStartReviewDialogInner({
  complaint,
  onClose,
  onSuccess,
  onStaleRefresh,
}) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(true, onClose, { disabled: isSubmitting });

  const handleConfirm = async () => {
    if (isSubmitting || !complaint?.id) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      await startAdminComplaintReview(complaint.id);
      onSuccess?.();
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : labels.toast.actionFailed;
      setApiError(friendlyComplaintErrorLocalized(message, mapperContext));

      if (isInvalidComplaintStatusTransitionError(submitError)) {
        await onStaleRefresh?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="pd-admin-modal-backdrop"
      role="presentation"
      onClick={() => !isSubmitting && onClose?.()}
    >
      <div
        className="pd-admin-modal pd-admin-modal-compact pd-admin-complaint-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-complaint-start-review-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-complaint-start-review-title" className="pd-admin-modal-title">
          {labels.dialogs.startReviewTitle}
        </h2>

        <p className="pd-admin-modal-copy">{labels.dialogs.startReviewBody}</p>

        <div className="pd-admin-complaint-modal-context">
          <p className="pd-admin-modal-copy">
            {labels.dialogs.categoryLabel}: <strong>{complaint.categoryLabel}</strong>
          </p>
          <p className="pd-admin-modal-copy">
            {labels.dialogs.childLabel}: <strong dir="auto">{complaint.patientName}</strong>
          </p>
        </div>

        {apiError ? <p className="pd-inline-error" role="alert">{apiError}</p> : null}

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
            className="pd-btn pd-btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.dialogs.starting : labels.actions.startReview}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminComplaintStartReviewDialog({
  open,
  complaint,
  onClose,
  onSuccess,
  onStaleRefresh,
}) {
  if (!open || !complaint) {
    return null;
  }

  return (
    <AdminComplaintStartReviewDialogInner
      key={complaint.id}
      complaint={complaint}
      onClose={onClose}
      onSuccess={onSuccess}
      onStaleRefresh={onStaleRefresh}
    />
  );
}
