import {
  BookOpen,
  Dumbbell,
  Footprints,
  Hand,
  Mic,
  Users,
} from "lucide-react";
import { getExerciseCategoryIconType, getExerciseCategoryTone } from "../utils/specialistExerciseMappers";

const ICONS = {
  voice: Mic,
  book: BookOpen,
  hand: Hand,
  walk: Footprints,
  groups: Users,
  fitness: Dumbbell,
};

export function SpecialistExerciseCategoryIcon({ category, size = 20, className = "" }) {
  const iconType = getExerciseCategoryIconType(category);
  const tone = getExerciseCategoryTone(category);
  const Icon = ICONS[iconType] || Dumbbell;

  return (
    <span
      className={`pd-specialist-exercise-category-icon pd-specialist-exercise-category-icon--${tone} ${className}`.trim()}
      aria-hidden="true"
    >
      <Icon size={size} />
    </span>
  );
}
