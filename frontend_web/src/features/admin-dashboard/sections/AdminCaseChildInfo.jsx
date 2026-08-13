export function AdminCaseChildInfo({ detail }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Child information">
      <h2 className="pd-admin-case-request-section-title">Child Information</h2>
      <dl className="pd-admin-case-request-fields">
        <div>
          <dt>Date of Birth</dt>
          <dd>{detail.dateOfBirthLabel}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{detail.ageLabel}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{detail.genderLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
