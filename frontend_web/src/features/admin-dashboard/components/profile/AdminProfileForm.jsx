import { AdminProfileAvatar } from "./AdminProfileAvatar";



export function AdminProfileForm({

  profile,

  labels,

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

        <h2 className="pd-profile-section-title">{labels.profilePhoto}</h2>

        <AdminProfileAvatar

          profile={profile}

          labels={labels}

          previewUrl={avatarPreviewUrl}

          onSelectFile={onAvatarSelect}

          disabled={isSaving}

          error={avatarError}

        />

      </section>



      <section className="pd-card pd-card-pad pd-profile-form-section">

        <h2 className="pd-profile-section-title">{labels.personalInfo}</h2>

        <div className="pd-profile-form-grid">

          <div className="pd-form-field">

            <label className="pd-form-label" htmlFor="admin-profile-full-name">

              {labels.fullName}

            </label>

            <input

              id="admin-profile-full-name"

              className="pd-form-input"

              type="text"

              value={formValues.fullName}

              disabled={isSaving}

              dir="auto"

              onChange={(event) => onFieldChange("fullName", event.target.value)}

              aria-invalid={Boolean(fieldErrors.fullName)}

              aria-describedby={fieldErrors.fullName ? "admin-profile-full-name-error" : undefined}

            />

            {fieldErrors.fullName ? (

              <p id="admin-profile-full-name-error" className="pd-form-error">{fieldErrors.fullName}</p>

            ) : null}

          </div>



          <div className="pd-form-field">

            <label className="pd-form-label" htmlFor="admin-profile-phone">

              {labels.phoneNumber}

            </label>

            <input

              id="admin-profile-phone"

              className="pd-form-input"

              type="tel"

              value={formValues.phone}

              disabled={isSaving}

              dir="ltr"

              onChange={(event) => onFieldChange("phone", event.target.value)}

            />

          </div>



          <div className="pd-form-field pd-profile-form-span">

            <label className="pd-form-label" htmlFor="admin-profile-email">

              {labels.email}

            </label>

            <input

              id="admin-profile-email"

              className="pd-form-input"

              type="email"

              value={profile?.email ?? ""}

              disabled

              readOnly

              dir="ltr"

              aria-readonly="true"

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

          {labels.cancel}

        </button>

        <button

          type="submit"

          className="pd-btn pd-btn-primary"

          disabled={isSaving || !isDirty}

        >

          {isSaving ? labels.saving : labels.saveChanges}

        </button>

      </div>

    </form>

  );

}
