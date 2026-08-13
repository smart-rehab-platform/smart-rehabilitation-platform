import { Link2Off } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminPatientAssignmentsParentsList({
  linkedParents,
  isLoading,
  hasSelectedPatient,
  relationshipsError,
  isUnlinking,
  onRetry,
  onUnlink,
}) {
  return (
    <section className="pd-admin-assignments-list-section" aria-label="Linked parents">
      <h2 className="pd-admin-assignments-section-title">Linked Parents</h2>

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
          <p className="pd-admin-assignments-empty-copy">Loading linked parents...</p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && !hasSelectedPatient ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">Select a patient to manage assignments.</p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && hasSelectedPatient && linkedParents.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">
            No parents are currently linked to this patient.
          </p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && linkedParents.length > 0 ? (
        <ul className="pd-admin-assignments-item-list">
          {linkedParents.map((link) => (
            <li key={link.parentId} className="pd-card pd-card-pad pd-admin-assignments-item-row">
              <UserProfileAvatar
                imageUrl={null}
                initials={link.initials}
                alt=""
                sizeClassName="pd-admin-assignments-user-avatar"
                shellClassName="pd-admin-assignments-user-avatar-shell pd-admin-assignments-user-avatar-shell--parent"
                fallbackClassName="pd-admin-assignments-user-avatar-fallback pd-admin-assignments-user-avatar-fallback--parent"
              />
              <div className="pd-admin-assignments-item-copy">
                <strong>{link.parentName}</strong>
                <span>
                  {link.relationshipLabel}
                  {link.isPrimaryContact ? " · Primary contact" : ""}
                  {link.email ? ` · ${link.email}` : ""}
                </span>
              </div>
              <button
                type="button"
                className="pd-admin-assignments-unlink-btn"
                aria-label={`Unlink ${link.parentName}`}
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
