import { useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  cancelAdminSession,
  completeAdminSession,
  markAdminSessionNoShow,
} from "../../../services/adminSessionsService";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";
import {
  formatAdminSessionDateTimeLabel,
  getAdminSessionsLabels,
} from "../utils/adminSessionsLocalization.js";

function buildActionConfig(labels) {
  return {
    complete: {
      title: labels.dialogs.completeTitle,
      message: labels.dialogs.completeBody,
      dismissLabel: labels.dialogs.cancel,
      confirmLabel: labels.complete,
      confirmClassName: "pd-btn-success",
      run: completeAdminSession,
    },
    cancel: {
      title: labels.dialogs.cancelTitle,
      message: labels.dialogs.cancelBody,
      dismissLabel: labels.dialogs.keepSession,
      confirmLabel: labels.cancelSession,
      confirmClassName: "pd-btn-danger",
      run: cancelAdminSession,
    },
    noShow: {
      title: labels.dialogs.noShowTitle,
      message: labels.dialogs.noShowBody,
      dismissLabel: labels.dialogs.cancel,
      confirmLabel: labels.markNoShow,
      confirmClassName: "pd-btn-warning",
      run: markAdminSessionNoShow,
    },
  };
}

function AdminSessionActionDialogInner({
  actionType,
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminSessionsLabels(t), [t]);
  const actionConfig = useMemo(() => buildActionConfig(labels), [labels]);
  const config = actionConfig[actionType];
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(Boolean(config && session), onClose, { disabled: isSubmitting });

  if (!config || !session) {
    return null;
  }

  const scheduleLabel = formatAdminSessionDateTimeLabel(session.scheduledAt, { t, locale });

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      await config.run(session.id);
      onSuccess?.(actionType);
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : labels.toast.actionFailed;
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
        aria-labelledby="admin-session-action-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-session-action-title" className="pd-admin-modal-title">
          {config.title}
        </h2>

        <p className="pd-admin-modal-copy">{config.message}</p>

        <div className="pd-admin-session-action-context">
          <p className="pd-admin-modal-copy">
            {labels.dialogs.patient}: <strong dir="auto">{session.patientName}</strong>
          </p>
          {scheduleLabel && scheduleLabel !== labels.emptyDisplay ? (
            <p className="pd-admin-modal-copy">
              {labels.dialogs.scheduled}: <strong>{scheduleLabel}</strong>
            </p>
          ) : null}
        </div>

        {apiError ? <p className="pd-inline-error" role="alert">{apiError}</p> : null}

        <div className="pd-admin-modal-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={() => onClose?.()}
            disabled={isSubmitting}
          >
            {config.dismissLabel}
          </button>
          <button
            type="button"
            className={`pd-btn ${config.confirmClassName}`}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.dialogs.processing : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminSessionActionDialog({
  open,
  actionType,
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  if (!open || !actionType || !session) {
    return null;
  }

  return (
    <AdminSessionActionDialogInner
      key={`${session.id}-${actionType}`}
      actionType={actionType}
      session={session}
      onClose={onClose}
      onSuccess={onSuccess}
      onErrorRefresh={onErrorRefresh}
    />
  );
}
