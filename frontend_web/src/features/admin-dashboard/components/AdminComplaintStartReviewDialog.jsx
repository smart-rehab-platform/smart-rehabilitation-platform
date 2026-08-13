import { useState } from "react";
import { startAdminComplaintReview } from "../../../services/adminComplaintsService";
import { isInvalidComplaintStatusTransitionError } from "../utils/adminComplaintsMappers";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";

function AdminComplaintStartReviewDialogInner({
  complaint,
  onClose,
  onSuccess,
  onStaleRefresh,
}) {
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
        : "Failed to start complaint review.";
      setApiError(message);

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
          Start Review
        </h2>

        <p className="pd-admin-modal-copy">Start reviewing this complaint?</p>

        <div className="pd-admin-complaint-modal-context">
          <p className="pd-admin-modal-copy">
            Category: <strong>{complaint.categoryLabel}</strong>
          </p>
          <p className="pd-admin-modal-copy">
            Child: <strong>{complaint.patientName}</strong>
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
            Cancel
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting..." : "Start Review"}
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
