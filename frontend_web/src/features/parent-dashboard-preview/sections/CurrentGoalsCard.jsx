import { ProgressBar } from "../components/ProgressBar";

export function CurrentGoalsCard({ goals, onViewPlan }) {
  return (
    <section className="pd-card pd-card-pad pd-equal-card">
      <div className="pd-card-header">
        <h2 className="pd-section-title">Current Goals</h2>
        <button type="button" className="pd-link" onClick={onViewPlan}>
          View Plan →
        </button>
      </div>

      <p className="pd-goals-note">
        Goals are managed by your specialist. Contact them to discuss any updates.
      </p>

      <ul className="pd-goals-list">
        {goals.map((goal) => (
          <li key={goal.id} className="pd-goal-item">
            <div className="pd-goal-top">
              <div className="pd-goal-copy">
                <strong>{goal.title}</strong>
                <span>{goal.type}</span>
              </div>
              <span className="pd-goal-percent">{goal.percent}%</span>
            </div>
            <ProgressBar
              label={goal.title}
              percent={goal.percent}
              tone="cyan"
              hideMeta
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
