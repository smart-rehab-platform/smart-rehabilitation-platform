import { Plus } from "lucide-react";
import { AdminExerciseCard } from "../components/AdminExerciseCard";

const SKELETON_CARD_COUNT = 6;

function AdminExerciseCardSkeleton() {
  return (
    <article className="pd-admin-exercise-card pd-admin-exercise-card-skeleton" aria-hidden="true">
      <div className="pd-admin-exercise-card-top">
        <span className="pd-admin-exercises-skeleton-icon" />
        <div className="pd-admin-exercises-skeleton-lines">
          <span className="pd-admin-exercises-skeleton-line is-wide" />
        </div>
      </div>
      <div className="pd-admin-exercises-skeleton-meta">
        <span className="pd-admin-exercises-skeleton-chip" />
        <span className="pd-admin-exercises-skeleton-chip is-short" />
      </div>
      <span className="pd-admin-exercises-skeleton-line" />
      <span className="pd-admin-exercises-skeleton-line is-wide" />
    </article>
  );
}

export function AdminExercisesGrid({
  exercises,
  isLoading,
  emptyKind,
  canEditExercise,
  onOpenExercise,
  onEditExercise,
  onAddExercise,
  onClearFilters,
}) {
  if (isLoading) {
    return (
      <div className="pd-admin-exercises-grid" aria-busy="true" aria-label="Loading exercises">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <AdminExerciseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (emptyKind === "no-exercises") {
    return (
      <section className="pd-card pd-card-pad pd-admin-exercises-empty pd-section-enter" aria-label="No exercises">
        <p className="pd-section-sub">No exercises available yet.</p>
        <button type="button" className="pd-btn pd-btn-primary" onClick={onAddExercise}>
          <Plus size={16} aria-hidden="true" />
          Add Exercise
        </button>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-exercises-empty pd-section-enter" aria-label="No matching exercises">
        <p className="pd-section-sub">No exercises match your filters.</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
          Clear filters
        </button>
      </section>
    );
  }

  return (
    <div className="pd-admin-exercises-grid" aria-label="Exercise library">
      {exercises.map((exercise) => (
        <AdminExerciseCard
          key={exercise.id}
          exercise={exercise}
          canEdit={canEditExercise(exercise)}
          onOpen={onOpenExercise}
          onEdit={onEditExercise}
        />
      ))}
    </div>
  );
}
