export function AdminCaseInformation({ detail, labels }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label={labels.caseInformation}>
      <h2 className="pd-admin-case-request-section-title">{labels.caseInformation}</h2>
      <dl className="pd-admin-case-request-fields is-stack">
        <div>
          <dt>{labels.fields.caseDescription}</dt>
          <dd dir="auto">{detail.caseDescription}</dd>
        </div>
        <div>
          <dt>{labels.fields.observedDifficulties}</dt>
          <dd dir="auto">{detail.observedDifficulties}</dd>
        </div>
        <div>
          <dt>{labels.fields.preferredContactPeriod}</dt>
          <dd>{detail.preferredContactPeriodLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
