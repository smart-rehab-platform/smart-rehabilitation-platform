import { Copy } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { getInitials } from "../utils/specialistScheduleUtils";

function ContactRow({ label, value, canCopy, onCopy }) {
  return (
    <div className="pd-specialist-case-contact-row">
      <div>
        <span className="pd-form-label">{label}</span>
        <p className="pd-specialist-case-field-value">{value || "Not provided"}</p>
      </div>
      {canCopy ? (
        <button
          type="button"
          className="pd-btn pd-btn-ghost pd-specialist-case-copy-btn"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          <Copy size={16} aria-hidden="true" />
          Copy
        </button>
      ) : null}
    </div>
  );
}

export function SpecialistCaseRequestParentInfo({ detail, onCopyEmail, onCopyPhone }) {
  if (!detail) {
    return null;
  }

  const parent = detail.parent;
  const name = parent?.fullName?.trim() || "Not provided";
  const email = parent?.email?.trim() || "";
  const phone = parent?.phone?.trim() || "";
  const imageUrl = resolveUploadedAssetUrl(parent?.profileImageUrl) || null;

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">Parent Information</h2>
      <div className="pd-specialist-case-parent-head">
        <UserProfileAvatar
          imageUrl={imageUrl}
          initials={getInitials(name, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-case-parent-avatar"
          fallbackClassName="pd-avatar pd-specialist-case-parent-avatar"
          className="pd-avatar-photo"
        />
        <strong>{name}</strong>
      </div>
      <ContactRow
        label="Email"
        value={email}
        canCopy={Boolean(email)}
        onCopy={onCopyEmail}
      />
      <ContactRow
        label="Phone"
        value={phone}
        canCopy={Boolean(phone)}
        onCopy={onCopyPhone}
      />
    </section>
  );
}
