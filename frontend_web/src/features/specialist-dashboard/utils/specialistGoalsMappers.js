import { formatAssignmentDateOnly } from "./specialistAssignExerciseMappers.js";

export const GOAL_TERMS = {
  SHORT_TERM: "short_term",
  LONG_TERM: "long_term",
};

export const GOALS_VALIDATION_KEYS = {
  TITLE_REQUIRED: "titleRequired",
  TARGET_VALUE_NUMBER: "targetValueNumber",
  PROGRESS_RANGE: "progressRange",
  NO_ACTIVE_PLAN: "noActivePlan",
};

export function formatGoalTargetValue(value) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

export function parseGoalTargetValueInput(raw) {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) {
    return { value: null, error: null };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: GOALS_VALIDATION_KEYS.TARGET_VALUE_NUMBER };
  }
  return { value: parsed, error: null };
}

export function parseGoalProgressInput(raw) {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return { value: null, error: GOALS_VALIDATION_KEYS.PROGRESS_RANGE };
  }
  return { value: parsed, error: null };
}

export function validateCreateGoalForm({ title, targetValueText, planId }) {
  if (!planId?.trim()) {
    return GOALS_VALIDATION_KEYS.NO_ACTIVE_PLAN;
  }
  if (!title?.trim()) {
    return GOALS_VALIDATION_KEYS.TITLE_REQUIRED;
  }
  const { error } = parseGoalTargetValueInput(targetValueText);
  return error;
}

export function validateUpdateGoalForm({ title, targetValueText }) {
  if (!title?.trim()) {
    return GOALS_VALIDATION_KEYS.TITLE_REQUIRED;
  }
  const { error } = parseGoalTargetValueInput(targetValueText);
  return error;
}

export function validateGoalProgressForm({ progressText }) {
  const { error } = parseGoalProgressInput(progressText);
  return error;
}

export function buildCreateGoalPayload({
  term,
  title,
  description,
  targetDate,
  targetValue,
}) {
  const payload = {
    term: term === GOAL_TERMS.LONG_TERM ? GOAL_TERMS.LONG_TERM : GOAL_TERMS.SHORT_TERM,
    title: title.trim(),
  };

  const trimmedDescription = typeof description === "string" ? description.trim() : "";
  if (trimmedDescription) {
    payload.description = trimmedDescription;
  }

  const formattedTargetDate = formatAssignmentDateOnly(targetDate);
  if (formattedTargetDate) {
    payload.target_date = formattedTargetDate;
  }

  if (targetValue != null && Number.isFinite(targetValue)) {
    payload.target_value = targetValue;
  }

  return payload;
}

export function buildUpdateGoalPayload({
  title,
  targetDate,
  targetValue,
  isAchieved,
}) {
  const payload = {
    title: title.trim(),
  };

  const formattedTargetDate = formatAssignmentDateOnly(targetDate);
  if (formattedTargetDate) {
    payload.target_date = formattedTargetDate;
  }

  if (targetValue != null && Number.isFinite(targetValue)) {
    payload.target_value = targetValue;
  }

  if (typeof isAchieved === "boolean") {
    payload.is_achieved = isAchieved;
  }

  return payload;
}

export function buildGoalProgressPayload({ completionPercentage, notes }) {
  const payload = {
    completion_percentage: completionPercentage,
  };

  const trimmedNotes = typeof notes === "string" ? notes.trim() : "";
  if (trimmedNotes) {
    payload.notes = trimmedNotes;
  }

  return payload;
}
