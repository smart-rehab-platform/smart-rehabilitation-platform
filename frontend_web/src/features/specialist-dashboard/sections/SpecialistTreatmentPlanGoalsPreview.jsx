import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";

export function SpecialistTreatmentPlanGoalsPreview({ goals, variant = "default" }) {
  const isEditVariant = variant === "edit";

  if (!goals.length) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-section-sub">No goals defined for this plan.</p>
      </section>
    );
  }

  return (
    <div className={`pd-specialist-treatment-plan-goals${isEditVariant ? " pd-specialist-treatment-plan-goals--edit" : ""}`}>
      {goals.map((goal) => (
        <div key={goal.id} className="pd-card pd-card-pad pd-specialist-treatment-plan-goal-card">
          <div className="pd-specialist-goal-head">
            <strong>{goal.title}</strong>
            <span className={`pd-specialist-goal-term${isEditVariant ? " pd-specialist-treatment-plan-goal-term-badge" : ""}`}>
              {goal.termLabel}
            </span>
          </div>
          <ProgressBar label="Completion" percent={goal.completionPercent} tone="cyan" />
        </div>
      ))}
    </div>
  );
}
