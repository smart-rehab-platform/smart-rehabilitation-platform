import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  JOURNEY_PERIOD_OPTIONS,
  buildTreatmentJourneyInterpretation,
  calculateXAxisLabelIndices,
  isValidJourneyPeriod,
  journeyHasData,
  mapTreatmentJourneyChartPoint,
  mapTreatmentJourneyResponse,
  normalizeJourneyPeriod,
  resolveTreatmentJourneyError,
  treatmentJourneyPreviewScores,
  treatmentJourneyTrendLabel,
} from "./parentTreatmentJourneyUtils.js";

describe("parentTreatmentJourneyUtils", () => {
  it("normalizes valid journey periods", () => {
    assert.equal(normalizeJourneyPeriod("monthly"), "monthly");
    assert.equal(normalizeJourneyPeriod("FULL"), "full");
    assert.equal(normalizeJourneyPeriod("invalid"), "weekly");
  });

  it("validates journey periods", () => {
    assert.equal(isValidJourneyPeriod("weekly"), true);
    assert.equal(isValidJourneyPeriod("monthly"), true);
    assert.equal(isValidJourneyPeriod("full"), true);
    assert.equal(isValidJourneyPeriod("daily"), false);
  });

  it("maps treatment journey response and chart points safely", () => {
    const journey = mapTreatmentJourneyResponse({
      patient_id: "patient-1",
      period: "weekly",
      starting_score: 40,
      current_score: 55,
      score_change: 15,
      trend: "improving",
      chart_points: [
        {
          date: "2026-07-01",
          score: 40,
          exercises_completed: 2,
          improvement_percentage: 5,
        },
        {
          date: "2026-07-08",
          score: "bad",
        },
        {
          date: "2026-07-15",
          score: 55,
          exercises_completed: 3,
        },
      ],
    });

    assert.ok(journey);
    assert.equal(journey.patientId, "patient-1");
    assert.equal(journey.period, "weekly");
    assert.equal(journey.currentScore, 55);
    assert.equal(journey.chartPoints.length, 2);
    assert.equal(journeyHasData(journey), true);
  });

  it("maps malformed chart points to null", () => {
    assert.equal(mapTreatmentJourneyChartPoint({ date: "2026-01-01" }), null);
    assert.equal(mapTreatmentJourneyChartPoint({ score: 50 }), null);
  });

  it("maps trend labels like Flutter", () => {
    assert.equal(treatmentJourneyTrendLabel("improving"), "Improving");
    assert.equal(treatmentJourneyTrendLabel("declining"), "Needs Attention");
    assert.equal(treatmentJourneyTrendLabel("stable"), "Stable");
  });

  it("builds interpretation from journey trend", () => {
    const improving = buildTreatmentJourneyInterpretation(mapTreatmentJourneyResponse({
      trend: "improving",
      chart_points: [
        { date: "2026-07-01", score: 40 },
        { date: "2026-07-08", score: 55 },
      ],
    }));

    assert.match(improving.title, /upward/i);

    const empty = buildTreatmentJourneyInterpretation(null);
    assert.match(empty.body, /More progress entries/i);
  });

  it("calculates preview scores and axis label indices", () => {
    const points = [
      { score: 10 },
      { score: 20 },
      { score: 30 },
      { score: 40 },
      { score: 50 },
      { score: 60 },
    ].map((entry, index) => ({
      ...entry,
      date: new Date(`2026-07-0${index + 1}`),
    }));

    assert.deepEqual(treatmentJourneyPreviewScores(points), [20, 30, 40, 50, 60]);
    assert.deepEqual(calculateXAxisLabelIndices(2), [0, 1]);
    assert.deepEqual(calculateXAxisLabelIndices(10, 4), [0, 3, 6, 9]);
  });

  it("resolves friendly treatment journey errors by status", () => {
    assert.match(
      resolveTreatmentJourneyError({ response: { status: 401 } }),
      /sign in/i,
    );
    assert.match(
      resolveTreatmentJourneyError({ response: { status: 403 } }),
      /do not have access/i,
    );
    assert.match(
      resolveTreatmentJourneyError({ response: { status: 404 } }),
      /not found/i,
    );
    assert.match(
      resolveTreatmentJourneyError({ response: { status: 500 } }),
      /Failed to load treatment journey/i,
    );
  });

  it("exposes the three journey period options", () => {
    assert.deepEqual(
      JOURNEY_PERIOD_OPTIONS.map((option) => option.value),
      ["weekly", "monthly", "full"],
    );
  });
});
