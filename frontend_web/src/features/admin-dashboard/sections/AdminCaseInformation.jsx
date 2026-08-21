export function AdminCaseInformation({ detail, labels }) {
  return (
    <article className="pd-admin-case-info-card pd-section-enter" aria-label={labels.caseInformation}>
      <h3 className="pd-admin-case-info-card-title">{labels.caseInformation}</h3>
      <div className="pd-admin-case-info-stack">
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.caseDescription}</span>
          <span className="pd-admin-case-info-value">
            <bdi dir="auto">{detail.caseDescription}</bdi>
          </span>
        </div>
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.observedDifficulties}</span>
          <span className="pd-admin-case-info-value">
            <bdi dir="auto">{detail.observedDifficulties}</bdi>
          </span>
        </div>
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.preferredContactPeriod}</span>
          <span className="pd-admin-case-info-value">{detail.preferredContactPeriodLabel}</span>
        </div>
      </div>
    </article>
  );
}
