import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import { formatAppDate } from "../../../i18n/formatters.js";
import {
  applyAiRecommendationLocalization,
  AI_RECOMMENDATION_TYPE,
  formatRecommendationDateLabel,
  getPriorityLabel,
  getRecommendationStatusMeta,
  getRecommendationTypeLabel,
} from "./specialistAiRecommendationsLocalization.js";

function tFactory(locale) {
  const messages = locale === "ar" ? ar : en;
  return (key, params) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== "string") {
      return key;
    }
    return Object.entries(params || {}).reduce(
      (result, [name, paramValue]) => result.replace(`{${name}}`, String(paramValue)),
      value,
    );
  };
}

function buildRecommendationRow(overrides = {}) {
  return {
    id: "rec-1",
    patientId: "patient-1",
    relatedPlanId: "plan-1",
    type: { id: AI_RECOMMENDATION_TYPE.exerciseSuggestion, label: "Exercise Suggestion" },
    status: { id: "pending", label: "Pending", tone: "warning", isPending: true },
    generatedAt: "2026-03-15T10:00:00.000Z",
    generatedAtLabel: "Mar 15, 2026",
    details: {
      summary: "Increase repetition for articulation drills.",
      clinicalAnalysis: null,
      clinicalReasoning: "Increase repetition for articulation drills.",
      suggestedExercises: [{
        exerciseId: "ex-1",
        title: "Tongue Twisters",
        reason: "Improve clarity",
        displayLine: "Tongue Twisters — Improve clarity",
      }],
      planAdjustments: [],
      confidence: 0.82,
      priorityLevel: "high",
    },
    ...overrides,
  };
}

describe("specialistAiRecommendationsLocalization", () => {
  it("maps AI recommendation page labels in EN/AR", () => {
    assert.equal(tFactory("en")("specialist.aiRecommendations.title"), "AI Recommendations");
    assert.equal(tFactory("ar")("specialist.aiRecommendations.title"), "توصيات الذكاء الاصطناعي");
    assert.equal(
      tFactory("en")("specialist.aiRecommendations.generate.exerciseSuggestion"),
      "Generate Exercise Suggestion",
    );
    assert.equal(
      tFactory("ar")("specialist.aiRecommendations.generate.exerciseSuggestion"),
      "إنشاء اقتراح تمرين",
    );
  });

  it("maps stable type/status/priority labels in EN/AR while preserving raw values", () => {
    for (const [typeId, enLabel, arLabel] of [
      [AI_RECOMMENDATION_TYPE.exerciseSuggestion, "Exercise Suggestion", "اقتراح تمرين"],
      [AI_RECOMMENDATION_TYPE.planAdjustment, "Plan Adjustment", "تعديل الخطة"],
    ]) {
      assert.equal(getRecommendationTypeLabel(typeId, tFactory("en")), enLabel);
      assert.equal(getRecommendationTypeLabel(typeId, tFactory("ar")), arLabel);
    }

    for (const status of ["pending", "accepted", "rejected"]) {
      const enMeta = getRecommendationStatusMeta(status, tFactory("en"));
      const arMeta = getRecommendationStatusMeta(status, tFactory("ar"));
      assert.equal(enMeta.id, status);
      assert.equal(arMeta.id, status);
      assert.notEqual(enMeta.label, arMeta.label);
    }

    assert.equal(getPriorityLabel("high", tFactory("en")), "High");
    assert.equal(getPriorityLabel("high", tFactory("ar")), "مرتفع");
  });

  it("preserves AI recommendation and patient clinical content", () => {
    const raw = buildRecommendationRow();

    const localized = applyAiRecommendationLocalization(raw, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.equal(raw.type.id, "exercise_suggestion");
    assert.equal(raw.status.id, "pending");
    assert.equal(localized.details.clinicalReasoning, "Increase repetition for articulation drills.");
    assert.equal(localized.details.suggestedExercises[0].displayLine, "Tongue Twisters — Improve clarity");
    assert.equal(localized.details.priorityLevel, "high");
    assert.notEqual(localized.type.label, raw.type.label);
    assert.notEqual(localized.status.label, raw.status.label);
  });

  it("formats generated dates using app locale", () => {
    const iso = "2026-03-15T10:00:00.000Z";
    const enDate = formatRecommendationDateLabel(iso, "en", tFactory("en"));
    const arDate = formatRecommendationDateLabel(iso, "ar", tFactory("ar"));
    assert.equal(enDate, formatAppDate(iso, "en"));
    assert.equal(arDate, formatAppDate(iso, "ar"));
    assert.notEqual(enDate, arDate);
  });

  it("provides English fallback for unknown recommendation type ids", () => {
    assert.equal(
      getRecommendationTypeLabel("custom_type", tFactory("en")),
      "Recommendation",
    );
  });

  it("keeps recommendation ids unchanged through localization", () => {
    const raw = buildRecommendationRow({
      id: "rec-42",
      type: { id: AI_RECOMMENDATION_TYPE.planAdjustment, label: "Plan Adjustment" },
      status: { id: "accepted", label: "Accepted", tone: "success", isPending: false },
      details: {
        summary: null,
        clinicalAnalysis: null,
        clinicalReasoning: null,
        suggestedExercises: [],
        planAdjustments: ["Extend plan by two weeks."],
        confidence: null,
        priorityLevel: null,
      },
    });

    const localized = applyAiRecommendationLocalization(raw, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.equal(localized.id, "rec-42");
    assert.equal(localized.type.id, "plan_adjustment");
    assert.equal(localized.status.id, "accepted");
    assert.equal(localized.details.planAdjustments[0], "Extend plan by two weeks.");
  });
});
