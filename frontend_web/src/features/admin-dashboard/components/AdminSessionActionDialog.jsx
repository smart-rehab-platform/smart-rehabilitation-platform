import { useState } from "react";
import {
  cancelAdminSession,
  completeAdminSession,
  markAdminSessionNoShow,
} from "../../../services/adminSessionsService";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";

const ACTION_CONFIG = {
  complete: {
    title: "Complete Session",
    message: "Are you sure you want to mark this session as completed?",
    dismissLabel: "Cancel",
    confirmLabel: "Complete",
    confirmClassName: "pd-btn-success",
    run: completeAdminSession,
  },
  cancel: {
    title: "Cancel Session",
    message: "Are you sure you want to cancel this session?",
    dismissLabel: "Keep Session",
    confirmLabel: "Cancel Session",
    confirmClassName: "pd-btn-danger",
    run: cancelAdminSession,
  },
  noShow: {
    title: "Mark No Show",
    message: "Are you sure you want to mark this session as no-show?",
    dismissLabel: "Cancel",
    confirmLabel: "Mark No Show",
    confirmClassName: "pd-btn-warning",
    run: markAdminSessionNoShow,
  },
};

function formatSessionContext(scheduledAt) {
  if (!scheduledAt) {
    return null;
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} • ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function AdminSessionActionDialogInner({
  actionType,
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  const config = ACTION_CONFIG[actionType];
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(Boolean(config && session), onClose, { disabled: isSubmitting });

  if (!config || !session) {
    return null;
  }

  const scheduleLabel = formatSessionContext(session.scheduledAt);

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
        : "Action failed.";
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
            Patient: <strong>{session.patientName}</strong>
          </p>
          {scheduleLabel ? (
            <p className="pd-admin-modal-copy">
              Scheduled: <strong>{scheduleLabel}</strong>
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
            {isSubmitting ? "Processing..." : config.confirmLabel}
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
