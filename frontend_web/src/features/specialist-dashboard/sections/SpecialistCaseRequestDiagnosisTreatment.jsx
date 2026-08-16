import { useLocale } from "../../../context/useLocale";
import { yesNoLabel } from "../utils/specialistCaseRequestMappers";

function Field({ label, value }) {
  return (
    <div className="pd-specialist-case-field">
      <span className="pd-form-label">{label}</span>
      <p className="pd-specialist-case-field-value" dir="auto">{value}</p>
    </div>
  );
}

export function SpecialistCaseRequestDiagnosisTreatment({ detail }) {
  const { t } = useLocale();

  if (!detail) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">
        {t("specialist.caseRequests.previousDiagnosisTreatment")}
      </h2>
      <Field
        label={t("specialist.caseRequests.fields.previousDiagnosis")}
        value={yesNoLabel(detail.hasPreviousDiagnosis, t)}
      />
      {detail.hasPreviousDiagnosis && detail.previousDiagnosisDetails ? (
        <Field
          label={t("specialist.caseRequests.fields.diagnosisDetails")}
          value={detail.previousDiagnosisDetails}
        />
      ) : null}
      <Field
        label={t("specialist.caseRequests.fields.currentlyReceivingTreatment")}
        value={yesNoLabel(detail.isCurrentlyReceivingTreatment, t)}
      />
      {detail.isCurrentlyReceivingTreatment && detail.currentTreatmentDetails ? (
        <Field
          label={t("specialist.caseRequests.fields.treatmentDetails")}
          value={detail.currentTreatmentDetails}
        />
      ) : null}
    </section>
  );
}
