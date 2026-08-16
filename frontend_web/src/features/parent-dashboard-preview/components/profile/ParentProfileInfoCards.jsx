import { useLocale } from "../../../../context/useLocale.js";
import { formatOptionalProfileValue } from "../../utils/parentProfileUtils";

function InfoRow({ label, value, required = false, multiline = false, t }) {
  const displayValue = required
    ? (value || "")
    : formatOptionalProfileValue(value, t);

  return (
    <div className="pd-profile-info-row">
      <span className="pd-profile-info-label">{label}</span>
      <p className={`pd-profile-info-value${multiline ? " is-multiline" : ""}`} dir={multiline ? "auto" : undefined}>
        {displayValue}
      </p>
    </div>
  );
}

export function ParentPersonalInfo({ profile }) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-profile-info-card">
      <h2 className="pd-profile-section-title">{t("parent.profile.personalInfo")}</h2>
      <div className="pd-profile-info-list">
        <InfoRow label={t("parent.profile.fullName")} value={profile?.fullName ?? ""} required t={t} />
        <InfoRow label={t("parent.profile.email")} value={profile?.email ?? ""} required t={t} />
        <InfoRow label={t("parent.profile.phone")} value={profile?.phone} t={t} />
        <InfoRow label={t("parent.profile.role")} value={profile?.roleLabel || t("roles.parent")} required t={t} />
      </div>
    </section>
  );
}

export function ParentParentInfo({ profile }) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-profile-info-card">
      <h2 className="pd-profile-section-title">{t("parent.profile.parentInfo")}</h2>
      <div className="pd-profile-info-list">
        <InfoRow label={t("parent.profile.address")} value={profile?.address} multiline t={t} />
        <InfoRow label={t("parent.profile.relationshipNotes")} value={profile?.relationshipNotes} multiline t={t} />
        <InfoRow
          label={t("parent.profile.emailStatus")}
          value={profile?.isEmailVerified ? t("parent.profile.verified") : t("parent.profile.notVerified")}
          required
          t={t}
        />
        <InfoRow label={t("parent.profile.memberSince")} value={profile?.memberSince} t={t} />
      </div>
    </section>
  );
}
