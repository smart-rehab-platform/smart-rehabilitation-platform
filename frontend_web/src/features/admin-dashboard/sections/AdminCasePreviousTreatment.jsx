export function AdminCasePreviousTreatment({ detail, labels }) {
  return (
    <article className="pd-admin-case-info-card pd-section-enter" aria-label={labels.previousDiagnosisTreatment}>
      <h3 className="pd-admin-case-info-card-title">{labels.previousDiagnosisTreatment}</h3>
      <div className="pd-admin-case-info-stack">
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.previousDiagnosis}</span>
          <span className="pd-admin-case-info-value">{detail.hasPreviousDiagnosisLabel}</span>
        </div>
        {detail.hasPreviousDiagnosis && detail.previousDiagnosisDetails ? (
          <div className="pd-admin-case-info-block">
            <span className="pd-admin-case-info-label">{labels.fields.diagnosisDetails}</span>
            <span className="pd-admin-case-info-value">
              <bdi dir="auto">{detail.previousDiagnosisDetails}</bdi>
            </span>
          </div>
        ) : null}
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.currentlyReceivingTreatment}</span>
          <span className="pd-admin-case-info-value">{detail.isCurrentlyReceivingTreatmentLabel}</span>
        </div>
        {detail.isCurrentlyReceivingTreatment && detail.currentTreatmentDetails ? (
          <div className="pd-admin-case-info-block">
            <span className="pd-admin-case-info-label">{labels.fields.treatmentDetails}</span>
            <span className="pd-admin-case-info-value">
              <bdi dir="auto">{detail.currentTreatmentDetails}</bdi>
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
