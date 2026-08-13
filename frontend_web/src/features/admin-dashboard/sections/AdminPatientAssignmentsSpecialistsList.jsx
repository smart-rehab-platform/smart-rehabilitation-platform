import { Link2Off } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminPatientAssignmentsSpecialistsList({
  assignedSpecialists,
  isLoading,
  hasSelectedPatient,
  relationshipsError,
  isUnlinking,
  onRetry,
  onUnlink,
}) {
  return (
    <section className="pd-admin-assignments-list-section" aria-label="Assigned specialists">
      <h2 className="pd-admin-assignments-section-title">Assigned Specialists</h2>

      {relationshipsError ? (
        <div className="pd-card pd-card-pad pd-admin-assignments-inline-error">
          <p className="pd-inline-error">{relationshipsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {!relationshipsError && isLoading ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">Loading assigned specialists...</p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && !hasSelectedPatient ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">Select a patient to manage assignments.</p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && hasSelectedPatient && assignedSpecialists.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">
            No specialists are currently assigned to this patient.
          </p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && assignedSpecialists.length > 0 ? (
        <ul className="pd-admin-assignments-item-list">
          {assignedSpecialists.map((link) => (
            <li key={link.specialistId} className="pd-card pd-card-pad pd-admin-assignments-item-row">
              <UserProfileAvatar
                imageUrl={null}
                initials={link.initials}
                alt=""
                sizeClassName="pd-admin-assignments-user-avatar"
                shellClassName="pd-admin-assignments-user-avatar-shell pd-admin-assignments-user-avatar-shell--specialist"
                fallbackClassName="pd-admin-assignments-user-avatar-fallback pd-admin-assignments-user-avatar-fallback--specialist"
              />
              <div className="pd-admin-assignments-item-copy">
                <strong>{link.specialistName}</strong>
                <span>
                  {link.isPrimary ? "Primary specialist" : "Specialist"}
                  {link.email ? ` · ${link.email}` : ""}
                </span>
              </div>
              <button
                type="button"
                className="pd-admin-assignments-unlink-btn"
                aria-label={`Unlink ${link.specialistName}`}
                onClick={() => onUnlink(link)}
                disabled={isUnlinking}
              >
                <Link2Off size={18} strokeWidth={2.1} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
