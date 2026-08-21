import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSIGN_EXERCISE_VALIDATION_KEYS,
  EXERCISE_ASSIGNMENT_FREQUENCIES,
  buildAssignedExerciseCreatePayload,
  formatAssignmentDateOnly,
  getTodayAssignmentDate,
  validateAssignExerciseForm,
} from "./specialistAssignExerciseMappers.js";
import {
  getAssignExerciseValidationMessage,
  getExerciseAssignmentFrequencyLabel,
  resolveAssignExerciseFieldErrors,
} from "./specialistAssignExerciseLocalization.js";

describe("specialistAssignExerciseMappers", () => {
  it("buildAssignedExerciseCreatePayload matches Flutter/backend contract", () => {
    const payload = buildAssignedExerciseCreatePayload({
      exerciseId: "ex-1",
      planId: "plan-1",
      patientId: "patient-1",
      frequency: EXERCISE_ASSIGNMENT_FREQUENCIES.WEEKLY,
      startDate: "2026-08-17",
      dueDate: "2026-08-24",
    });

    assert.deepEqual(payload, {
      exercise_id: "ex-1",
      plan_id: "plan-1",
      patient_id: "patient-1",
      frequency: "weekly",
      start_date: "2026-08-17",
      due_date: "2026-08-24",
    });
  });

  it("omits due_date when not provided", () => {
    const payload = buildAssignedExerciseCreatePayload({
      exerciseId: "ex-1",
      planId: "plan-1",
      patientId: "patient-1",
      frequency: EXERCISE_ASSIGNMENT_FREQUENCIES.DAILY,
      startDate: getTodayAssignmentDate(),
      dueDate: null,
    });

    assert.equal(payload.due_date, undefined);
    assert.equal(payload.frequency, "daily");
  });

  it("validateAssignExerciseForm enforces exercise selection and due date order", () => {
    assert.equal(
      validateAssignExerciseForm({
        patientId: "patient-1",
        planId: "plan-1",
        exerciseId: "",
        startDate: "2026-08-17",
        dueDate: null,
      }),
      ASSIGN_EXERCISE_VALIDATION_KEYS.EXERCISE_REQUIRED,
    );

    assert.equal(
      validateAssignExerciseForm({
        patientId: "patient-1",
        planId: "",
        exerciseId: "ex-1",
        startDate: "2026-08-17",
        dueDate: null,
      }),
      ASSIGN_EXERCISE_VALIDATION_KEYS.REQUIREMENTS_MISSING,
    );

    assert.equal(
      validateAssignExerciseForm({
        patientId: "patient-1",
        planId: "plan-1",
        exerciseId: "ex-1",
        startDate: "2026-08-20",
        dueDate: "2026-08-17",
      }),
      ASSIGN_EXERCISE_VALIDATION_KEYS.DUE_BEFORE_START,
    );
  });

  it("formatAssignmentDateOnly returns YYYY-MM-DD", () => {
    assert.equal(formatAssignmentDateOnly(new Date(2026, 7, 17)), "2026-08-17");
  });
});

describe("specialistAssignExerciseLocalization", () => {
  it("maps validation keys and frequency labels", () => {
    assert.equal(
      getAssignExerciseValidationMessage(ASSIGN_EXERCISE_VALIDATION_KEYS.EXERCISE_REQUIRED),
      "Please select an exercise.",
    );
    assert.equal(getExerciseAssignmentFrequencyLabel("one_time"), "One time");

    const fieldErrors = resolveAssignExerciseFieldErrors(
      ASSIGN_EXERCISE_VALIDATION_KEYS.DUE_BEFORE_START,
    );
    assert.match(fieldErrors.dueDate, /Due date cannot be before/);
  });
});
