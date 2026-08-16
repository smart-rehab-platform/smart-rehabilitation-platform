import { formatOptionalProfileValue } from "../../utils/adminProfileUtils";



function InfoRow({ label, value, required = false, multiline = false, dir = "auto" }) {

  const displayValue = required

    ? (value || "")

    : formatOptionalProfileValue(value);



  return (

    <div className="pd-profile-info-row">

      <span className="pd-profile-info-label">{label}</span>

      <p className={`pd-profile-info-value${multiline ? " is-multiline" : ""}`} dir={dir}>

        {displayValue}

      </p>

    </div>

  );

}



export function AdminPersonalInfo({ profile, labels }) {

  return (

    <section className="pd-card pd-card-pad pd-profile-info-card">

      <h2 className="pd-profile-section-title">{labels.personalInfo}</h2>

      <div className="pd-profile-info-list">

        <InfoRow label={labels.fullName} value={profile?.fullName ?? ""} required />

        <InfoRow label={labels.email} value={profile?.email ?? ""} required dir="ltr" />

        <InfoRow label={labels.phone} value={profile?.phone} dir="ltr" />

        <InfoRow label={labels.role} value={profile?.roleLabel || labels.role} required />

      </div>

    </section>

  );

}



export function AdminAccountInfo({ profile, labels }) {

  return (

    <section className="pd-card pd-card-pad pd-profile-info-card">

      <h2 className="pd-profile-section-title">{labels.accountInfo}</h2>

      <div className="pd-profile-info-list">

        <InfoRow

          label={labels.emailStatus}

          value={profile?.isEmailVerified ? labels.verified : labels.notVerified}

          required

        />

      </div>

    </section>

  );

}
