import { useLocale } from "../../../../context/useLocale.js";
import { UserProfileAvatar } from "./UserProfileAvatar";

export function ParentProfileAvatar({
  profile,
  previewUrl,
  onSelectFile,
  disabled = false,
  error = null,
}) {
  const { t } = useLocale();
  const displayUrl = previewUrl || profile?.profileImageUrl || null;
  const fullName = profile?.fullName || t("roles.parent");

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
            initials={profile?.initials || "P"}
            alt={t("parent.profile.profilePhotoAlt", { name: fullName })}
            className="pd-avatar-photo pd-profile-avatar-photo"
            fallbackClassName="pd-avatar pd-avatar-lg"
          />
        )}
      </div>

      <div className="pd-profile-avatar-actions">
        <label className="pd-btn pd-btn-soft pd-profile-avatar-upload">
          {t("parent.profile.changePhoto")}
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
        <p className="pd-profile-avatar-hint">{t("parent.profile.avatarHint")}</p>
        {error ? <p className="pd-form-error">{error}</p> : null}
      </div>
    </div>
  );
}
