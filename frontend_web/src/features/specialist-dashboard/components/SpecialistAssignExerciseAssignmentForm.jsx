import { useLocale } from "../../../context/useLocale";
import { EXERCISE_ASSIGNMENT_FREQUENCIES } from "../utils/specialistAssignExerciseMappers";
import { getExerciseAssignmentFrequencyLabel } from "../utils/specialistAssignExerciseLocalization";

const FREQUENCY_OPTIONS = [
  EXERCISE_ASSIGNMENT_FREQUENCIES.DAILY,
  EXERCISE_ASSIGNMENT_FREQUENCIES.WEEKLY,
  EXERCISE_ASSIGNMENT_FREQUENCIES.ONE_TIME,
];

export function SpecialistAssignExerciseAssignmentForm({
  frequency,
  startDate,
  dueDate,
  fieldErrors,
  isBusy,
  onFrequencyChange,
  onStartDateChange,
  onDueDateChange,
  onClearDueDate,
}) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-specialist-assign-exercise-form">
      <h2 className="pd-specialist-assign-exercise-form-heading">
        {t("specialist.assignExercise.assignmentDetails")}
      </h2>

      <div className="pd-specialist-assign-exercise-field">
        <p className="pd-specialist-assign-exercise-label">
          {t("specialist.assignExercise.frequencyLabel")}
        </p>
        <div className="pd-specialist-assign-exercise-frequency-chips" role="group" aria-label={t("specialist.assignExercise.frequencyLabel")}>
          {FREQUENCY_OPTIONS.map((option) => {
            const selected = frequency === option;
            return (
              <button
                key={option}
                type="button"
                className={`pd-specialist-exercise-filter-chip${selected ? " is-selected" : ""}`}
                onClick={() => onFrequencyChange(option)}
                disabled={isBusy}
                aria-pressed={selected}
              >
                {getExerciseAssignmentFrequencyLabel(option, t)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pd-specialist-assign-exercise-date-grid">
        <div className="pd-specialist-assign-exercise-field">
          <label className="pd-specialist-assign-exercise-label" htmlFor="assign-exercise-start-date">
            {t("specialist.patientDetails.startDate")}
          </label>
          <input
            id="assign-exercise-start-date"
            type="date"
            className="pd-specialist-exercise-control pd-specialist-assign-exercise-date-input"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            disabled={isBusy}
            dir="ltr"
          />
        </div>

        <div className={`pd-specialist-assign-exercise-field${fieldErrors.dueDate ? " has-error" : ""}`}>
          <div className="pd-specialist-assign-exercise-due-date-head">
            <label className="pd-specialist-assign-exercise-label" htmlFor="assign-exercise-due-date">
              {t("specialist.assignExercise.dueDateOptional")}
            </label>
            {dueDate ? (
              <button
                type="button"
                className="pd-btn pd-btn-soft pd-btn-sm"
                onClick={onClearDueDate}
                disabled={isBusy}
              >
                {t("specialist.assignExercise.clearDueDate")}
              </button>
            ) : null}
          </div>
          <input
            id="assign-exercise-due-date"
            type="date"
            className="pd-specialist-exercise-control pd-specialist-assign-exercise-date-input"
            value={dueDate}
            min={startDate || undefined}
            onChange={(event) => onDueDateChange(event.target.value)}
            disabled={isBusy}
            dir="ltr"
          />
          {fieldErrors.dueDate ? (
            <p className="pd-specialist-exercise-error">{fieldErrors.dueDate}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
