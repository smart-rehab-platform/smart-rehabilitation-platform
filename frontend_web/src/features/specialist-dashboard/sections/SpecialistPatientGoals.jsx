import { useLocale } from "../../../context/useLocale";
import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";

export function SpecialistPatientGoals({ goals, onManageGoals, hasActivePlan }) {
  const { t } = useLocale();

  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-goals">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">{t("specialist.patientDetails.goals")}</h2>
        {hasActivePlan ? (
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onManageGoals}>
            {t("specialist.patientDetails.manageGoals")}
          </button>
        ) : null}
      </div>

      {goals.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">{t("specialist.patientDetails.noGoals")}</p>
        </div>
      ) : (
        <div className="pd-specialist-patient-stack">
          {goals.map((goal) => (
            <div key={goal.id} className="pd-card pd-card-pad">
              <div className="pd-specialist-goal-head">
                <strong dir="auto">{goal.title}</strong>
                <span className="pd-section-sub">{goal.termLabel}</span>
              </div>
              {goal.description ? <p className="pd-section-sub" dir="auto">{goal.description}</p> : null}
              <ProgressBar
                label={t("specialist.patientDetails.completion")}
                percent={goal.completionPercent}
                tone="cyan"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
