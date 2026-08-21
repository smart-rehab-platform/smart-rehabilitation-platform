import {
  ASSIGN_EXERCISE_VALIDATION_KEYS,
  EXERCISE_ASSIGNMENT_FREQUENCIES,
} from "./specialistAssignExerciseMappers.js";

const VALIDATION_KEY_MAP = {
  [ASSIGN_EXERCISE_VALIDATION_KEYS.EXERCISE_REQUIRED]:
    "specialist.assignExercise.validation.selectExercise",
  [ASSIGN_EXERCISE_VALIDATION_KEYS.REQUIREMENTS_MISSING]:
    "specialist.assignExercise.validation.requirementsMissing",
  [ASSIGN_EXERCISE_VALIDATION_KEYS.DUE_BEFORE_START]:
    "specialist.assignExercise.validation.dueBeforeStart",
};

const EN_VALIDATION_MESSAGE = {
  [ASSIGN_EXERCISE_VALIDATION_KEYS.EXERCISE_REQUIRED]: "Please select an exercise.",
  [ASSIGN_EXERCISE_VALIDATION_KEYS.REQUIREMENTS_MISSING]:
    "Patient, treatment plan, and exercise are required to assign.",
  [ASSIGN_EXERCISE_VALIDATION_KEYS.DUE_BEFORE_START]:
    "Due date cannot be before the start date.",
};

const ERROR_MESSAGE_KEY_MAP = {
  "Failed to assign exercise. Please try again.": "specialist.assignExercise.errors.failed",
  "Patient, treatment plan, and exercise are required to assign.":
    "specialist.assignExercise.validation.requirementsMissing",
  "Due date cannot be before the start date.":
    "specialist.assignExercise.validation.dueBeforeStart",
  "You do not have permission to assign this exercise.":
    "specialist.assignExercise.errors.forbidden",
  "Exercise, patient, or treatment plan was not found.":
    "specialist.assignExercise.errors.notFound",
  "This exercise may already be assigned.": "specialist.assignExercise.errors.duplicate",
  "Invalid assignment details. Check exercise, plan, and dates.":
    "specialist.assignExercise.errors.invalidDetails",
};

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

export function getAssignExerciseValidationMessage(key, t = null) {
  const messageKey = VALIDATION_KEY_MAP[key];
  if (messageKey) {
    return translateKey(t, messageKey, EN_VALIDATION_MESSAGE[key]);
  }
  return key || "";
}

export function mapAssignExerciseErrorMessage(message, t = null) {
  if (!message) {
    return translateKey(
      t,
      "specialist.assignExercise.errors.failed",
      "Failed to assign exercise. Please try again.",
    );
  }

  const messageKey = ERROR_MESSAGE_KEY_MAP[message];
  if (messageKey) {
    return translateKey(t, messageKey, message);
  }

  return message;
}

export function getExerciseAssignmentFrequencyLabel(frequency, t = null) {
  const normalized = typeof frequency === "string" ? frequency.trim().toLowerCase() : "";
  switch (normalized) {
    case EXERCISE_ASSIGNMENT_FREQUENCIES.DAILY:
      return translateKey(t, "specialist.assignExercise.frequency.daily", "Daily");
    case EXERCISE_ASSIGNMENT_FREQUENCIES.WEEKLY:
      return translateKey(t, "specialist.assignExercise.frequency.weekly", "Weekly");
    case EXERCISE_ASSIGNMENT_FREQUENCIES.ONE_TIME:
      return translateKey(t, "specialist.assignExercise.frequency.oneTime", "One time");
    default:
      return frequency || "";
  }
}

export function resolveAssignExerciseFieldErrors(validationKey, t = null) {
  if (!validationKey) {
    return {};
  }

  const message = getAssignExerciseValidationMessage(validationKey, t);
  switch (validationKey) {
    case ASSIGN_EXERCISE_VALIDATION_KEYS.EXERCISE_REQUIRED:
      return { exercise: message };
    case ASSIGN_EXERCISE_VALIDATION_KEYS.DUE_BEFORE_START:
      return { dueDate: message };
    default:
      return { form: message };
  }
}
