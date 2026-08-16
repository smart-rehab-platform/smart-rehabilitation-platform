import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { getAdminPatientDetailsLabels } from "../utils/adminPatientsLocalization.js";

function exerciseStatusTone(isActive) {
  return isActive ? "success" : "gray";
}

export function AdminPatientAssignedExercises({ exercises }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);

  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label={labels.assignedExercises}>
      <h2 className="pd-admin-patient-section-title">{labels.assignedExercises}</h2>

      {exercises.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">{labels.noExercises}</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="pd-card pd-card-pad pd-admin-patient-list-row">
              <div>
                <strong>{exercise.exerciseTitle}</strong>
                <p className="pd-admin-patient-row-meta">
                  {exercise.category || labels.emptyDisplay}
                  {" · "}
                  {exercise.dueDateDisplay}
                </p>
              </div>
              <StatusBadge
                label={exercise.statusLabel}
                tone={exerciseStatusTone(exercise.isActive)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
