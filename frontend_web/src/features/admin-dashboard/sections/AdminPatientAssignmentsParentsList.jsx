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
  labels,
}) {
  return (
    <section className="pd-admin-assignments-list-section" aria-label={labels.linkedParents}>
      <h2 className="pd-admin-assignments-section-title">{labels.linkedParents}</h2>

      {relationshipsError ? (
        <div className="pd-card pd-card-pad pd-admin-assignments-inline-error">
          <p className="pd-inline-error">{relationshipsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            {labels.retry}
          </button>
        </div>
      ) : null}

      {!relationshipsError && isLoading ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">{labels.loadingParents}</p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && !hasSelectedPatient ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">{labels.selectPatientForAssignments}</p>
        </div>
      ) : null}

      {!relationshipsError && !isLoading && hasSelectedPatient && linkedParents.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">
            {labels.noParentsLinked}
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
                  {link.isPrimaryContact ? ` · ${labels.primaryContactBadge}` : ""}
                  {link.email ? ` · ${link.email}` : ""}
                </span>
              </div>
              <button
                type="button"
                className="pd-admin-assignments-unlink-btn"
                aria-label={labels.unlinkParentAria(link.parentName)}
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
