function Field({ label, value }) {
  return (
    <div className="pd-specialist-case-field">
      <span className="pd-form-label">{label}</span>
      <p className="pd-specialist-case-field-value">{value || "Not provided"}</p>
    </div>
  );
}

export function SpecialistCaseRequestCaseInfo({ detail }) {
  if (!detail) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">Case Information</h2>
      <Field label="Case description" value={detail.caseDescription} />
      <Field label="Observed difficulties" value={detail.observedDifficulties} />
      <Field label="Preferred contact period" value={detail.preferredContactPeriodLabel} />
    </section>
  );
}
