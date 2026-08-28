import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { formatPatientDueDateLabel } from "../utils/specialistPatientsLocalization";

export function SpecialistAssignedExercises({
  exercises,
  onAssignExercise,
  onAssignedExerciseClick,
}) {
  const { t, locale } = useLocale();

  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-exercises">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">{t("specialist.patientDetails.assignedExercises")}</h2>
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onAssignExercise}>
          {t("specialist.patientDetails.assignExercise")}
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">{t("specialist.patientDetails.noExercises")}</p>
        </div>
      ) : (
        <ul className="pd-specialist-patient-item-list">
          {exercises.map((exercise) => {
            const dueLabel = exercise.dueDate
              ? formatPatientDueDateLabel(exercise.dueDate, locale, t)
              : exercise.dueDateLabel;
            const canOpen = Boolean(exercise.id && onAssignedExerciseClick);

            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  className="pd-card pd-card-pad pd-specialist-patient-list-row pd-specialist-patient-list-row-btn"
                  onClick={() => onAssignedExerciseClick?.(exercise)}
                  disabled={!canOpen}
                >
                  <div>
                    <strong dir="auto">{exercise.exerciseTitle}</strong>
                    <p className="pd-section-sub">
                      {[exercise.category, dueLabel].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="pd-specialist-patient-list-row-aside">
                    <StatusBadge
                      label={exercise.statusLabel}
                      tone={exercise.isActive ? "success" : "gray"}
                    />
                    {canOpen ? <ChevronRight size={16} aria-hidden="true" /> : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
