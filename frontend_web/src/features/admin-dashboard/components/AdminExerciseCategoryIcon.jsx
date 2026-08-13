import { BookOpen, Dumbbell, Footprints, Hand, Mic2, Users } from "lucide-react";
import {
  EXERCISE_CATEGORY_ICON_KEYS,
  resolveExerciseCategoryIconKey,
} from "../utils/adminExerciseCategoryVisuals";

const EXERCISE_CATEGORY_ICONS = {
  [EXERCISE_CATEGORY_ICON_KEYS.voice]: Mic2,
  [EXERCISE_CATEGORY_ICON_KEYS.language]: BookOpen,
  [EXERCISE_CATEGORY_ICON_KEYS.hand]: Hand,
  [EXERCISE_CATEGORY_ICON_KEYS.walk]: Footprints,
  [EXERCISE_CATEGORY_ICON_KEYS.users]: Users,
  [EXERCISE_CATEGORY_ICON_KEYS.default]: Dumbbell,
};

export function AdminExerciseCategoryIcon({ categoryName, size = 24, strokeWidth = 2.1 }) {
  const iconKey = resolveExerciseCategoryIconKey(categoryName);
  const Icon = EXERCISE_CATEGORY_ICONS[iconKey]
    ?? EXERCISE_CATEGORY_ICONS[EXERCISE_CATEGORY_ICON_KEYS.default];

  return <Icon size={size} strokeWidth={strokeWidth} />;
}
