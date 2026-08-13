import { useState } from "react";
import {
  rejectAdminComplaint,
  resolveAdminComplaint,
} from "../../../services/adminComplaintsService";
import {
  COMPLAINT_ADMIN_NOTES_MAX_LENGTH,
  COMPLAINT_PARENT_RESPONSE_MAX_LENGTH,
  buildComplaintReviewPayload,
  isInvalidComplaintStatusTransitionError,
  validateComplaintAdminNotes,
} from "../utils/adminComplaintsMappers";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";

const ACTION_CONFIG = {
  resolve: {
    title: "Resolve Complaint",
    confirmLabel: "Resolve Complaint",
    confirmClassName: "pd-btn-success",
    submittingLabel: "Resolving...",
    run: resolveAdminComplaint,
  },
  reject: {
    title: "Reject Complaint",
    confirmLabel: "Reject Complaint",
    confirmClassName: "pd-btn-danger",
    submittingLabel: "Rejecting...",
    run: rejectAdminComplaint,
  },
};

function AdminComplaintReviewActionDialogInner({
  actionType,
  complaint,
  onClose,
  onSuccess,
  onStaleRefresh,
}) {
  const config = ACTION_CONFIG[actionType];
  const [adminNotes, setAdminNotes] = useState("");
  const [parentResponse, setParentResponse] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(Boolean(config && complaint), onClose, { disabled: isSubmitting });

  if (!config || !complaint) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const notesResult = validateComplaintAdminNotes(adminNotes);
    if (!notesResult.valid) {
      setFieldError(notesResult.error);
      setApiError(null);
      return;
    }

    const built = buildComplaintReviewPayload({
      adminNotes,
      parentResponse,
    });

    if (!built.valid) {
      setFieldError(built.error);
      setApiError(null);
      return;
    }

    setFieldError(null);
    setApiError(null);
    setIsSubmitting(true);

    try {
      await config.run(complaint.id, built.payload);
      onSuccess?.(actionType);
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : "Action failed.";
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
        className="pd-admin-modal pd-admin-complaint-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-complaint-review-action-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-complaint-review-action-title" className="pd-admin-modal-title">
          {config.title}
        </h2>

        <div className="pd-admin-complaint-modal-context">
          <p className="pd-admin-modal-copy">
            Category: <strong>{complaint.categoryLabel}</strong>
          </p>
          <p className="pd-admin-modal-copy">
            Child: <strong>{complaint.patientName}</strong>
          </p>
        </div>

        <form className="pd-admin-complaint-review-form" onSubmit={handleSubmit}>
          <label className="pd-admin-complaint-field">
            <span className="pd-admin-complaint-field-label">
              Admin Notes <span className="pd-admin-complaint-required">*</span>
            </span>
            <textarea
              className="pd-admin-complaint-textarea"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={5}
              maxLength={COMPLAINT_ADMIN_NOTES_MAX_LENGTH}
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="pd-admin-complaint-field">
            <span className="pd-admin-complaint-field-label">Parent Response (optional)</span>
            <textarea
              className="pd-admin-complaint-textarea"
              value={parentResponse}
              onChange={(event) => setParentResponse(event.target.value)}
              rows={4}
              maxLength={COMPLAINT_PARENT_RESPONSE_MAX_LENGTH}
              disabled={isSubmitting}
            />
          </label>

          {fieldError ? <p className="pd-inline-error" role="alert">{fieldError}</p> : null}
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
              type="submit"
              className={`pd-btn ${config.confirmClassName}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? config.submittingLabel : config.confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminComplaintReviewActionDialog({
  open,
  actionType,
  complaint,
  onClose,
  onSuccess,
  onStaleRefresh,
}) {
  if (!open || !actionType || !complaint) {
    return null;
  }

  return (
    <AdminComplaintReviewActionDialogInner
      key={`${complaint.id}-${actionType}`}
      actionType={actionType}
      complaint={complaint}
      onClose={onClose}
      onSuccess={onSuccess}
      onStaleRefresh={onStaleRefresh}
    />
  );
}
