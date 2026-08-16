import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { SpecialistProfilePhotoField } from "./SpecialistProfilePhotoField";
import { getSpecialistProfilePageLabels } from "../utils/specialistProfileLocalization.js";

function fieldClassName(base, hasError) {
  return `${base}${hasError ? " has-error" : ""}`;
}

export function SpecialistProfileForm({
  profile,
  formValues,
  fieldErrors,
  avatarPreviewUrl,
  avatarError,
  isSaving,
  saveError,
  onFieldChange,
  onAvatarSelect,
  onCancel,
  onSubmit,
}) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistProfilePageLabels(t), [t]);

  return (
    <form
      className="pd-specialist-profile-edit-layout"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <SpecialistProfilePhotoField
        fullName={formValues.fullName || profile?.fullName}
        imageUrl={profile?.profileImageUrl}
        previewUrl={avatarPreviewUrl}
        disabled={isSaving}
        onSelectFile={onAvatarSelect}
      />
      {avatarError ? <p className="pd-form-error pd-specialist-profile-form-error">{avatarError}</p> : null}

      <section className="pd-card pd-card-pad pd-specialist-profile-form-section">
        <h2 className="pd-specialist-profile-section-title">{pageLabels.personalInfo}</h2>
        <div className="pd-specialist-profile-form-grid">
          <div className="pd-form-field">
            <label className="pd-form-label" htmlFor="specialist-profile-full-name">
              {pageLabels.fullName}
            </label>
            <input
              id="specialist-profile-full-name"
              className={fieldClassName("pd-form-input", fieldErrors.fullName)}
              type="text"
              value={formValues.fullName}
              disabled={isSaving}
              onChange={(event) => onFieldChange("fullName", event.target.value)}
              aria-invalid={Boolean(fieldErrors.fullName)}
              dir="auto"
            />
            {fieldErrors.fullName ? (
              <p className="pd-form-error">{fieldErrors.fullName}</p>
            ) : null}
          </div>

          <div className="pd-form-field">
            <label className="pd-form-label" htmlFor="specialist-profile-phone">
              {pageLabels.phone}
            </label>
            <input
              id="specialist-profile-phone"
              className="pd-form-input"
              type="tel"
              value={formValues.phone}
              disabled={isSaving}
              onChange={(event) => onFieldChange("phone", event.target.value)}
              dir="auto"
            />
          </div>
        </div>
      </section>

      <section className="pd-card pd-card-pad pd-specialist-profile-form-section">
        <h2 className="pd-specialist-profile-section-title">{pageLabels.professionalInfo}</h2>
        <div className="pd-specialist-profile-form-grid">
          <div className="pd-form-field">
            <label className="pd-form-label" htmlFor="specialist-profile-specialization">
              {pageLabels.specialization}
            </label>
            <input
              id="specialist-profile-specialization"
              className="pd-form-input"
              type="text"
              value={formValues.specialization}
              disabled={isSaving}
              onChange={(event) => onFieldChange("specialization", event.target.value)}
              dir="auto"
            />
          </div>

          <div className="pd-form-field">
            <label className="pd-form-label" htmlFor="specialist-profile-license">
              {pageLabels.licenseNumber}
            </label>
            <input
              id="specialist-profile-license"
              className="pd-form-input"
              type="text"
              value={formValues.licenseNumber}
              disabled={isSaving}
              onChange={(event) => onFieldChange("licenseNumber", event.target.value)}
              dir="auto"
            />
          </div>

          <div className="pd-form-field pd-specialist-profile-form-span-half">
            <label className="pd-form-label" htmlFor="specialist-profile-years">
              {pageLabels.yearsOfExperience}
            </label>
            <input
              id="specialist-profile-years"
              className={fieldClassName("pd-form-input", fieldErrors.yearsOfExperience)}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={formValues.yearsOfExperience}
              disabled={isSaving}
              onChange={(event) => onFieldChange("yearsOfExperience", event.target.value)}
              aria-invalid={Boolean(fieldErrors.yearsOfExperience)}
            />
            {fieldErrors.yearsOfExperience ? (
              <p className="pd-form-error">{fieldErrors.yearsOfExperience}</p>
            ) : null}
          </div>

          <div className="pd-form-field pd-specialist-profile-form-span">
            <label className="pd-form-label" htmlFor="specialist-profile-bio">
              {pageLabels.bio}
            </label>
            <textarea
              id="specialist-profile-bio"
              className="pd-form-input pd-form-textarea"
              rows={5}
              value={formValues.bio}
              disabled={isSaving}
              onChange={(event) => onFieldChange("bio", event.target.value)}
              dir="auto"
            />
          </div>
        </div>
      </section>

      {saveError ? (
        <p className="pd-inline-error pd-specialist-profile-form-error" role="alert">
          {saveError}
        </p>
      ) : null}

      <div className="pd-specialist-profile-form-actions">
        <button
          type="button"
          className="pd-btn pd-btn-soft"
          disabled={isSaving}
          onClick={onCancel}
        >
          {pageLabels.cancel}
        </button>
        <button type="submit" className="pd-btn pd-btn-primary" disabled={isSaving}>
          {isSaving ? pageLabels.saving : pageLabels.saveChanges}
        </button>
      </div>
    </form>
  );
}
