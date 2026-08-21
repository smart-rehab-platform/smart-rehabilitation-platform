import { Link2Off } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

function ListPlaceholder({ children }) {
  return (
    <div className="pd-admin-assignments-list-placeholder">
      <p className="pd-admin-assignments-empty-copy">{children}</p>
    </div>
  );
}

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
      <h3 className="pd-admin-assignments-column-title">{labels.linkedParents}</h3>

      {relationshipsError ? (
        <div className="pd-admin-assignments-inline-error">
          <p className="pd-inline-error">{relationshipsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            {labels.retry}
          </button>
        </div>
      ) : null}

      {!relationshipsError && isLoading ? (
        <ListPlaceholder>{labels.loadingParents}</ListPlaceholder>
      ) : null}

      {!relationshipsError && !isLoading && !hasSelectedPatient ? (
        <ListPlaceholder>{labels.selectPatientForAssignments}</ListPlaceholder>
      ) : null}

      {!relationshipsError && !isLoading && hasSelectedPatient && linkedParents.length === 0 ? (
        <ListPlaceholder>{labels.noParentsLinked}</ListPlaceholder>
      ) : null}

      {!relationshipsError && !isLoading && linkedParents.length > 0 ? (
        <ul className="pd-admin-assignments-item-list">
          {linkedParents.map((link) => (
            <li key={link.parentId} className="pd-admin-assignments-item-row">
              <UserProfileAvatar
                imageUrl={null}
                initials={link.initials}
                alt=""
                sizeClassName="pd-admin-assignments-user-avatar"
                shellClassName="pd-admin-assignments-user-avatar-shell pd-admin-assignments-user-avatar-shell--parent"
                fallbackClassName="pd-admin-assignments-user-avatar-fallback pd-admin-assignments-user-avatar-fallback--parent"
              />
              <div className="pd-admin-assignments-item-copy">
                <strong dir="auto">{link.parentName}</strong>
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
                <Link2Off size={16} strokeWidth={2.1} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
