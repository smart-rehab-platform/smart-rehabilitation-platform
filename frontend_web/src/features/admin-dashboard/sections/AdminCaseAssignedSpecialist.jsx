import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminCaseAssignedSpecialist({ assignedSpecialist }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Assigned specialist">
      <h2 className="pd-admin-case-request-section-title">Assigned Specialist</h2>

      {!assignedSpecialist ? (
        <p className="pd-admin-case-request-empty-copy">No specialist assigned yet.</p>
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
            <strong>{assignedSpecialist.fullName}</strong>
            {assignedSpecialist.specialization ? (
              <span>{assignedSpecialist.specialization}</span>
            ) : null}
            {assignedSpecialist.email ? (
              <span>{assignedSpecialist.email}</span>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
