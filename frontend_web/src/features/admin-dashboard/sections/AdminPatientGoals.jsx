import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { getAdminPatientDetailsLabels } from "../utils/adminPatientsLocalization.js";

export function AdminPatientGoals({ goals }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);

  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label={labels.goals}>
      <h2 className="pd-admin-patient-section-title">{labels.goals}</h2>

      {goals.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">{labels.noGoals}</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {goals.map((goal) => (
            <li key={goal.id} className="pd-card pd-card-pad pd-admin-patient-goal-card">
              <div className="pd-admin-patient-goal-head">
                <strong>{goal.title}</strong>
                <div className="pd-admin-patient-goal-badges">
                  {goal.isAchieved ? (
                    <StatusBadge label={labels.achieved} tone="success" />
                  ) : null}
                  <span className="pd-admin-patient-goal-term">{goal.termLabel}</span>
                </div>
              </div>
              <ProgressBar
                label={labels.completion}
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
