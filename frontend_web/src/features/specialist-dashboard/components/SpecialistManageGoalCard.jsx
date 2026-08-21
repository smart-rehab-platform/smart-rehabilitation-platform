import { Check, Circle, Clock, Pencil } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { GOAL_TERMS, formatGoalTargetValue } from "../utils/specialistGoalsMappers";
import { SpecialistGoalCircularProgress } from "./SpecialistGoalCircularProgress";

const GOAL_PROGRESS_RING_SIZE = 98;

function goalMetaFieldLabel(t, translationKey, paramKey) {
  const text = t(translationKey, { [paramKey]: "" }).trimEnd();
  return text.endsWith(":") ? text : `${text}:`;
}

export function SpecialistManageGoalCard({
  goal,
  isSaving = false,
  onUpdateProgress,
  onEdit,
}) {
  const { t } = useLocale();
  const targetValueText = formatGoalTargetValue(goal.targetValue);
  const isLongTerm = goal.term === GOAL_TERMS.LONG_TERM;
  const progressLabel = goal.isAchieved
    ? t("specialist.goals.achieved")
    : t("specialist.goals.progressLabel");

  return (
    <article
      className={`pd-card pd-card-pad pd-specialist-manage-goal-card${goal.isAchieved ? " is-achieved" : ""}`}
    >
      <div className="pd-specialist-manage-goal-body">
        <div className="pd-specialist-manage-goal-info">
          <div className="pd-specialist-manage-goal-head">
            <strong className="pd-specialist-manage-goal-title" dir="auto">
              {goal.title}
            </strong>
            <span
              className={`pd-specialist-treatment-plan-goal-term-badge pd-specialist-manage-goal-term-badge${isLongTerm ? " is-long-term" : ""}`}
            >
              {goal.termLabel}
            </span>
          </div>

          {targetValueText || goal.targetDateLabel ? (
            <div className="pd-specialist-manage-goal-meta">
              {goal.targetDateLabel ? (
                <span className="pd-specialist-manage-goal-meta-item">
                  <Clock size={13} aria-hidden="true" />
                  <span className="pd-specialist-manage-goal-meta-text">
                    <span className="pd-specialist-manage-goal-meta-label">
                      {goalMetaFieldLabel(t, "specialist.goals.targetDateLabel", "date")}
                    </span>
                    <span className="pd-specialist-manage-goal-meta-value">{goal.targetDateLabel}</span>
                  </span>
                </span>
              ) : null}
              {goal.targetDateLabel && targetValueText ? (
                <span className="pd-specialist-manage-goal-meta-sep" aria-hidden="true">
                  |
                </span>
              ) : null}
              {targetValueText ? (
                <span className="pd-specialist-manage-goal-meta-item">
                  <Circle size={8} aria-hidden="true" className="pd-specialist-manage-goal-meta-dot" />
                  <span className="pd-specialist-manage-goal-meta-text">
                    <span className="pd-specialist-manage-goal-meta-label">
                      {goalMetaFieldLabel(t, "specialist.goals.targetValueLabel", "value")}
                    </span>
                    <span className="pd-specialist-manage-goal-meta-value">{targetValueText}</span>
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="pd-specialist-manage-goal-actions">
            {goal.isAchieved ? (
              <span className="pd-specialist-manage-goal-achieved-status">
                <Check size={14} aria-hidden="true" />
                {t("specialist.goals.achieved")}
              </span>
            ) : (
              <button
                type="button"
                className="pd-btn pd-btn-primary pd-btn-sm"
                onClick={onUpdateProgress}
                disabled={isSaving}
              >
                <Check size={14} aria-hidden="true" />
                {t("specialist.goals.updateProgress")}
              </button>
            )}
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-btn-sm"
              onClick={onEdit}
              disabled={isSaving}
            >
              <Pencil size={14} aria-hidden="true" />
              {t("specialist.goals.editGoal")}
            </button>
          </div>
        </div>

        <div className="pd-specialist-manage-goal-divider" aria-hidden="true" />

        <div className="pd-specialist-manage-goal-progress-zone">
          <SpecialistGoalCircularProgress
            percent={goal.completionPercent}
            label={progressLabel}
            size={GOAL_PROGRESS_RING_SIZE}
            isAchieved={goal.isAchieved}
          />
        </div>
      </div>
    </article>
  );
}
