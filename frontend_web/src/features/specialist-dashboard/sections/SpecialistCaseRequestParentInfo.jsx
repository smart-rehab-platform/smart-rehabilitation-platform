import { Copy } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { getInitials } from "../utils/specialistScheduleUtils";

function ContactRow({ label, value, canCopy, onCopy, notProvidedLabel, copyLabel }) {
  return (
    <div className="pd-specialist-case-contact-row">
      <div>
        <span className="pd-form-label">{label}</span>
        <p className="pd-specialist-case-field-value" dir="auto">{value || notProvidedLabel}</p>
      </div>
      {canCopy ? (
        <button
          type="button"
          className="pd-btn pd-btn-ghost pd-specialist-case-copy-btn"
          onClick={onCopy}
          aria-label={copyLabel}
        >
          <Copy size={16} aria-hidden="true" />
          {copyLabel}
        </button>
      ) : null}
    </div>
  );
}

export function SpecialistCaseRequestParentInfo({ detail, onCopyEmail, onCopyPhone }) {
  const { t } = useLocale();

  if (!detail) {
    return null;
  }

  const parent = detail.parent;
  const notProvided = t("specialist.caseRequests.notProvided");
  const name = parent?.fullName?.trim() || notProvided;
  const email = parent?.email?.trim() || "";
  const phone = parent?.phone?.trim() || "";
  const imageUrl = resolveUploadedAssetUrl(parent?.profileImageUrl) || null;

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">{t("specialist.caseRequests.parentInformation")}</h2>
      <div className="pd-specialist-case-parent-head">
        <UserProfileAvatar
          imageUrl={imageUrl}
          initials={getInitials(name, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-case-parent-avatar"
          fallbackClassName="pd-avatar pd-specialist-case-parent-avatar"
          className="pd-avatar-photo"
        />
        <strong dir="auto">{name}</strong>
      </div>
      <ContactRow
        label={t("specialist.caseRequests.fields.email")}
        value={email}
        canCopy={Boolean(email)}
        onCopy={onCopyEmail}
        notProvidedLabel={notProvided}
        copyLabel={t("specialist.caseRequests.copy")}
      />
      <ContactRow
        label={t("specialist.caseRequests.fields.phone")}
        value={phone}
        canCopy={Boolean(phone)}
        onCopy={onCopyPhone}
        notProvidedLabel={notProvided}
        copyLabel={t("specialist.caseRequests.copy")}
      />
    </section>
  );
}
