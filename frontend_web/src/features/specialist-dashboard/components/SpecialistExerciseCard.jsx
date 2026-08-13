import { ChevronRight } from "lucide-react";
import { SpecialistExerciseCategoryBadge } from "./SpecialistExerciseCategoryBadge";
import { SpecialistExerciseCategoryIcon } from "./SpecialistExerciseCategoryIcon";

export function SpecialistExerciseCard({ exercise, onClick }) {
  const preview = exercise.previewText?.trim() ?? "";

  return (
    <button
      type="button"
      className="pd-card pd-card-pad pd-specialist-exercise-card"
      onClick={() => onClick?.(exercise)}
    >
      <SpecialistExerciseCategoryIcon category={exercise.category} />
      <span className="pd-specialist-exercise-card-copy">
        <span className="pd-specialist-exercise-card-head">
          <strong className="pd-specialist-exercise-card-title">{exercise.title}</strong>
          {exercise.category ? (
            <SpecialistExerciseCategoryBadge label={exercise.category} />
          ) : null}
        </span>
        {preview ? (
          <span className="pd-specialist-exercise-card-preview">{preview}</span>
        ) : null}
        {exercise.hasMedia ? (
          <span className="pd-specialist-exercise-card-media">Includes instruction media</span>
        ) : null}
      </span>
      <ChevronRight size={18} aria-hidden="true" className="pd-specialist-exercise-card-chevron" />
    </button>
  );
}

export function SpecialistExerciseCardSkeleton() {
  return (
    <div className="pd-card pd-card-pad pd-specialist-exercise-card pd-specialist-exercise-card--skeleton" aria-hidden="true">
      <span className="pd-specialist-exercise-skeleton-icon" />
      <span className="pd-specialist-exercise-card-copy">
        <span className="pd-specialist-exercise-skeleton-line pd-specialist-exercise-skeleton-line--title" />
        <span className="pd-specialist-exercise-skeleton-line" />
        <span className="pd-specialist-exercise-skeleton-line pd-specialist-exercise-skeleton-line--short" />
      </span>
    </div>
  );
}
