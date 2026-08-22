import { useEffect, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { updateAdminSession } from "../../../services/adminSessionsService";
import { useAdminDialogEscape } from "../../admin-dashboard/hooks/useAdminDialogEscape";
import {
  buildAdminSessionUpdatePayload,
  combineSessionDateAndTime,
} from "../../admin-dashboard/utils/adminSessionsMappers";
import "../../admin-dashboard/styles/adminSessionsSections.css";

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
  };
}

export function SpecialistSessionEditDialog({
  open,
  session,
  onClose,
  onSuccess,
  onErrorRefresh,
}) {
  const { t } = useLocale();
  const [form, setForm] = useState(() => (session ? buildInitialForm(session) : null));
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAdminDialogEscape(Boolean(open), onClose, { disabled: isSubmitting });

  useEffect(() => {
    if (session) {
      setForm(buildInitialForm(session));
      setValidationError(null);
      setApiError(null);
    }
  }, [session]);

  if (!open || !session || !form) {
    return null;
  }

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
      setValidationError(t("specialist.sessions.dialogs.validation.invalidDateTime"));
      return;
    }

    const parsedDuration = Number.parseInt(String(form.durationText || "").trim(), 10);
    const durationMinutes = Number.isFinite(parsedDuration) ? parsedDuration : null;

    const payload = buildAdminSessionUpdatePayload(session, {
      scheduledAt,
      durationMinutes,
      locationOrLink: form.locationOrLink,
    });

    setIsSubmitting(true);
    setValidationError(null);
    setApiError(null);

    try {
      await updateAdminSession(session.id, payload);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : t("specialist.sessions.dialogs.updateFailed");
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
        className="pd-admin-modal pd-admin-session-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-session-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-session-edit-title" className="pd-admin-modal-title">
          {t("specialist.sessions.dialogs.editTitle")}
        </h2>

        <form className="pd-admin-form pd-admin-session-edit-form" onSubmit={handleSubmit}>
          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{t("specialist.sessions.dialogs.date")}</span>
            <input
              type="text"
              className="pd-admin-input"
              value={form.dateText}
              onChange={(event) => updateField("dateText", event.target.value)}
              disabled={isSubmitting}
              inputMode="numeric"
              autoComplete="off"
              placeholder="YYYY-MM-DD"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{t("specialist.sessions.dialogs.time")}</span>
            <input
              type="text"
              className="pd-admin-input"
              value={form.timeText}
              onChange={(event) => updateField("timeText", event.target.value)}
              disabled={isSubmitting}
              inputMode="numeric"
              autoComplete="off"
              placeholder="HH:MM"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{t("specialist.sessions.dialogs.duration")}</span>
            <input
              type="number"
              className="pd-admin-input"
              value={form.durationText}
              onChange={(event) => updateField("durationText", event.target.value)}
              disabled={isSubmitting}
              inputMode="numeric"
              min={1}
              max={480}
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{t("specialist.sessions.dialogs.location")}</span>
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

          {validationError ? (
            <p className="pd-inline-error" role="alert">{validationError}</p>
          ) : null}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="pd-btn pd-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("specialist.sessions.dialogs.saving")
                : t("specialist.sessions.dialogs.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
