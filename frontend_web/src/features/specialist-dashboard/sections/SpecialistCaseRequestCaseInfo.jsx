import { useLocale } from "../../../context/useLocale";

function Field({ label, value, notProvidedLabel }) {
  return (
    <div className="pd-specialist-case-field">
      <span className="pd-form-label">{label}</span>
      <p className="pd-specialist-case-field-value" dir="auto">{value || notProvidedLabel}</p>
    </div>
  );
}

export function SpecialistCaseRequestCaseInfo({ detail }) {
  const { t } = useLocale();
  const notProvided = t("specialist.caseRequests.notProvided");

  if (!detail) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">{t("specialist.caseRequests.caseInformation")}</h2>
      <Field
        label={t("specialist.caseRequests.fields.caseDescription")}
        value={detail.caseDescription}
        notProvidedLabel={notProvided}
      />
      <Field
        label={t("specialist.caseRequests.fields.observedDifficulties")}
        value={detail.observedDifficulties}
        notProvidedLabel={notProvided}
      />
      <Field
        label={t("specialist.caseRequests.fields.preferredContactPeriod")}
        value={detail.preferredContactPeriodLabel}
        notProvidedLabel={notProvided}
      />
    </section>
  );
}
