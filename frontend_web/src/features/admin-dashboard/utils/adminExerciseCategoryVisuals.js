/**
 * Category icon/color mapping ported from Flutter specialist_exercises_widgets.dart.
 * Uses substring matching on normalized lowercase category names.
 */

export const EXERCISE_CATEGORY_ICON_KEYS = {
  voice: "voice",
  language: "language",
  hand: "hand",
  walk: "walk",
  users: "users",
  default: "default",
};

function normalizeCategory(categoryName) {
  return typeof categoryName === "string" ? categoryName.trim().toLowerCase() : "";
}

export function resolveExerciseCategoryIconKey(categoryName) {
  const normalized = normalizeCategory(categoryName);

  if (
    normalized.includes("articulation")
    || normalized.includes("speech")
    || normalized.includes("voice")
    || normalized.includes("fluency")
  ) {
    return EXERCISE_CATEGORY_ICON_KEYS.voice;
  }

  if (normalized.includes("language") || normalized.includes("learning")) {
    return EXERCISE_CATEGORY_ICON_KEYS.language;
  }

  if (
    normalized.includes("fine motor")
    || normalized.includes("daily living")
    || normalized.includes("sensory")
  ) {
    return EXERCISE_CATEGORY_ICON_KEYS.hand;
  }

  if (
    normalized.includes("gross motor")
    || normalized.includes("motor rehabilitation")
  ) {
    return EXERCISE_CATEGORY_ICON_KEYS.walk;
  }

  if (
    normalized.includes("behavioral")
    || normalized.includes("social")
    || normalized.includes("autism")
    || normalized.includes("developmental")
  ) {
    return EXERCISE_CATEGORY_ICON_KEYS.users;
  }

  return EXERCISE_CATEGORY_ICON_KEYS.default;
}

export function resolveExerciseCategoryIconColor(categoryName) {
  const normalized = normalizeCategory(categoryName);

  if (
    normalized.includes("articulation")
    || normalized.includes("speech")
    || normalized.includes("voice")
  ) {
    return "var(--brand-cyan, #2f9fd6)";
  }

  if (normalized.includes("fluency")) {
    return "var(--pd-accent-teal, #0d9488)";
  }

  if (normalized.includes("language") || normalized.includes("learning")) {
    return "#3b82f6";
  }

  if (
    normalized.includes("motor")
    || normalized.includes("sensory")
    || normalized.includes("daily")
  ) {
    return "#0d9488";
  }

  if (
    normalized.includes("behavioral")
    || normalized.includes("social")
    || normalized.includes("autism")
    || normalized.includes("developmental")
  ) {
    return "var(--pd-brand-secondary-blue, #1e4a7a)";
  }

  return "var(--pd-warning, #d97706)";
}

export function resolveExerciseCategoryIconBackground(categoryName) {
  const normalized = normalizeCategory(categoryName);

  if (
    normalized.includes("articulation")
    || normalized.includes("speech")
    || normalized.includes("voice")
  ) {
    return "rgba(var(--brand-cyan-rgb, 47, 159, 214), 0.12)";
  }

  if (normalized.includes("fluency")) {
    return "rgba(13, 148, 136, 0.12)";
  }

  if (normalized.includes("language") || normalized.includes("learning")) {
    return "rgba(59, 130, 246, 0.12)";
  }

  if (
    normalized.includes("motor")
    || normalized.includes("sensory")
    || normalized.includes("daily")
  ) {
    return "rgba(13, 148, 136, 0.12)";
  }

  if (
    normalized.includes("behavioral")
    || normalized.includes("social")
    || normalized.includes("autism")
    || normalized.includes("developmental")
  ) {
    return "rgba(var(--brand-cyan-rgb, 47, 159, 214), 0.1)";
  }

  return "rgba(217, 119, 6, 0.12)";
}
