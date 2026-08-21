import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminCaseAssignedSpecialist({ assignedSpecialist, labels }) {
  return (
    <div className="pd-admin-case-care-team-content">
      {!assignedSpecialist ? (
        <p className="pd-admin-case-request-empty-copy">{labels.noSpecialistAssigned}</p>
      ) : (
        <div className="pd-admin-case-assigned-specialist-row">
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
            <strong>
              <bdi dir="auto">{assignedSpecialist.fullName}</bdi>
            </strong>
            {assignedSpecialist.specialization ? (
              <span>
                <bdi dir="auto">{assignedSpecialist.specialization}</bdi>
              </span>
            ) : null}
            {assignedSpecialist.email ? (
              <span>
                <bdi dir="auto">{assignedSpecialist.email}</bdi>
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
