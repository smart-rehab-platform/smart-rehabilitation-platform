import { getExerciseCategoryTone } from "../utils/specialistExerciseMappers";

export function SpecialistExerciseCategoryBadge({ category, label }) {
  const displayLabel = label ?? category;
  if (!displayLabel) {
    return null;
  }

  const tone = getExerciseCategoryTone(category ?? displayLabel);

  return (
    <span className={`pd-specialist-exercise-category-badge pd-specialist-exercise-category-badge--${tone}`}>
      {displayLabel}
    </span>
  );
}
