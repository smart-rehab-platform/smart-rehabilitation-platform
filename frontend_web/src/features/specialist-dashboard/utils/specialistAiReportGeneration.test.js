import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_REPORT_TYPES,
  buildAiReportGeneratePayload,
  defaultMonthlyAiReportPeriod,
  defaultWeeklyAiReportPeriod,
  formatSpecialistAiReportDate,
  normalizeAiReportLanguage,
  resolveAiReportGeneratePath,
  validateSpecialistAiReportGeneration,
} from "./specialistAiReportGeneration.js";

describe("specialistAiReportGeneration", () => {
  const fixedNow = new Date(2026, 7, 13);

  it("calculates weekly default period as 7 inclusive days ending today", () => {
    const period = defaultWeeklyAiReportPeriod(fixedNow);
    assert.equal(period.start, "2026-08-07");
    assert.equal(period.end, "2026-08-13");
  });

  it("calculates monthly default period as 30 inclusive days ending today", () => {
    const period = defaultMonthlyAiReportPeriod(fixedNow);
    assert.equal(period.start, "2026-07-15");
    assert.equal(period.end, "2026-08-13");
  });

  it("formats calendar dates without UTC conversion", () => {
    assert.equal(formatSpecialistAiReportDate(new Date(2026, 0, 5)), "2026-01-05");
    assert.equal(formatSpecialistAiReportDate("2026-01-05"), "2026-01-05");
  });

  it("validates period ordering and end date rules", () => {
    assert.equal(
      validateSpecialistAiReportGeneration({
        patientId: "patient-1",
        reportType: AI_REPORT_TYPES.WEEKLY,
        periodStart: "2026-08-10",
        periodEnd: "2026-08-07",
        now: fixedNow,
      }),
      "period_start cannot be after period_end",
    );

    assert.equal(
      validateSpecialistAiReportGeneration({
        patientId: "patient-1",
        reportType: AI_REPORT_TYPES.WEEKLY,
        periodStart: "2026-08-01",
        periodEnd: "2026-08-20",
        now: fixedNow,
      }),
      "Cannot generate report for a period that has not ended yet",
    );

    assert.equal(
      validateSpecialistAiReportGeneration({
        patientId: "patient-1",
        reportType: AI_REPORT_TYPES.MONTHLY,
        periodStart: "2026-07-15",
        periodEnd: "2026-08-13",
        now: fixedNow,
      }),
      null,
    );
  });

  it("builds request payload without specialist_id and includes language", () => {
    const payload = buildAiReportGeneratePayload({
      patientId: " patient-1 ",
      reportType: AI_REPORT_TYPES.WEEKLY,
      periodStart: "2026-08-07",
      periodEnd: "2026-08-13",
      language: "ar-SA",
    });

    assert.deepEqual(payload, {
      patient_id: "patient-1",
      period_start: "2026-08-07",
      period_end: "2026-08-13",
      language: "ar",
      reportType: "weekly",
    });
    assert.equal("specialist_id" in payload, false);
  });

  it("normalizes locale variants and defaults missing language to en", () => {
    assert.equal(normalizeAiReportLanguage("ar-PS"), "ar");
    assert.equal(normalizeAiReportLanguage("en-GB"), "en");
    assert.equal(normalizeAiReportLanguage(undefined), "en");
    assert.equal(normalizeAiReportLanguage("fr"), "en");
  });

  it("selects weekly and monthly generate endpoints explicitly", () => {
    assert.equal(resolveAiReportGeneratePath(AI_REPORT_TYPES.WEEKLY), "/ai/reports/generate-weekly");
    assert.equal(resolveAiReportGeneratePath(AI_REPORT_TYPES.MONTHLY), "/ai/reports/generate-monthly");
    assert.equal(resolveAiReportGeneratePath("assessment"), null);
  });
});
