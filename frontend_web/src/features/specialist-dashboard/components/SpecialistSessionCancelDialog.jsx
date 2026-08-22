import { useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { cancelAdminSession } from "../../../services/adminSessionsService";
import { useAdminDialogEscape } from "../../admin-dashboard/hooks/useAdminDialogEscape";
import "../../admin-dashboard/styles/adminSessionsSections.css";

export function SpecialistSessionCancelDialog({
  open,
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [reason, setReason] = useState("");

  useAdminDialogEscape(Boolean(open), onClose, { disabled: isSubmitting });

  if (!open || !session) {
    return null;
  }

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setApiError(null);

    try {
      const trimmedReason = String(reason || "").trim();
      const payload = trimmedReason
        ? { cancellation_reason: trimmedReason }
        : {};
      await cancelAdminSession(session.id, payload);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : t("specialist.sessions.dialogs.cancelFailed");
      setApiError(message);
      await onErrorRefresh?.();
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
        className="pd-admin-modal pd-admin-modal-compact pd-admin-session-action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-session-cancel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-session-cancel-title" className="pd-admin-modal-title">
          {t("specialist.sessions.dialogs.cancelTitle")}
        </h2>

        <p className="pd-admin-modal-copy">
          {t("specialist.sessions.dialogs.cancelConfirm")}
        </p>

        <div className="pd-admin-session-action-context">
          <p className="pd-admin-modal-copy">
            {t("specialist.sessions.dialogs.patient")}:{" "}
            <strong dir="auto">{session.patientName}</strong>
          </p>
          {session.scheduledAt ? (
            <p className="pd-admin-modal-copy">
              {t("specialist.sessions.dialogs.scheduled")}:{" "}
              <strong>
                {session.dateLabel} • {session.timeLabel}
              </strong>
            </p>
          ) : null}
        </div>

        <label className="pd-admin-field">
          <span className="pd-admin-field-label">
            {t("specialist.sessions.dialogs.cancellationReasonOptional")}
          </span>
          <textarea
            className="pd-admin-textarea"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
            placeholder={t("specialist.sessions.dialogs.cancellationReasonPlaceholder")}
            dir="auto"
          />
        </label>

        {apiError ? (
          <p className="pd-inline-error" role="alert">{apiError}</p>
        ) : null}

        <div className="pd-admin-modal-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={() => onClose?.()}
            disabled={isSubmitting}
          >
            {t("specialist.sessions.dialogs.keepSession")}
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("specialist.sessions.dialogs.processing")
              : t("specialist.sessions.dialogs.cancelSession")}
          </button>
        </div>
      </div>
    </div>
  );
}
