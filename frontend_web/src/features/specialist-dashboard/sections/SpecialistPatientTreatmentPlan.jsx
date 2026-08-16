import { useLocale } from "../../../context/useLocale";

function TreatmentPlanStatusBadge({ label, status }) {
  const normalized = (status || label || "").trim().toLowerCase();
  let toneClass = "pd-specialist-treatment-plan-badge--active";

  if (normalized === "archived") {
    toneClass = "pd-specialist-treatment-plan-badge--archived";
  } else if (normalized === "completed") {
    toneClass = "pd-specialist-treatment-plan-badge--completed";
  }

  return (
    <span className={`pd-specialist-treatment-plan-badge ${toneClass}`} role="status">
      {label}
    </span>
  );
}

function TreatmentPlanMetaRow({ label, value }) {
  return (
    <div className="pd-specialist-treatment-plan-meta-row">
      <span className="pd-specialist-treatment-plan-meta-label">{label}</span>
      <span className="pd-specialist-treatment-plan-meta-value">{value}</span>
    </div>
  );
}

export function SpecialistPatientTreatmentPlan({ treatmentPlan, onCreatePlan, onEditPlan }) {
  const { t } = useLocale();
  const emptyDisplay = t("parent.common.emptyDisplay");

  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-treatment-plan">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">{t("specialist.patientDetails.treatmentPlan")}</h2>
        {treatmentPlan ? (
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onEditPlan}>
            {t("specialist.patientDetails.editTreatmentPlan")}
          </button>
        ) : (
          <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={onCreatePlan}>
            {t("specialist.patientDetails.createTreatmentPlan")}
          </button>
        )}
      </div>

      {!treatmentPlan ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">{t("specialist.patientDetails.noTreatmentPlanYet")}</p>
        </div>
      ) : (
        <div className="pd-card pd-card-pad pd-specialist-treatment-plan-card">
          <div className="pd-specialist-plan-head">
            <strong className="pd-specialist-treatment-plan-title" dir="auto">{treatmentPlan.title}</strong>
            <TreatmentPlanStatusBadge
              label={treatmentPlan.statusLabel}
              status={treatmentPlan.status}
            />
          </div>
          <div className="pd-specialist-treatment-plan-meta">
            <TreatmentPlanMetaRow
              label={t("specialist.patientDetails.startDate")}
              value={treatmentPlan.startDateLabel || emptyDisplay}
            />
            <TreatmentPlanMetaRow
              label={t("specialist.patientDetails.endDate")}
              value={treatmentPlan.endDateLabel || emptyDisplay}
            />
          </div>
        </div>
      )}
    </section>
  );
}
