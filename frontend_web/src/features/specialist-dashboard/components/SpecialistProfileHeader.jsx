import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistProfileHeader({
  bundle,
  presenceLabel,
  isOnline = false,
  onEdit,
}) {
  const fullName = bundle?.fullName || "Specialist";
  const roleLabel = bundle?.roleLabel || "Specialist";

  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-header-card">
      <div className="pd-specialist-profile-header-body">
        <UserProfileAvatar
          imageUrl={bundle?.profileImageUrl}
          initials={getInitials(fullName, "SP")}
          alt={`${fullName} profile photo`}
          shellClassName="pd-avatar pd-specialist-profile-header-avatar"
          fallbackClassName="pd-avatar pd-specialist-profile-header-avatar"
          className="pd-avatar-photo"
        />

        <div className="pd-specialist-profile-header-copy">
          <h2 className="pd-specialist-profile-header-name">{fullName}</h2>
          <p className="pd-specialist-profile-header-role">{roleLabel}</p>
          <p className="pd-specialist-profile-presence">
            <span
              className={`pd-specialist-profile-presence-dot${isOnline ? " is-online" : ""}`}
              aria-hidden="true"
            />
            {presenceLabel || "Offline"}
          </p>
        </div>

        <div className="pd-specialist-profile-header-actions">
          <button type="button" className="pd-btn pd-btn-primary" onClick={onEdit}>
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
}
