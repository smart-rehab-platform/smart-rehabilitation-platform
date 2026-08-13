import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

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
  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label="Treatment plan">
      <h2 className="pd-admin-patient-section-title">Treatment Plan</h2>

      {!treatmentPlan ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">No treatment plan yet.</p>
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
              <dt>Start date</dt>
              <dd>{treatmentPlan.startDateLabel || "—"}</dd>
            </div>
            <div>
              <dt>End date</dt>
              <dd>{treatmentPlan.endDateLabel || "—"}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
