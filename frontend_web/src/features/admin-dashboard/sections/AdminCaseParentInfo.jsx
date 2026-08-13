import { Copy } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminCaseParentInfo({ parent, onCopyEmail, onCopyPhone }) {
  if (!parent) {
    return (
      <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Parent information">
        <h2 className="pd-admin-case-request-section-title">Parent Information</h2>
        <p className="pd-admin-case-request-empty-copy">Not provided</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Parent information">
      <h2 className="pd-admin-case-request-section-title">Parent Information</h2>

      <div className="pd-admin-case-parent-head">
        <UserProfileAvatar
          imageUrl={parent.profileImageUrl}
          initials={parent.initials}
          alt=""
          sizeClassName="pd-admin-case-parent-avatar"
          shellClassName="pd-admin-case-parent-avatar-shell"
          fallbackClassName="pd-admin-case-parent-avatar-fallback"
          className="pd-avatar-photo"
        />
        <strong>{parent.fullName}</strong>
      </div>

      <dl className="pd-admin-case-request-fields is-stack">
        <div className="pd-admin-case-parent-contact-row">
          <div>
            <dt>Email</dt>
            <dd>{parent.email || "Not provided"}</dd>
          </div>
          {parent.email ? (
            <button
              type="button"
              className="pd-admin-case-copy-btn"
              aria-label="Copy email"
              onClick={() => onCopyEmail?.(parent.email)}
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="pd-admin-case-parent-contact-row">
          <div>
            <dt>Phone</dt>
            <dd>{parent.phone || "Not provided"}</dd>
          </div>
          {parent.phone ? (
            <button
              type="button"
              className="pd-admin-case-copy-btn"
              aria-label="Copy phone"
              onClick={() => onCopyPhone?.(parent.phone)}
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </dl>
    </section>
  );
}
