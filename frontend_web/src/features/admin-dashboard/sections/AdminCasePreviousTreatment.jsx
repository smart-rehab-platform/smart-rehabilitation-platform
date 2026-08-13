export function AdminCasePreviousTreatment({ detail }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Previous diagnosis and treatment">
      <h2 className="pd-admin-case-request-section-title">Previous Diagnosis &amp; Treatment</h2>
      <dl className="pd-admin-case-request-fields is-stack">
        <div>
          <dt>Previous diagnosis</dt>
          <dd>{detail.hasPreviousDiagnosisLabel}</dd>
        </div>
        {detail.hasPreviousDiagnosis && detail.previousDiagnosisDetails ? (
          <div>
            <dt>Diagnosis details</dt>
            <dd>{detail.previousDiagnosisDetails}</dd>
          </div>
        ) : null}
        <div>
          <dt>Currently receiving treatment</dt>
          <dd>{detail.isCurrentlyReceivingTreatmentLabel}</dd>
        </div>
        {detail.isCurrentlyReceivingTreatment && detail.currentTreatmentDetails ? (
          <div>
            <dt>Treatment details</dt>
            <dd>{detail.currentTreatmentDetails}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
