import { useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  rejectAdminComplaint,
  resolveAdminComplaint,
} from "../../../services/adminComplaintsService";
import {
  COMPLAINT_ADMIN_NOTES_MAX_LENGTH,
  COMPLAINT_PARENT_RESPONSE_MAX_LENGTH,
  buildComplaintReviewPayload,
  isInvalidComplaintStatusTransitionError,
} from "../utils/adminComplaintsMappers";
import {
  friendlyComplaintErrorLocalized,
  getAdminComplaintsLabels,
  validateComplaintAdminNotesLocalized,
} from "../utils/adminComplaintsLocalization.js";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";

function AdminComplaintReviewActionDialogInner({
  actionType,
  complaint,
  onClose,
  onSuccess,
  onStaleRefresh,
}) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const [adminNotes, setAdminNotes] = useState("");
  const [parentResponse, setParentResponse] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(Boolean(actionType && complaint), onClose, { disabled: isSubmitting });

  if (!actionType || !complaint) {
    return null;
  }

  const isResolve = actionType === "resolve";
  const title = isResolve ? labels.dialogs.resolveTitle : labels.dialogs.rejectTitle;
  const confirmLabel = isResolve ? labels.actions.resolve : labels.actions.reject;
  const submittingLabel = isResolve ? labels.dialogs.resolving : labels.dialogs.rejecting;
  const run = isResolve ? resolveAdminComplaint : rejectAdminComplaint;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const notesResult = validateComplaintAdminNotesLocalized(adminNotes, mapperContext);
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
      await run(complaint.id, built.payload);
      onSuccess?.(actionType);
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
        className="pd-admin-modal pd-admin-complaint-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-complaint-review-action-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-complaint-review-action-title" className="pd-admin-modal-title">
          {title}
        </h2>

        <div className="pd-admin-complaint-modal-context">
          <p className="pd-admin-modal-copy">
            {labels.dialogs.categoryLabel}: <strong>{complaint.categoryLabel}</strong>
          </p>
          <p className="pd-admin-modal-copy">
            {labels.dialogs.childLabel}: <strong dir="auto">{complaint.patientName}</strong>
          </p>
        </div>

        <form className="pd-admin-complaint-review-form" onSubmit={handleSubmit}>
          <label className="pd-admin-complaint-field">
            <span className="pd-admin-complaint-field-label">
              {labels.dialogs.adminNotesLabel} <span className="pd-admin-complaint-required">*</span>
            </span>
            <textarea
              className="pd-admin-complaint-textarea"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={5}
              maxLength={COMPLAINT_ADMIN_NOTES_MAX_LENGTH}
              placeholder={labels.dialogs.adminNotesPlaceholder}
              disabled={isSubmitting}
              required
              dir="auto"
            />
          </label>

          <label className="pd-admin-complaint-field">
            <span className="pd-admin-complaint-field-label">{labels.dialogs.parentResponseLabel}</span>
            <textarea
              className="pd-admin-complaint-textarea"
              value={parentResponse}
              onChange={(event) => setParentResponse(event.target.value)}
              rows={4}
              maxLength={COMPLAINT_PARENT_RESPONSE_MAX_LENGTH}
              placeholder={labels.dialogs.parentResponsePlaceholder}
              disabled={isSubmitting}
              dir="auto"
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
              {labels.dialogs.cancel}
            </button>
            <button
              type="submit"
              className={`pd-btn ${isResolve ? "pd-btn-success" : "pd-btn-danger"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingLabel : confirmLabel}
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
