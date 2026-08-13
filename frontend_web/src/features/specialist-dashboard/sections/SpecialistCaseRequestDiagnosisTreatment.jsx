import { yesNoLabel } from "../utils/specialistCaseRequestMappers";

function Field({ label, value }) {
  return (
    <div className="pd-specialist-case-field">
      <span className="pd-form-label">{label}</span>
      <p className="pd-specialist-case-field-value">{value}</p>
    </div>
  );
}

export function SpecialistCaseRequestDiagnosisTreatment({ detail }) {
  if (!detail) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">Previous Diagnosis &amp; Treatment</h2>
      <Field label="Previous diagnosis" value={yesNoLabel(detail.hasPreviousDiagnosis)} />
      {detail.hasPreviousDiagnosis && detail.previousDiagnosisDetails ? (
        <Field label="Diagnosis details" value={detail.previousDiagnosisDetails} />
      ) : null}
      <Field
        label="Currently receiving treatment"
        value={yesNoLabel(detail.isCurrentlyReceivingTreatment)}
      />
      {detail.isCurrentlyReceivingTreatment && detail.currentTreatmentDetails ? (
        <Field label="Treatment details" value={detail.currentTreatmentDetails} />
      ) : null}
    </section>
  );
}
