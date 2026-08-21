export function AdminCaseChildInfo({ detail, labels }) {
  return (
    <article className="pd-admin-case-info-card pd-section-enter" aria-label={labels.childInformation}>
      <h3 className="pd-admin-case-info-card-title">{labels.childInformation}</h3>
      <div className="pd-admin-case-info-grid is-compact">
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.dateOfBirth}</span>
          <span className="pd-admin-case-info-value">{detail.dateOfBirthLabel}</span>
        </div>
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.age}</span>
          <span className="pd-admin-case-info-value">{detail.ageLabel}</span>
        </div>
        <div className="pd-admin-case-info-block">
          <span className="pd-admin-case-info-label">{labels.fields.gender}</span>
          <span className="pd-admin-case-info-value">{detail.genderLabel}</span>
        </div>
      </div>
    </article>
  );
}
