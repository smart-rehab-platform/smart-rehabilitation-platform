import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminCaseAssignedSpecialist({ assignedSpecialist, labels }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label={labels.assignedSpecialist}>
      <h2 className="pd-admin-case-request-section-title">{labels.assignedSpecialist}</h2>

      {!assignedSpecialist ? (
        <p className="pd-admin-case-request-empty-copy">{labels.noSpecialistAssigned}</p>
      ) : (
        <div className="pd-admin-case-assigned-specialist">
          <UserProfileAvatar
            imageUrl={assignedSpecialist.profileImageUrl}
            initials={assignedSpecialist.initials}
            alt=""
            sizeClassName="pd-admin-case-specialist-avatar"
            shellClassName="pd-admin-case-specialist-avatar-shell"
            fallbackClassName="pd-admin-case-specialist-avatar-fallback"
            className="pd-avatar-photo"
          />
          <div className="pd-admin-case-assigned-specialist-copy">
            <strong dir="auto">{assignedSpecialist.fullName}</strong>
            {assignedSpecialist.specialization ? (
              <span dir="auto">{assignedSpecialist.specialization}</span>
            ) : null}
            {assignedSpecialist.email ? (
              <span dir="auto">{assignedSpecialist.email}</span>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
