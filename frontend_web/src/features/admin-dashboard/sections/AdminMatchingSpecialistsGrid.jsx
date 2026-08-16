import { Check } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminMatchingSpecialistsGrid({
  specialists,
  selectedSpecialistId,
  labels,
  onSelectSpecialist,
}) {
  const { specialistsPage } = labels;

  if (specialists.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-section-enter">
        <p className="pd-admin-case-request-empty-copy">{specialistsPage.empty}</p>
      </section>
    );
  }

  return (
    <div className="pd-admin-matching-specialists-grid pd-section-enter">
      {specialists.map((specialist) => {
        const isSelected = specialist.id === selectedSpecialistId;

        return (
          <button
            key={specialist.id}
            type="button"
            className={`pd-card pd-card-pad pd-admin-matching-specialist-card${isSelected ? " is-selected" : ""}`}
            aria-pressed={isSelected}
            onClick={() => onSelectSpecialist(specialist.id)}
          >
            <span className="pd-admin-matching-specialist-check" aria-hidden="true">
              {isSelected ? <Check size={16} strokeWidth={2.4} /> : null}
            </span>

            <div className="pd-admin-matching-specialist-head">
              <UserProfileAvatar
                imageUrl={specialist.profileImageUrl}
                initials={specialist.initials}
                alt=""
                sizeClassName="pd-admin-matching-specialist-avatar"
                shellClassName="pd-admin-matching-specialist-avatar-shell"
                fallbackClassName="pd-admin-matching-specialist-avatar-fallback"
                className="pd-avatar-photo"
              />
              <div>
                <strong dir="auto">{specialist.fullName}</strong>
                <span dir="auto">{specialist.specialization}</span>
              </div>
            </div>

            <div className="pd-admin-matching-specialist-metrics">
              <span>{specialist.yearsLabel}</span>
              <span>{specialist.activeCasesLabel}</span>
              <span>{specialist.currentRequestsLabel}</span>
            </div>

            {specialist.licenseNumber ? (
              <p className="pd-admin-matching-specialist-license">
                {labels.licenseLabel(specialist.licenseNumber)}
              </p>
            ) : null}

            {specialist.bio ? (
              <p className="pd-admin-matching-specialist-bio" dir="auto">{specialist.bio}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
