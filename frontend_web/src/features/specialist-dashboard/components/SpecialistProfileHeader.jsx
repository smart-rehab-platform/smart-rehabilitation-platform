import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getSpecialistProfilePageLabels } from "../utils/specialistProfileLocalization.js";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistProfileHeader({
  bundle,
  presenceLabel,
  isOnline = false,
  onEdit,
}) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistProfilePageLabels(t), [t]);
  const fullName = bundle?.fullName || "";
  const roleLabel = bundle?.roleLabel || pageLabels.role;

  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-header-card">
      <div className="pd-specialist-profile-header-body">
        <UserProfileAvatar
          imageUrl={bundle?.profileImageUrl}
          initials={getInitials(fullName || pageLabels.title, "SP")}
          alt={pageLabels.profilePhotoAlt(fullName || pageLabels.title)}
          shellClassName="pd-avatar pd-specialist-profile-header-avatar"
          fallbackClassName="pd-avatar pd-specialist-profile-header-avatar"
          className="pd-avatar-photo"
        />

        <div className="pd-specialist-profile-header-copy">
          <h2 className="pd-specialist-profile-header-name" dir="auto">{fullName}</h2>
          <p className="pd-specialist-profile-header-role">{roleLabel}</p>
          <p className="pd-specialist-profile-presence">
            <span
              className={`pd-specialist-profile-presence-dot${isOnline ? " is-online" : ""}`}
              aria-hidden="true"
            />
            {presenceLabel || t("specialist.messages.presence.offline")}
          </p>
        </div>

        <div className="pd-specialist-profile-header-actions">
          <button type="button" className="pd-btn pd-btn-primary" onClick={onEdit}>
            {pageLabels.editProfile}
          </button>
        </div>
      </div>
    </section>
  );
}
