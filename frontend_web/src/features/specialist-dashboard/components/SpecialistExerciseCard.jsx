import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { SpecialistExerciseCategoryBadge } from "./SpecialistExerciseCategoryBadge";
import { SpecialistExerciseCategoryIcon } from "./SpecialistExerciseCategoryIcon";

export function SpecialistExerciseCard({ exercise, onClick }) {
  const { t } = useLocale();
  const preview = exercise.previewText?.trim() ?? "";
  const categoryLabel = exercise.categoryLabel ?? exercise.category;

  return (
    <button
      type="button"
      className="pd-card pd-card-pad pd-specialist-exercise-card"
      onClick={() => onClick?.(exercise)}
    >
      <SpecialistExerciseCategoryIcon category={exercise.category} />
      <span className="pd-specialist-exercise-card-copy">
        <span className="pd-specialist-exercise-card-head">
          <strong className="pd-specialist-exercise-card-title" dir="auto">{exercise.title}</strong>
          {categoryLabel ? (
            <SpecialistExerciseCategoryBadge category={exercise.category} label={categoryLabel} />
          ) : null}
        </span>
        {preview ? (
          <span className="pd-specialist-exercise-card-preview" dir="auto">{preview}</span>
        ) : null}
        {exercise.hasMedia ? (
          <span className="pd-specialist-exercise-card-media">{t("specialist.exercises.includesMedia")}</span>
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
