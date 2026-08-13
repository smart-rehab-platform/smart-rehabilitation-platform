export function AdminCaseInformation({ detail }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Case information">
      <h2 className="pd-admin-case-request-section-title">Case Information</h2>
      <dl className="pd-admin-case-request-fields is-stack">
        <div>
          <dt>Case description</dt>
          <dd>{detail.caseDescription}</dd>
        </div>
        <div>
          <dt>Observed difficulties</dt>
          <dd>{detail.observedDifficulties}</dd>
        </div>
        <div>
          <dt>Preferred contact period</dt>
          <dd>{detail.preferredContactPeriodLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
