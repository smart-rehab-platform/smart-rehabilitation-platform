import { UserProfileAvatar } from "../../../shared-dashboard/components/UserProfileAvatar";



export function AdminProfileAvatar({

  profile,

  labels,

  previewUrl,

  onSelectFile,

  disabled = false,

  error = null,

}) {

  const displayUrl = previewUrl || profile?.profileImageUrl || null;

  const fullName = profile?.fullName || "Admin";



  return (

    <div className="pd-profile-avatar-block">

      <div className="pd-profile-avatar-preview" aria-hidden="true">

        {previewUrl ? (

          <img

            src={previewUrl}

            alt=""

            className="pd-avatar-photo pd-profile-avatar-photo"

          />

        ) : (

          <UserProfileAvatar

            imageUrl={displayUrl}

            initials={profile?.initials || "AD"}

            alt={labels.profilePhotoAlt(fullName)}

            className="pd-avatar-photo pd-profile-avatar-photo"

            fallbackClassName="pd-avatar pd-avatar-lg"

          />

        )}

      </div>



      <div className="pd-profile-avatar-actions">

        <label className="pd-btn pd-btn-soft pd-profile-avatar-upload">

          {labels.changePhoto}

          <input

            type="file"

            accept="image/*"

            className="pd-visually-hidden"

            disabled={disabled}

            onChange={(event) => {

              const file = event.target.files?.[0] ?? null;

              if (file) {

                onSelectFile?.(file);

              }

              event.target.value = "";

            }}

          />

        </label>

        <p className="pd-profile-avatar-hint">{labels.photoHint}</p>

        {error ? <p className="pd-form-error">{error}</p> : null}

      </div>

    </div>

  );

}
