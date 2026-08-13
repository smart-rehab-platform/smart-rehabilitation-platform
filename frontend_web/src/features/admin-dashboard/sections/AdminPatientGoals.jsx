import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function AdminPatientGoals({ goals }) {
  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label="Goals">
      <h2 className="pd-admin-patient-section-title">Goals</h2>

      {goals.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">No goals.</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {goals.map((goal) => (
            <li key={goal.id} className="pd-card pd-card-pad pd-admin-patient-goal-card">
              <div className="pd-admin-patient-goal-head">
                <strong>{goal.title}</strong>
                <div className="pd-admin-patient-goal-badges">
                  {goal.isAchieved ? (
                    <StatusBadge label="Achieved" tone="success" />
                  ) : null}
                  <span className="pd-admin-patient-goal-term">{goal.termLabel}</span>
                </div>
              </div>
              <ProgressBar
                label="Completion"
                percent={goal.completionPercent}
                tone="cyan"
                hideMeta={false}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
