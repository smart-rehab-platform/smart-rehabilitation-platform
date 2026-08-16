import { useMemo } from "react";
import { SupportRequestAttachmentField } from "../../../shared-dashboard/components/supportRequests/SupportRequestAttachmentField";
import { useLocale } from "../../../../context/useLocale.js";
import {
  SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH,
  SUPPORT_REQUEST_SUBJECT_MAX_LENGTH,
} from "../../../shared-dashboard/utils/supportRequestMappers";
import { getSpecialistSupportFormLabels } from "../../utils/specialistSupportRequestsLocalization.js";

export function SpecialistSupportRequestForm({
  form,
  fieldErrors,
  categoryOptions,
  attachmentFile,
  attachmentError,
  isSubmitting,
  isUploadingAttachment,
  submitError,
  onFieldChange,
  onSelectAttachment,
  onClearAttachment,
  onCancel,
  onSubmit,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getSpecialistSupportFormLabels(t), [t]);
  const disabled = isSubmitting || isUploadingAttachment;

  return (
    <form
      className="pd-support-request-form pd-section-enter"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <section className="pd-card pd-card-pad">
        <p className="pd-support-request-form-intro">
          {labels.intro}
        </p>

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="support-request-category">
            {labels.category}
          </label>
          <select
            id="support-request-category"
            className="pd-form-input"
            value={form.category}
            disabled={disabled}
            onChange={(event) => onFieldChange("category", event.target.value)}
          >
            <option value="">{labels.selectCategory}</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {fieldErrors.category ? <p className="pd-form-error">{fieldErrors.category}</p> : null}
        </div>

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="support-request-subject">
            {labels.subject}
          </label>
          <input
            id="support-request-subject"
            className="pd-form-input"
            type="text"
            maxLength={SUPPORT_REQUEST_SUBJECT_MAX_LENGTH}
            value={form.subject}
            disabled={disabled}
            onChange={(event) => onFieldChange("subject", event.target.value)}
          />
          {fieldErrors.subject ? <p className="pd-form-error">{fieldErrors.subject}</p> : null}
        </div>

        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor="support-request-description">
            {labels.description}
          </label>
          <textarea
            id="support-request-description"
            className="pd-form-input pd-form-textarea"
            rows={6}
            maxLength={SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH}
            value={form.description}
            disabled={disabled}
            onChange={(event) => onFieldChange("description", event.target.value)}
          />
          {fieldErrors.description ? <p className="pd-form-error">{fieldErrors.description}</p> : null}
        </div>
      </section>

      <section className="pd-card pd-card-pad">
        <SupportRequestAttachmentField
          attachmentFile={attachmentFile}
          disabled={disabled}
          error={attachmentError}
          onSelectFile={onSelectAttachment}
          onClearFile={onClearAttachment}
        />
      </section>

      {submitError ? (
        <p className="pd-inline-error" role="alert">{submitError}</p>
      ) : null}

      <div className="pd-support-request-form-actions">
        <button type="button" className="pd-btn pd-btn-soft" disabled={disabled} onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="pd-btn pd-btn-primary" disabled={disabled}>
          {isSubmitting || isUploadingAttachment ? labels.submitting : labels.submit}
        </button>
      </div>
    </form>
  );
}
