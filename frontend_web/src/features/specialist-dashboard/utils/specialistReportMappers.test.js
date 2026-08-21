import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAiReportDetailSections,
  normalizeAiReportConfidence,
  normalizeAiReportPriority,
  parseAiReportStructuredSummary,
} from "./specialistAiReportStructuredSummary.js";

const VALID_AI_SUMMARY = {
  executive_summary: "Executive overview text.",
  patient_progress_summary: "Progress improved steadily.",
  speech_analysis_summary: "Speech data available for review.",
  exercise_adherence_summary: "Three submissions recorded.",
  goal_progress_summary: "One goal achieved.",
  clinical_insights: ["Insight one", "Insight two"],
  risks_or_regressions: ["Low adherence on weekends"],
  recommendations: ["Continue current plan", "Review pacing"],
  next_steps: ["Schedule follow-up"],
  priority_level: "medium",
  estimated_confidence: 0.82,
  provider: "gemini",
  used_fallback: false,
  report_type: "weekly",
  context_metadata: {
    counts: { goals: 2, exercise_submissions: 3 },
  },
};

describe("specialistAiReportStructuredSummary", () => {
  it("parses valid JSON string into structured sections", () => {
    const parsed = parseAiReportStructuredSummary(JSON.stringify(VALID_AI_SUMMARY));

    assert.equal(parsed.isStructured, true);
    assert.equal(parsed.narrativeSections.length, 5);
    assert.equal(parsed.listSections.length, 4);
    assert.equal(parsed.overview.priorityLevel, "medium");
    assert.equal(parsed.overview.confidencePercent, 82);
    assert.equal(parsed.overview.usedFallback, false);
    assert.deepEqual(parsed.contextMetadata.counts, { goals: 2, exercise_submissions: 3 });
  });

  it("parses already parsed summary objects", () => {
    const parsed = parseAiReportStructuredSummary(VALID_AI_SUMMARY);
    assert.equal(parsed.isStructured, true);
    assert.equal(parsed.narrativeSections[0].id, "executive_summary");
  });

  it("falls back safely for malformed JSON", () => {
    const parsed = parseAiReportStructuredSummary("{not-json");

    assert.equal(parsed.isStructured, false);
    assert.equal(parsed.plainTextFallback, "{not-json");
    assert.equal(parsed.narrativeSections.length, 0);
  });

  it("omits missing optional fields and empty arrays", () => {
    const parsed = parseAiReportStructuredSummary(JSON.stringify({
      executive_summary: "Only summary available.",
      clinical_insights: [],
      recommendations: ["  ", ""],
    }));

    assert.equal(parsed.isStructured, true);
    assert.equal(parsed.narrativeSections.length, 1);
    assert.equal(parsed.listSections.length, 0);
    assert.equal(parsed.overview.priorityLevel, null);
  });

  it("normalizes confidence from 0-1 and clamps display values", () => {
    assert.equal(normalizeAiReportConfidence(0.82), 82);
    assert.equal(normalizeAiReportConfidence(72), 72);
    assert.equal(normalizeAiReportConfidence(140), 100);
    assert.equal(normalizeAiReportConfidence(null), null);
  });

  it("returns null for unknown priority values", () => {
    assert.equal(normalizeAiReportPriority("urgent"), null);
    assert.equal(normalizeAiReportPriority("high"), "high");
  });
});

describe("buildAiReportDetailSections", () => {
  it("maps structured AI summaries to empty legacy sections", () => {
    const { aiStructuredSummary, sections } = buildAiReportDetailSections(
      JSON.stringify(VALID_AI_SUMMARY),
    );

    assert.equal(aiStructuredSummary.isStructured, true);
    assert.equal(sections.length, 0);
  });

  it("maps malformed AI summaries to legacy generic section", () => {
    const { aiStructuredSummary, sections } = buildAiReportDetailSections(
      "Legacy plain text summary.",
    );

    assert.equal(aiStructuredSummary.isStructured, false);
    assert.equal(sections.length, 1);
    assert.equal(sections[0].title, "AI Summary");
    assert.equal(sections[0].content, "Legacy plain text summary.");
  });

  it("does not require structured JSON for regular-style plain summaries", () => {
    const parsed = parseAiReportStructuredSummary("Weekly progress notes for the patient.");
    assert.equal(parsed.isStructured, false);
    assert.equal(parsed.plainTextFallback, "Weekly progress notes for the patient.");
  });
});
