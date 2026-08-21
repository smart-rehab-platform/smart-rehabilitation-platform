import { Copy } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminCaseParentInfo({ parent, labels, onCopyEmail, onCopyPhone }) {
  if (!parent) {
    return (
      <article className="pd-admin-case-info-card pd-section-enter" aria-label={labels.parentInformation}>
        <h3 className="pd-admin-case-info-card-title">{labels.parentInformation}</h3>
        <p className="pd-admin-case-request-empty-copy">{labels.notProvided}</p>
      </article>
    );
  }

  return (
    <article className="pd-admin-case-info-card pd-section-enter" aria-label={labels.parentInformation}>
      <h3 className="pd-admin-case-info-card-title">{labels.parentInformation}</h3>

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
        <div className="pd-admin-case-parent-head-copy">
          <strong>
            <bdi dir="auto">{parent.fullName}</bdi>
          </strong>
        </div>
      </div>

      <div className="pd-admin-case-info-stack">
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.email}</span>
          <div className="pd-admin-case-contact-value-row">
            <span className="pd-admin-case-info-value">
              <bdi dir="auto">{parent.email || labels.notProvided}</bdi>
            </span>
            {parent.email ? (
              <button
                type="button"
                className="pd-admin-case-copy-btn"
                aria-label={labels.copyEmailAria}
                onClick={() => onCopyEmail?.(parent.email)}
              >
                <Copy size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.phone}</span>
          <div className="pd-admin-case-contact-value-row">
            <span className="pd-admin-case-info-value">
              <bdi dir="auto">{parent.phone || labels.notProvided}</bdi>
            </span>
            {parent.phone ? (
              <button
                type="button"
                className="pd-admin-case-copy-btn"
                aria-label={labels.copyPhoneAria}
                onClick={() => onCopyPhone?.(parent.phone)}
              >
                <Copy size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
