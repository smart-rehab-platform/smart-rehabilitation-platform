import { Copy } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminCaseParentInfo({ parent, labels, onCopyEmail, onCopyPhone }) {
  if (!parent) {
    return (
      <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label={labels.parentInformation}>
        <h2 className="pd-admin-case-request-section-title">{labels.parentInformation}</h2>
        <p className="pd-admin-case-request-empty-copy">{labels.notProvided}</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label={labels.parentInformation}>
      <h2 className="pd-admin-case-request-section-title">{labels.parentInformation}</h2>

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
        <strong dir="auto">{parent.fullName}</strong>
      </div>

      <dl className="pd-admin-case-request-fields is-stack">
        <div className="pd-admin-case-parent-contact-row">
          <div>
            <dt>{labels.fields.email}</dt>
            <dd dir="auto">{parent.email || labels.notProvided}</dd>
          </div>
          {parent.email ? (
            <button
              type="button"
              className="pd-admin-case-copy-btn"
              aria-label={labels.copyEmailAria}
              onClick={() => onCopyEmail?.(parent.email)}
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="pd-admin-case-parent-contact-row">
          <div>
            <dt>{labels.fields.phone}</dt>
            <dd dir="auto">{parent.phone || labels.notProvided}</dd>
          </div>
          {parent.phone ? (
            <button
              type="button"
              className="pd-admin-case-copy-btn"
              aria-label={labels.copyPhoneAria}
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
