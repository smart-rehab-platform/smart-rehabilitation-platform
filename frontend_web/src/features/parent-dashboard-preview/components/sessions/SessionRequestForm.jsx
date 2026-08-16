import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildPreferredTimePeriodOptions,
  buildSessionRequestReasonOptions,
  getTodayDateInputValue,
  mapSpecialistOption,
} from "../../utils/parentSessionsUtils";

export function SessionRequestForm({
  children,
  specialists,
  form,
  formErrors,
  isSubmitting,
  isLoadingSpecialists,
  submitError,
  onFieldChange,
  onSubmit,
  onReset,
}) {
  const { t } = useLocale();
  const reasonOptions = useMemo(() => buildSessionRequestReasonOptions(t), [t]);
  const timePeriodOptions = useMemo(() => buildPreferredTimePeriodOptions(t), [t]);

  const specialistOptions = specialists
    .map((row) => mapSpecialistOption(row))
    .filter(Boolean);

  return (
    <section className="pd-card pd-card-pad pd-session-request-form pd-section-enter" aria-label={t("parent.sessions.formAriaLabel")}>
      <header className="pd-session-request-form-head">
        <h2 className="pd-section-title">{t("parent.sessions.formTitle")}</h2>
        <p className="pd-task-hub-subtitle">
          {t("parent.sessions.formSubtitle")}
        </p>
      </header>

      <form
        className="pd-session-request-form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="pd-session-request-child">
            {t("parent.common.child")}
          </label>
          <select
            id="pd-session-request-child"
            className="pd-form-select"
            value={form.patientId}
            onChange={(event) => onFieldChange("patientId", event.target.value)}
            disabled={isSubmitting}
          >
            <option value="">{t("parent.common.selectChild")}</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.fullName}
              </option>
            ))}
          </select>
          {formErrors.patientId ? (
            <p className="pd-form-error">{formErrors.patientId}</p>
          ) : null}
        </div>

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="pd-session-request-specialist">
            {t("parent.common.specialist")}
          </label>
          <select
            id="pd-session-request-specialist"
            className="pd-form-select"
            value={form.specialistId}
            onChange={(event) => onFieldChange("specialistId", event.target.value)}
            disabled={isSubmitting || !form.patientId || isLoadingSpecialists}
          >
            <option value="">
              {isLoadingSpecialists ? t("parent.common.loadingSpecialists") : t("parent.common.selectSpecialist")}
            </option>
            {specialistOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.specialistId ? (
            <p className="pd-form-error">{formErrors.specialistId}</p>
          ) : null}
        </div>

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="pd-session-request-reason">
            {t("parent.common.reason")}
          </label>
          <select
            id="pd-session-request-reason"
            className="pd-form-select"
            value={form.reason}
            onChange={(event) => onFieldChange("reason", event.target.value)}
            disabled={isSubmitting}
          >
            <option value="">{t("parent.common.selectReason")}</option>
            {reasonOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.reason ? (
            <p className="pd-form-error">{formErrors.reason}</p>
          ) : null}
        </div>

        {form.reason === "other" ? (
          <div className="pd-form-field pd-form-field-wide">
            <label className="pd-form-label" htmlFor="pd-session-request-reason-other">
              {t("parent.common.reasonDetails")}
            </label>
            <input
              id="pd-session-request-reason-other"
              type="text"
              className="pd-form-input"
              value={form.reasonOtherText}
              onChange={(event) => onFieldChange("reasonOtherText", event.target.value)}
              disabled={isSubmitting}
            />
            {formErrors.reasonOtherText ? (
              <p className="pd-form-error">{formErrors.reasonOtherText}</p>
            ) : null}
          </div>
        ) : null}

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="pd-session-request-date">
            {t("parent.common.preferredDate")}
          </label>
          <input
            id="pd-session-request-date"
            type="date"
            className="pd-form-input"
            min={getTodayDateInputValue()}
            value={form.preferredDate}
            onChange={(event) => onFieldChange("preferredDate", event.target.value)}
            disabled={isSubmitting}
          />
          {formErrors.preferredDate ? (
            <p className="pd-form-error">{formErrors.preferredDate}</p>
          ) : null}
        </div>

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="pd-session-request-period">
            {t("parent.common.preferredTimePeriod")}
          </label>
          <select
            id="pd-session-request-period"
            className="pd-form-select"
            value={form.preferredTimePeriod}
            onChange={(event) => onFieldChange("preferredTimePeriod", event.target.value)}
            disabled={isSubmitting}
          >
            {timePeriodOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.preferredTimePeriod ? (
            <p className="pd-form-error">{formErrors.preferredTimePeriod}</p>
          ) : null}
        </div>

        <div className="pd-form-field pd-form-field-wide">
          <label className="pd-form-label" htmlFor="pd-session-request-notes">
            {t("parent.common.additionalNotes")}
          </label>
          <textarea
            id="pd-session-request-notes"
            className="pd-form-textarea"
            rows={3}
            value={form.notes}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            disabled={isSubmitting}
            placeholder={t("parent.common.optionalDetailsPlaceholder")}
          />
        </div>

        {submitError ? (
          <p className="pd-form-error pd-form-field-wide" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="pd-session-request-form-actions">
          <button
            type="submit"
            className="pd-btn pd-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("parent.common.submitting") : t("parent.common.submitRequest")}
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={onReset}
            disabled={isSubmitting}
          >
            {t("parent.common.clear")}
          </button>
        </div>
      </form>
    </section>
  );
}
