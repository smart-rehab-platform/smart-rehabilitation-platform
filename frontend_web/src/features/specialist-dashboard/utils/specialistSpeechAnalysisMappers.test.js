import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSpeechComparison,
  formatSpeechScore,
  formatSpeechScoreDelta,
  mapSpeechAnalysisItem,
  mapSpeechAiFeedback,
  mergeSpeechAnalyses,
  speechTrendLabel,
} from "./specialistSpeechAnalysisMappers.js";

describe("specialistSpeechAnalysisMappers", () => {
  it("formats scores like Flutter", () => {
    assert.equal(formatSpeechScore(null), "—");
    assert.equal(formatSpeechScore(0.85), "85%");
    assert.equal(formatSpeechScore(85), "85");
    assert.equal(formatSpeechScore(85.5), "85.5");
    assert.equal(formatSpeechScoreDelta(null), "—");
    assert.equal(formatSpeechScoreDelta(-30), "-30");
    assert.equal(formatSpeechScoreDelta(12), "+12");
  });

  it("maps analysis item and AI feedback from analyze response shape", () => {
    const item = mapSpeechAnalysisItem({
      id: "a1",
      submission_id: "s1",
      patient_id: "p1",
      transcript: "Hello",
      pronunciation_score: "85.00",
      fluency_score: "85.00",
      overall_score: "85.00",
      language: "en",
      duration: 10,
      analyzed_at: "2026-08-12T19:59:37.557Z",
      ai_progress_note: {
        improvement_summary: "Baseline summary",
        clinical_note: "Clinical note",
        recommended_action: "Keep practicing",
        provider_response: {
          recommendations: ["A", "B"],
          decision_support: {
            reason: "Reason",
            suggested_action: "Suggested",
          },
        },
      },
      comparison: {
        trend: "baseline",
        pronunciation_change: null,
        fluency_change: null,
        overall_score_change: null,
      },
    });

    assert.equal(item.id, "a1");
    assert.equal(item.overallScore, 85);
    assert.equal(item.durationSeconds, 10);
    assert.equal(item.aiFeedback.hasContent, true);
    assert.equal(item.aiFeedback.improvementSummary, "Baseline summary");
    assert.deepEqual(item.aiFeedback.recommendations, ["A", "B"]);
    assert.equal(item.comparison.hasComparison, true);
    assert.equal(speechTrendLabel(item.comparison.trend), "Baseline");
  });

  it("builds declining comparison from previous analysis", () => {
    const newer = mapSpeechAnalysisItem({
      id: "new",
      submission_id: "s2",
      pronunciation_score: 55,
      fluency_score: 65,
      overall_score: 60,
      analyzed_at: "2026-08-12T20:00:00.000Z",
    });
    const older = mapSpeechAnalysisItem({
      id: "old",
      submission_id: "s1",
      pronunciation_score: 85,
      fluency_score: 85,
      overall_score: 85,
      analyzed_at: "2026-08-12T19:00:00.000Z",
    });
    const merged = mergeSpeechAnalyses([older], newer);
    assert.deepEqual(merged.map((row) => row.id), ["new", "old"]);
    const comparison = buildSpeechComparison(newer, merged);
    assert.equal(comparison.trend, "regression");
    assert.equal(comparison.trendLabel, "Declining");
    assert.equal(comparison.overallScoreChange, -25);
    assert.equal(comparison.pronunciationChange, -30);
  });

  it("parses nested provider_response AI feedback", () => {
    const feedback = mapSpeechAiFeedback({
      provider_response: {
        clinical_note: "Note",
        improvement_summary: "Improved",
      },
    });
    assert.equal(feedback.clinicalNote, "Note");
    assert.equal(feedback.improvementSummary, "Improved");
    assert.equal(feedback.hasContent, true);
  });
});
