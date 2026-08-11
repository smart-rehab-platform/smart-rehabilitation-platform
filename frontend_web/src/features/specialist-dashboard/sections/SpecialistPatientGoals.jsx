import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";

export function SpecialistPatientGoals({ goals, onManageGoals, hasActivePlan }) {
  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-goals">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">Goals</h2>
        {hasActivePlan ? (
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onManageGoals}>
            Manage Goals
          </button>
        ) : null}
      </div>

      {goals.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">No goals defined for this patient yet.</p>
        </div>
      ) : (
        <div className="pd-specialist-patient-stack">
          {goals.map((goal) => (
            <div key={goal.id} className="pd-card pd-card-pad">
              <div className="pd-specialist-goal-head">
                <strong>{goal.title}</strong>
                <span className="pd-section-sub">{goal.termLabel}</span>
              </div>
              {goal.description ? <p className="pd-section-sub">{goal.description}</p> : null}
              <ProgressBar label="Completion" percent={goal.completionPercent} tone="cyan" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
