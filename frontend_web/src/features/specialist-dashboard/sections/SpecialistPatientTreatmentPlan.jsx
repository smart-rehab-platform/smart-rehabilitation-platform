import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function SpecialistPatientTreatmentPlan({ treatmentPlan, onCreatePlan, onEditPlan }) {
  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-treatment-plan">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">Treatment Plan</h2>
        {treatmentPlan ? (
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onEditPlan}>
            Edit Treatment Plan
          </button>
        ) : (
          <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={onCreatePlan}>
            Create Treatment Plan
          </button>
        )}
      </div>

      {!treatmentPlan ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">No treatment plan yet.</p>
        </div>
      ) : (
        <div className="pd-card pd-card-pad">
          <div className="pd-specialist-plan-head">
            <strong>{treatmentPlan.title}</strong>
            <StatusBadge label={treatmentPlan.statusLabel} tone={treatmentPlan.statusTone} />
          </div>
          <p className="pd-section-sub">
            {treatmentPlan.startDateLabel ? `Start: ${treatmentPlan.startDateLabel}` : null}
            {treatmentPlan.startDateLabel && treatmentPlan.endDateLabel ? " · " : null}
            {treatmentPlan.endDateLabel ? `End: ${treatmentPlan.endDateLabel}` : null}
          </p>
        </div>
      )}
    </section>
  );
}
