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
  labels,
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
      <div className="pd-admin-exercises-grid" aria-busy="true" aria-label={labels.loading}>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <AdminExerciseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (emptyKind === "no-exercises") {
    return (
      <section className="pd-card pd-card-pad pd-admin-exercises-empty pd-section-enter" aria-label={labels.empty}>
        <p className="pd-section-sub">{labels.empty}</p>
        <button type="button" className="pd-btn pd-btn-primary" onClick={onAddExercise}>
          <Plus size={16} aria-hidden="true" />
          {labels.addExercise}
        </button>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-exercises-empty pd-section-enter" aria-label={labels.emptyFiltered}>
        <p className="pd-section-sub">{labels.emptyFiltered}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
          {labels.clearFilters}
        </button>
      </section>
    );
  }

  return (
    <div className="pd-admin-exercises-grid" aria-label={labels.title}>
      {exercises.map((exercise) => (
        <AdminExerciseCard
          key={exercise.id}
          labels={labels}
          exercise={exercise}
          canEdit={canEditExercise(exercise)}
          onOpen={onOpenExercise}
          onEdit={onEditExercise}
        />
      ))}
    </div>
  );
}
