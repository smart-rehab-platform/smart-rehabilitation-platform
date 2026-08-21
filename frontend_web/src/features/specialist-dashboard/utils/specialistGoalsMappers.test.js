import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCreateGoalPayload,
  buildGoalProgressPayload,
  buildUpdateGoalPayload,
  formatGoalTargetValue,
  GOAL_TERMS,
  GOALS_VALIDATION_KEYS,
  parseGoalProgressInput,
  parseGoalTargetValueInput,
  validateCreateGoalForm,
  validateGoalProgressForm,
  validateUpdateGoalForm,
} from "./specialistGoalsMappers.js";

describe("specialistGoalsMappers", () => {
  it("validates create goal form fields", () => {
    assert.equal(
      validateCreateGoalForm({ title: "", targetValueText: "", planId: "plan-1" }),
      GOALS_VALIDATION_KEYS.TITLE_REQUIRED,
    );
    assert.equal(
      validateCreateGoalForm({ title: "Goal", targetValueText: "abc", planId: "plan-1" }),
      GOALS_VALIDATION_KEYS.TARGET_VALUE_NUMBER,
    );
    assert.equal(
      validateCreateGoalForm({ title: "Goal", targetValueText: "", planId: "" }),
      GOALS_VALIDATION_KEYS.NO_ACTIVE_PLAN,
    );
  });

  it("builds create and update payloads with optional fields omitted", () => {
    const createPayload = buildCreateGoalPayload({
      term: GOAL_TERMS.SHORT_TERM,
      title: " Improve speech ",
      description: "  ",
      targetDate: "",
      targetValue: null,
    });
    assert.deepEqual(createPayload, {
      term: "short_term",
      title: "Improve speech",
    });

    const updatePayload = buildUpdateGoalPayload({
      title: "Updated",
      targetDate: "2026-05-01",
      targetValue: 80,
      isAchieved: true,
    });
    assert.deepEqual(updatePayload, {
      title: "Updated",
      target_date: "2026-05-01",
      target_value: 80,
      is_achieved: true,
    });
  });

  it("parses progress and target values", () => {
    assert.deepEqual(parseGoalTargetValueInput("12.5"), { value: 12.5, error: null });
    assert.equal(parseGoalTargetValueInput("bad").error, GOALS_VALIDATION_KEYS.TARGET_VALUE_NUMBER);
    assert.deepEqual(parseGoalProgressInput("60"), { value: 60, error: null });
    assert.equal(parseGoalProgressInput("120").error, GOALS_VALIDATION_KEYS.PROGRESS_RANGE);
  });

  it("builds progress payload with optional notes", () => {
    assert.deepEqual(
      buildGoalProgressPayload({ completionPercentage: 75, notes: "  " }),
      { completion_percentage: 75 },
    );
    assert.deepEqual(
      buildGoalProgressPayload({ completionPercentage: 75, notes: " steady " }),
      { completion_percentage: 75, notes: "steady" },
    );
  });

  it("formats target values for display", () => {
    assert.equal(formatGoalTargetValue(80), "80");
    assert.equal(formatGoalTargetValue(12.5), "12.5");
  });

  it("validates update and progress forms", () => {
    assert.equal(
      validateUpdateGoalForm({ title: "", targetValueText: "" }),
      GOALS_VALIDATION_KEYS.TITLE_REQUIRED,
    );
    assert.equal(
      validateGoalProgressForm({ progressText: "150" }),
      GOALS_VALIDATION_KEYS.PROGRESS_RANGE,
    );
  });
});
