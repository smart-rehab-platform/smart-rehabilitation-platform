import { formatOptionalProfileValue } from "../../utils/parentProfileUtils";

function InfoRow({ label, value, required = false, multiline = false }) {
  const displayValue = required
    ? (value || "")
    : formatOptionalProfileValue(value);

  return (
    <div className="pd-profile-info-row">
      <span className="pd-profile-info-label">{label}</span>
      <p className={`pd-profile-info-value${multiline ? " is-multiline" : ""}`}>
        {displayValue}
      </p>
    </div>
  );
}

export function ParentPersonalInfo({ profile }) {
  return (
    <section className="pd-card pd-card-pad pd-profile-info-card">
      <h2 className="pd-profile-section-title">Personal Information</h2>
      <div className="pd-profile-info-list">
        <InfoRow label="Full Name" value={profile?.fullName ?? ""} required />
        <InfoRow label="Email" value={profile?.email ?? ""} required />
        <InfoRow label="Phone" value={profile?.phone} />
        <InfoRow label="Role" value={profile?.roleLabel || "Parent"} required />
      </div>
    </section>
  );
}

export function ParentParentInfo({ profile }) {
  return (
    <section className="pd-card pd-card-pad pd-profile-info-card">
      <h2 className="pd-profile-section-title">Parent Information</h2>
      <div className="pd-profile-info-list">
        <InfoRow label="Address" value={profile?.address} multiline />
        <InfoRow label="Relationship Notes" value={profile?.relationshipNotes} multiline />
        <InfoRow
          label="Email Status"
          value={profile?.isEmailVerified ? "Verified" : "Not verified"}
          required
        />
        <InfoRow label="Member Since" value={profile?.memberSince} />
      </div>
    </section>
  );
}
