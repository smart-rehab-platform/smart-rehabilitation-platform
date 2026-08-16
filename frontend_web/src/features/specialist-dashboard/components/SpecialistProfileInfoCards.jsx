import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { formatOptionalProfileValue } from "../utils/specialistProfileMappers";
import { getSpecialistProfilePageLabels } from "../utils/specialistProfileLocalization.js";

function InfoRow({ label, value, required = false, multiline = false }) {
  const displayValue = required
    ? (value || "")
    : formatOptionalProfileValue(value);

  return (
    <div className="pd-specialist-profile-info-row">
      <span className="pd-specialist-profile-info-label">{label}</span>
      <p
        className={`pd-specialist-profile-info-value${multiline ? " is-multiline" : ""}`}
        dir={required || multiline ? "auto" : undefined}
      >
        {displayValue}
      </p>
    </div>
  );
}

export function SpecialistPersonalInfo({ bundle }) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistProfilePageLabels(t), [t]);

  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-info-card">
      <h2 className="pd-specialist-profile-section-title">{pageLabels.personalInfo}</h2>
      <div className="pd-specialist-profile-info-list">
        <InfoRow label={pageLabels.fullName} value={bundle?.fullName ?? ""} required />
        <InfoRow label={pageLabels.email} value={bundle?.email ?? ""} required />
        <InfoRow label={pageLabels.phone} value={bundle?.phone} />
        <InfoRow label={pageLabels.role} value={bundle?.roleLabel} required />
      </div>
    </section>
  );
}

export function SpecialistProfessionalInfo({ bundle }) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistProfilePageLabels(t), [t]);
  const years =
    bundle?.yearsOfExperience == null ? null : String(bundle.yearsOfExperience);

  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-info-card">
      <h2 className="pd-specialist-profile-section-title">{pageLabels.professionalInfo}</h2>
      <div className="pd-specialist-profile-info-list">
        <InfoRow label={pageLabels.specialization} value={bundle?.specialization} />
        <InfoRow label={pageLabels.licenseNumber} value={bundle?.licenseNumber} />
        <InfoRow label={pageLabels.yearsOfExperience} value={years} />
        <InfoRow label={pageLabels.bio} value={bundle?.bio} multiline />
      </div>
    </section>
  );
}
