export function SpecialistCaseRequestChildInfo({ detail }) {
  if (!detail) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">Child Information</h2>
      <div className="pd-specialist-case-info-grid">
        <div>
          <span className="pd-form-label">Date of birth</span>
          <strong>{detail.dateOfBirthLabel}</strong>
        </div>
        <div>
          <span className="pd-form-label">Age</span>
          <strong>{detail.ageLabel}</strong>
        </div>
        <div>
          <span className="pd-form-label">Gender</span>
          <strong>{detail.genderLabel}</strong>
        </div>
      </div>
    </section>
  );
}
