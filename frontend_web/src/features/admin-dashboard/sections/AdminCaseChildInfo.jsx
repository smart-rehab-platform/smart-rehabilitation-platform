export function AdminCaseChildInfo({ detail, labels }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label={labels.childInformation}>
      <h2 className="pd-admin-case-request-section-title">{labels.childInformation}</h2>
      <dl className="pd-admin-case-request-fields">
        <div>
          <dt>{labels.fields.dateOfBirth}</dt>
          <dd>{detail.dateOfBirthLabel}</dd>
        </div>
        <div>
          <dt>{labels.fields.age}</dt>
          <dd>{detail.ageLabel}</dd>
        </div>
        <div>
          <dt>{labels.fields.gender}</dt>
          <dd>{detail.genderLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
