import { ParentProfileAvatar } from "./ParentProfileAvatar";

export function ParentProfileForm({
  profile,
  formValues,
  fieldErrors,
  avatarPreviewUrl,
  avatarError,
  isSaving,
  isDirty,
  saveError,
  onFieldChange,
  onAvatarSelect,
  onCancel,
  onSubmit,
}) {
  return (
    <form
      className="pd-profile-edit-layout pd-section-enter"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <section className="pd-card pd-card-pad pd-profile-photo-card">
        <h2 className="pd-profile-section-title">Profile Photo</h2>
        <ParentProfileAvatar
          profile={profile}
          previewUrl={avatarPreviewUrl}
          onSelectFile={onAvatarSelect}
          disabled={isSaving}
          error={avatarError}
        />
      </section>

      <section className="pd-card pd-card-pad pd-profile-form-section">
        <h2 className="pd-profile-section-title">Personal Information</h2>
        <div className="pd-profile-form-grid">
          <div className="pd-form-field">
            <label className="pd-form-label" htmlFor="pd-profile-full-name">
              Full name
            </label>
            <input
              id="pd-profile-full-name"
              className="pd-form-input"
              type="text"
              value={formValues.fullName}
              disabled={isSaving}
              onChange={(event) => onFieldChange("fullName", event.target.value)}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? "pd-profile-full-name-error" : undefined}
            />
            {fieldErrors.fullName ? (
              <p id="pd-profile-full-name-error" className="pd-form-error">{fieldErrors.fullName}</p>
            ) : null}
          </div>

          <div className="pd-form-field">
            <label className="pd-form-label" htmlFor="pd-profile-phone">
              Phone number
            </label>
            <input
              id="pd-profile-phone"
              className="pd-form-input"
              type="tel"
              value={formValues.phone}
              disabled={isSaving}
              onChange={(event) => onFieldChange("phone", event.target.value)}
            />
          </div>

          <div className="pd-form-field pd-profile-form-span">
            <label className="pd-form-label" htmlFor="pd-profile-address">
              Address
            </label>
            <textarea
              id="pd-profile-address"
              className="pd-form-input pd-form-textarea"
              rows={3}
              value={formValues.address}
              disabled={isSaving}
              onChange={(event) => onFieldChange("address", event.target.value)}
            />
          </div>

          <div className="pd-form-field pd-profile-form-span">
            <label className="pd-form-label" htmlFor="pd-profile-relationship-notes">
              Relationship notes
            </label>
            <textarea
              id="pd-profile-relationship-notes"
              className="pd-form-input pd-form-textarea"
              rows={4}
              value={formValues.relationshipNotes}
              disabled={isSaving}
              onChange={(event) => onFieldChange("relationshipNotes", event.target.value)}
            />
          </div>
        </div>
      </section>

      {saveError ? (
        <p className="pd-inline-error pd-profile-form-error" role="alert">{saveError}</p>
      ) : null}

      <div className="pd-profile-form-actions">
        <button
          type="button"
          className="pd-btn pd-btn-soft"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="pd-btn pd-btn-primary"
          disabled={isSaving || !isDirty}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
