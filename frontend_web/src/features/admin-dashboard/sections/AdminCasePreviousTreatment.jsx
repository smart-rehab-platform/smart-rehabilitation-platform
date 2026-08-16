export function AdminCasePreviousTreatment({ detail, labels }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label={labels.previousDiagnosisTreatment}>
      <h2 className="pd-admin-case-request-section-title">{labels.previousDiagnosisTreatment}</h2>
      <dl className="pd-admin-case-request-fields is-stack">
        <div>
          <dt>{labels.fields.previousDiagnosis}</dt>
          <dd>{detail.hasPreviousDiagnosisLabel}</dd>
        </div>
        {detail.hasPreviousDiagnosis && detail.previousDiagnosisDetails ? (
          <div>
            <dt>{labels.fields.diagnosisDetails}</dt>
            <dd dir="auto">{detail.previousDiagnosisDetails}</dd>
          </div>
        ) : null}
        <div>
          <dt>{labels.fields.currentlyReceivingTreatment}</dt>
          <dd>{detail.isCurrentlyReceivingTreatmentLabel}</dd>
        </div>
        {detail.isCurrentlyReceivingTreatment && detail.currentTreatmentDetails ? (
          <div>
            <dt>{labels.fields.treatmentDetails}</dt>
            <dd dir="auto">{detail.currentTreatmentDetails}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
