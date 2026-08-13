import { formatOptionalProfileValue } from "../utils/specialistProfileMappers";

function InfoRow({ label, value, required = false, multiline = false }) {
  const displayValue = required
    ? (value || "")
    : formatOptionalProfileValue(value);

  return (
    <div className="pd-specialist-profile-info-row">
      <span className="pd-specialist-profile-info-label">{label}</span>
      <p
        className={`pd-specialist-profile-info-value${multiline ? " is-multiline" : ""}`}
      >
        {displayValue}
      </p>
    </div>
  );
}

export function SpecialistPersonalInfo({ bundle }) {
  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-info-card">
      <h2 className="pd-specialist-profile-section-title">Personal Information</h2>
      <div className="pd-specialist-profile-info-list">
        <InfoRow label="Full Name" value={bundle?.fullName ?? ""} required />
        <InfoRow label="Email" value={bundle?.email ?? ""} required />
        <InfoRow label="Phone" value={bundle?.phone} />
        <InfoRow label="Role" value={bundle?.roleLabel || "Specialist"} required />
      </div>
    </section>
  );
}

export function SpecialistProfessionalInfo({ bundle }) {
  const years =
    bundle?.yearsOfExperience == null ? null : String(bundle.yearsOfExperience);

  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-info-card">
      <h2 className="pd-specialist-profile-section-title">Professional Information</h2>
      <div className="pd-specialist-profile-info-list">
        <InfoRow label="Specialization" value={bundle?.specialization} />
        <InfoRow label="License Number" value={bundle?.licenseNumber} />
        <InfoRow label="Years of Experience" value={years} />
        <InfoRow label="Bio" value={bundle?.bio} multiline />
      </div>
    </section>
  );
}
