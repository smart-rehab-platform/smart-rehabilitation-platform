import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

function exerciseStatusTone(isActive) {
  return isActive ? "success" : "gray";
}

export function AdminPatientAssignedExercises({ exercises }) {
  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label="Assigned exercises">
      <h2 className="pd-admin-patient-section-title">Assigned Exercises</h2>

      {exercises.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">No exercises.</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="pd-card pd-card-pad pd-admin-patient-list-row">
              <div>
                <strong>{exercise.exerciseTitle}</strong>
                <p className="pd-admin-patient-row-meta">
                  {exercise.category || "—"}
                  {" · "}
                  {exercise.dueDateLabel ? `Due ${exercise.dueDateLabel}` : "No due date"}
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
