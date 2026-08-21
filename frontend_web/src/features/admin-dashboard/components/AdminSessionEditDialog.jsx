import { useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { updateAdminSession } from "../../../services/adminSessionsService";
import { AdminSessionStatusBadge } from "./AdminSessionStatusBadge";
import {
  buildAdminSessionUpdatePayload,
  combineSessionDateAndTime,
  SESSION_STATUS_VALUES,
} from "../utils/adminSessionsMappers";
import { useAdminDialogEscape } from "../hooks/useAdminDialogEscape";
import {
  formatAdminSessionStatusLabel,
  getAdminSessionsLabels,
} from "../utils/adminSessionsLocalization.js";

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateInput(scheduledAt) {
  if (!scheduledAt) {
    return "";
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTimeInput(scheduledAt) {
  if (!scheduledAt) {
    return "";
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildInitialForm(session) {
  return {
    dateText: formatDateInput(session.scheduledAt),
    timeText: formatTimeInput(session.scheduledAt),
    durationText: String(session.durationMinutes ?? 45),
    locationOrLink: session.locationOrLink ?? "",
    selectedStatus: session.status ?? "scheduled",
    cancellationReason: session.cancellationReason ?? "",
  };
}

function AdminSessionEditDialogInner({
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminSessionsLabels(t), [t]);
  const statusOptions = useMemo(
    () => SESSION_STATUS_VALUES.map((value) => ({
      value,
      label: formatAdminSessionStatusLabel(value, false, t),
    })),
    [t],
  );

  const originallyScheduled = session.isScheduled;
  const [form, setForm] = useState(() => buildInitialForm(session));
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(true, onClose, { disabled: isSubmitting });

  const error = validationError || apiError;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (validationError) {
      setValidationError(null);
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const scheduledAt = combineSessionDateAndTime(form.dateText, form.timeText);
    if (!scheduledAt) {
      setValidationError(labels.validation.invalidDateTime);
      return;
    }

    const parsedDuration = Number.parseInt(form.durationText.trim(), 10);
    const durationMinutes = Number.isFinite(parsedDuration) ? parsedDuration : null;

    const payload = buildAdminSessionUpdatePayload(session, {
      scheduledAt,
      durationMinutes,
      locationOrLink: form.locationOrLink,
      selectedStatus: originallyScheduled ? form.selectedStatus : undefined,
      cancellationReason: originallyScheduled && form.selectedStatus === "cancelled"
        ? form.cancellationReason
        : undefined,
    });

    setIsSubmitting(true);
    setValidationError(null);
    setApiError(null);

    try {
      await updateAdminSession(session.id, payload);
      onSuccess?.();
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : labels.toast.updateFailed;
      setApiError(message);
      await onErrorRefresh?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCancellationReason = originallyScheduled && form.selectedStatus === "cancelled";

  return (
    <div
      className="pd-admin-modal-backdrop"
      role="presentation"
      onClick={() => !isSubmitting && onClose?.()}
    >
      <div
        className="pd-admin-modal pd-admin-session-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-session-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-session-edit-title" className="pd-admin-modal-title">
          {labels.dialogs.editTitle}
        </h2>

        <div className="pd-admin-session-edit-summary">
          <div className="pd-admin-session-edit-summary-grid">
            <div className="pd-admin-session-edit-summary-item">
              <span className="pd-admin-session-edit-summary-label">{labels.dialogs.patient}</span>
              <span className="pd-admin-session-edit-summary-value">
                <bdi dir="auto">{session.patientName}</bdi>
              </span>
            </div>
            <div className="pd-admin-session-edit-summary-item">
              <span className="pd-admin-session-edit-summary-label">{labels.dialogs.specialist}</span>
              <span className="pd-admin-session-edit-summary-value">
                <bdi dir="auto">{session.specialistName}</bdi>
              </span>
            </div>
          </div>
        </div>

        <form className="pd-admin-form pd-admin-session-edit-form" onSubmit={handleSubmit}>
          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{labels.dialogs.dateHint}</span>
            <input
              type="text"
              className="pd-admin-input"
              value={form.dateText}
              onChange={(event) => updateField("dateText", event.target.value)}
              disabled={isSubmitting}
              inputMode="numeric"
              autoComplete="off"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{labels.dialogs.timeHint}</span>
            <input
              type="text"
              className="pd-admin-input"
              value={form.timeText}
              onChange={(event) => updateField("timeText", event.target.value)}
              disabled={isSubmitting}
              inputMode="numeric"
              autoComplete="off"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{labels.dialogs.duration}</span>
            <input
              type="number"
              className="pd-admin-input"
              value={form.durationText}
              onChange={(event) => updateField("durationText", event.target.value)}
              disabled={isSubmitting}
              inputMode="numeric"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{labels.dialogs.locationLink}</span>
            <input
              type="text"
              className="pd-admin-input"
              value={form.locationOrLink}
              onChange={(event) => updateField("locationOrLink", event.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
              dir="auto"
            />
          </label>

          {originallyScheduled ? (
            <label className="pd-admin-field">
              <span className="pd-admin-field-label">{labels.dialogs.status}</span>
              <select
                className="pd-admin-select"
                value={form.selectedStatus}
                onChange={(event) => updateField("selectedStatus", event.target.value)}
                disabled={isSubmitting}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="pd-admin-field">
              <span className="pd-admin-field-label">{labels.dialogs.status}</span>
              <div className="pd-admin-session-edit-status-readonly">
                <AdminSessionStatusBadge
                  label={session.statusLabel}
                  tone={session.statusTone}
                  variant="dot"
                />
              </div>
              <p className="pd-admin-session-edit-status-note">
                {labels.dialogs.statusFinalNote}
              </p>
            </div>
          )}

          {showCancellationReason ? (
            <label className="pd-admin-field">
              <span className="pd-admin-field-label">{labels.dialogs.cancellationReason}</span>
              <textarea
                className="pd-admin-textarea"
                value={form.cancellationReason}
                onChange={(event) => updateField("cancellationReason", event.target.value)}
                disabled={isSubmitting}
                rows={3}
                placeholder={labels.dialogs.cancellationReasonPlaceholder}
                dir="auto"
              />
            </label>
          ) : null}

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
              type="submit"
              className="pd-btn pd-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? labels.dialogs.saving : labels.dialogs.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminSessionEditDialog({
  open,
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  if (!open || !session) {
    return null;
  }

  return (
    <AdminSessionEditDialogInner
      key={session.id}
      session={session}
      onClose={onClose}
      onSuccess={onSuccess}
      onErrorRefresh={onErrorRefresh}
    />
  );
}
