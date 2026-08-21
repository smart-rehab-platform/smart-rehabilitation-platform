import { GOALS_VALIDATION_KEYS } from "./specialistGoalsMappers.js";

export function getGoalsValidationMessage(key, t) {
  switch (key) {
    case GOALS_VALIDATION_KEYS.TITLE_REQUIRED:
      return t("specialist.goals.titleRequired");
    case GOALS_VALIDATION_KEYS.TARGET_VALUE_NUMBER:
      return t("specialist.goals.targetValueNumber");
    case GOALS_VALIDATION_KEYS.PROGRESS_RANGE:
      return t("specialist.goals.progressRange");
    case GOALS_VALIDATION_KEYS.NO_ACTIVE_PLAN:
      return t("specialist.goals.noActivePlan");
    default:
      return null;
  }
}

export function mapGoalsActionErrorMessage(error, t) {
  const fallback = t("specialist.goals.actionFailed");
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
