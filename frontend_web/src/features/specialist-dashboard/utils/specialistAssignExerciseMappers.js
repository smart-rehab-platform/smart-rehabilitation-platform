export const EXERCISE_ASSIGNMENT_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  ONE_TIME: "one_time",
};

export const ASSIGN_EXERCISE_VALIDATION_KEYS = {
  EXERCISE_REQUIRED: "exerciseRequired",
  REQUIREMENTS_MISSING: "requirementsMissing",
  DUE_BEFORE_START: "dueBeforeStart",
};

export function formatAssignmentDateOnly(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "";
}

export function getTodayAssignmentDate() {
  return formatAssignmentDateOnly(new Date());
}

export function buildAssignedExerciseCreatePayload({
  exerciseId,
  planId,
  patientId,
  frequency,
  startDate,
  dueDate,
}) {
  const payload = {
    exercise_id: exerciseId.trim(),
    plan_id: planId.trim(),
    patient_id: patientId.trim(),
    frequency: frequency?.trim() || EXERCISE_ASSIGNMENT_FREQUENCIES.DAILY,
  };

  const formattedStartDate = formatAssignmentDateOnly(startDate);
  if (formattedStartDate) {
    payload.start_date = formattedStartDate;
  }

  const formattedDueDate = formatAssignmentDateOnly(dueDate);
  if (formattedDueDate) {
    payload.due_date = formattedDueDate;
  }

  return payload;
}

export function validateAssignExerciseForm({
  patientId,
  planId,
  exerciseId,
  startDate,
  dueDate,
}) {
  if (!patientId?.trim() || !planId?.trim()) {
    return ASSIGN_EXERCISE_VALIDATION_KEYS.REQUIREMENTS_MISSING;
  }

  if (!exerciseId?.trim()) {
    return ASSIGN_EXERCISE_VALIDATION_KEYS.EXERCISE_REQUIRED;
  }

  const formattedStartDate = formatAssignmentDateOnly(startDate);
  const formattedDueDate = formatAssignmentDateOnly(dueDate);

  if (formattedStartDate && formattedDueDate && formattedDueDate < formattedStartDate) {
    return ASSIGN_EXERCISE_VALIDATION_KEYS.DUE_BEFORE_START;
  }

  return null;
}
