import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { getAdminPatientDetailsLabels } from "../utils/adminPatientsLocalization.js";

function resolvePlanTone(tone) {
  if (tone === "success") {
    return "success";
  }
  if (tone === "gray") {
    return "gray";
  }
  return "blue";
}

export function AdminPatientTreatmentPlan({ treatmentPlan }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);

  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label={labels.treatmentPlan}>
      <h2 className="pd-admin-patient-section-title">{labels.treatmentPlan}</h2>

      {!treatmentPlan ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">{labels.noTreatmentPlan}</p>
        </div>
      ) : (
        <div className="pd-card pd-card-pad">
          <div className="pd-admin-patient-plan-head">
            <strong>{treatmentPlan.title}</strong>
            <StatusBadge
              label={treatmentPlan.statusLabel}
              tone={resolvePlanTone(treatmentPlan.statusTone)}
            />
          </div>
          <dl className="pd-admin-patient-plan-dates">
            <div>
              <dt>{labels.startDate}</dt>
              <dd>{treatmentPlan.startDateLabel || labels.emptyDisplay}</dd>
            </div>
            <div>
              <dt>{labels.endDate}</dt>
              <dd>{treatmentPlan.endDateLabel || labels.emptyDisplay}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
