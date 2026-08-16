import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildParentComplaintCategoryOptions } from "../../utils/parentComplaintsUtils";
import { ParentComplaintAttachmentField } from "./ParentComplaintAttachmentField";

export function ParentComplaintForm({
  children,
  specialists,
  form,
  formErrors,
  attachmentFile,
  isSubmitting,
  isLoadingSpecialists,
  isUploadingAttachment,
  submitError,
  onFieldChange,
  onSelectAttachment,
  onClearAttachment,
  onSubmit,
  onCancel,
}) {
  const { t } = useLocale();
  const categoryOptions = useMemo(
    () => buildParentComplaintCategoryOptions(t),
    [t],
  );

  const showSpecialistSelect = specialists.length > 1;
  const hasNoSpecialist = form.patientId && !isLoadingSpecialists && specialists.length === 0;
  const selectedSpecialist = specialists.find(
    (item) => item.specialistId === form.specialistId,
  );
  const descriptionLength = form.description.trim().length;
  const isBusy = isSubmitting || isUploadingAttachment;

  return (
    <form
      className="pd-parent-complaint-form pd-card pd-card-pad"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label className="pd-form-field">
        <span>{t("parent.complaints.form.selectChild")}</span>
        <select
          required
          value={form.patientId}
          disabled={isBusy || children.length === 0}
          onChange={(event) => onFieldChange("patientId", event.target.value)}
        >
          <option value="" disabled>{t("parent.common.selectChild")}</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>{child.fullName}</option>
          ))}
        </select>
        {formErrors.patientId ? (
          <p className="pd-form-error" role="alert">{formErrors.patientId}</p>
        ) : null}
      </label>

      <div className="pd-form-field">
        <span>{t("parent.complaints.form.selectSpecialist")}</span>
        {isLoadingSpecialists ? (
          <p className="pd-inline-loading">{t("parent.complaints.form.loadingSpecialist")}</p>
        ) : null}

        {!isLoadingSpecialists && hasNoSpecialist ? (
          <p className="pd-parent-complaint-no-specialist" role="status">
            {t("parent.complaints.form.noSpecialist")}
          </p>
        ) : null}

        {!isLoadingSpecialists && showSpecialistSelect ? (
          <select
            value={form.specialistId}
            disabled={isBusy}
            onChange={(event) => onFieldChange("specialistId", event.target.value)}
          >
            <option value="" disabled>{t("parent.common.selectSpecialist")}</option>
            {specialists.map((specialist) => (
              <option key={specialist.specialistId} value={specialist.specialistId}>
                {specialist.specialistName}
              </option>
            ))}
          </select>
        ) : null}

        {!isLoadingSpecialists && !showSpecialistSelect && selectedSpecialist ? (
          <p className="pd-parent-complaint-specialist-readonly">{selectedSpecialist.specialistName}</p>
        ) : null}

        {formErrors.specialistId ? (
          <p className="pd-form-error" role="alert">{formErrors.specialistId}</p>
        ) : null}
      </div>

      <label className="pd-form-field">
        <span>{t("parent.complaints.form.complaintCategory")}</span>
        <select
          required
          value={form.category}
          disabled={isBusy}
          onChange={(event) => onFieldChange("category", event.target.value)}
        >
          <option value="" disabled>{t("parent.complaints.form.selectCategory")}</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {formErrors.category ? (
          <p className="pd-form-error" role="alert">{formErrors.category}</p>
        ) : null}
      </label>

      <label className="pd-form-field">
        <span>{t("parent.complaints.form.description")}</span>
        <textarea
          required
          rows={6}
          maxLength={1000}
          value={form.description}
          disabled={isBusy}
          placeholder={t("parent.complaints.form.descriptionPlaceholder")}
          onChange={(event) => onFieldChange("description", event.target.value)}
        />
        <span className="pd-parent-complaint-counter">{descriptionLength}/1000</span>
        {formErrors.description ? (
          <p className="pd-form-error" role="alert">{formErrors.description}</p>
        ) : null}
      </label>

      <ParentComplaintAttachmentField
        attachmentFile={attachmentFile}
        disabled={isBusy}
        error={formErrors.attachment}
        onSelectFile={onSelectAttachment}
        onClearFile={onClearAttachment}
      />

      {submitError ? (
        <p className="pd-inline-error" role="alert">{submitError}</p>
      ) : null}

      <div className="pd-parent-complaint-actions">
        <button
          type="button"
          className="pd-btn pd-btn-soft"
          onClick={onCancel}
          disabled={isBusy}
        >
          {t("parent.common.cancel")}
        </button>
        <button
          type="submit"
          className="pd-btn pd-btn-primary"
          disabled={isBusy || hasNoSpecialist}
        >
          {isUploadingAttachment
            ? t("parent.complaints.form.uploadingAttachment")
            : isSubmitting
              ? t("parent.complaints.form.submitting")
              : t("parent.complaints.form.submit")}
        </button>
      </div>
    </form>
  );
}
