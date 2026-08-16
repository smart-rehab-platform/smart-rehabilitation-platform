import { useLocale } from "../../../context/useLocale";

export function SpecialistCaseRequestChildInfo({ detail }) {
  const { t } = useLocale();

  if (!detail) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">{t("specialist.caseRequests.childInformation")}</h2>
      <div className="pd-specialist-case-info-grid">
        <div>
          <span className="pd-form-label">{t("specialist.caseRequests.fields.dateOfBirth")}</span>
          <strong>{detail.dateOfBirthLabel}</strong>
        </div>
        <div>
          <span className="pd-form-label">{t("specialist.caseRequests.fields.age")}</span>
          <strong>{detail.ageLabel}</strong>
        </div>
        <div>
          <span className="pd-form-label">{t("specialist.caseRequests.fields.gender")}</span>
          <strong>{detail.genderLabel}</strong>
        </div>
      </div>
    </section>
  );
}
