import { getExerciseCategoryTone } from "../utils/specialistExerciseMappers";

export function SpecialistExerciseCategoryBadge({ label }) {
  if (!label) {
    return null;
  }

  const tone = getExerciseCategoryTone(label);

  return (
    <span className={`pd-specialist-exercise-category-badge pd-specialist-exercise-category-badge--${tone}`}>
      {label}
    </span>
  );
}
