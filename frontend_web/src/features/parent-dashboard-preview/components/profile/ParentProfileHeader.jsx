import { useLocale } from "../../../../context/useLocale.js";
import { UserProfileAvatar } from "./UserProfileAvatar";

export function ParentProfileHeader({ profile, onEdit }) {
  const { t } = useLocale();
  const fullName = profile?.fullName || t("roles.parent");
  const roleLabel = profile?.roleLabel || t("roles.parent");

  return (
    <section className="pd-card pd-card-pad pd-profile-header-card">
      <div className="pd-profile-header-body">
        <UserProfileAvatar
          imageUrl={profile?.profileImageUrl}
          initials={profile?.initials || "P"}
          alt={t("parent.profile.profilePhotoAlt", { name: fullName })}
          shellClassName="pd-avatar pd-profile-header-avatar"
          fallbackClassName="pd-avatar pd-profile-header-avatar"
          className="pd-avatar-photo"
        />

        <div className="pd-profile-header-copy">
          <h2 className="pd-profile-header-name">{fullName}</h2>
          <p className="pd-profile-header-role">{roleLabel}</p>
          <p className="pd-profile-header-email">{profile?.email || "—"}</p>
        </div>

        <div className="pd-profile-header-actions">
          <button type="button" className="pd-btn pd-btn-primary" onClick={onEdit}>
            {t("parent.profile.editProfile")}
          </button>
        </div>
      </div>
    </section>
  );
}
