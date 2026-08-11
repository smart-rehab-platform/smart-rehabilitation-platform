import { ChevronRight } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function SpecialistAssignedExercises({ exercises, onAssignExercise }) {
  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-exercises">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">Assigned Exercises</h2>
        <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onAssignExercise}>
          Assign Exercise
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">No assigned exercises yet.</p>
        </div>
      ) : (
        <ul className="pd-specialist-patient-item-list">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="pd-card pd-card-pad pd-specialist-patient-list-row">
              <div>
                <strong>{exercise.exerciseTitle}</strong>
                <p className="pd-section-sub">
                  {[exercise.category, exercise.dueDateLabel ? `Due ${exercise.dueDateLabel}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="pd-specialist-patient-list-row-aside">
                <StatusBadge
                  label={exercise.statusLabel}
                  tone={exercise.isActive ? "success" : "gray"}
                />
                <ChevronRight size={16} aria-hidden="true" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
