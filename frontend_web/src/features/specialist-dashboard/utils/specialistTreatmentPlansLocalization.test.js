import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  TREATMENT_PLAN_STATUS_VALUES,
  TREATMENT_PLAN_VALIDATION_KEYS,
  applyTreatmentPlanGoalsLocalization,
  applyTreatmentPlanListItemLocalization,
  buildTreatmentPlanFilters,
  formatTreatmentPlanDateRange,
  formatTreatmentPlanDisplayDate,
  getTreatmentPlanStatusLabel,
  getTreatmentPlanValidationMessage,
  validateTreatmentPlanEditForm,
} from "./specialistTreatmentPlansLocalization.js";

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

describe("specialistTreatmentPlansLocalization", () => {
  it("maps treatment plan filters and statuses in EN/AR", () => {
    const enFilters = buildTreatmentPlanFilters(tFactory("en"));
    const arFilters = buildTreatmentPlanFilters(tFactory("ar"));

    assert.equal(enFilters.find((item) => item.id === "all")?.label, "All");
    assert.equal(arFilters.find((item) => item.id === "active")?.label, "نشطة");
    assert.equal(getTreatmentPlanStatusLabel("completed", tFactory("en")), "Completed");
    assert.equal(getTreatmentPlanStatusLabel("completed", tFactory("ar")), "مكتملة");
  });

  it("preserves API status values while localizing display labels", () => {
    TREATMENT_PLAN_STATUS_VALUES.forEach((status) => {
      const localized = applyTreatmentPlanListItemLocalization({
        id: "plan-1",
        title: "Speech Plan",
        patientName: "Patient A",
        status,
        startDate: "2026-01-15",
        endDate: "2026-06-15",
      }, { t: tFactory("ar"), locale: "ar" });

      assert.equal(localized.status, status);
      assert.notEqual(localized.statusLabel, status);
    });
  });

  it("localizes goal UI labels without changing goal descriptions", () => {
    const goals = applyTreatmentPlanGoalsLocalization([
      {
        id: "goal-1",
        title: "Improve articulation",
        term: "short_term",
        termLabel: "Short-term",
        completionPercent: 40,
      },
    ], { t: tFactory("ar") });

    assert.equal(goals[0].title, "Improve articulation");
    assert.equal(goals[0].term, "short_term");
    assert.equal(goals[0].termLabel, "قصير المدى");
  });

  it("formats plan dates using app locale", () => {
    assert.match(formatTreatmentPlanDisplayDate("2026-07-26", "en"), /Jul/);
    assert.match(formatTreatmentPlanDisplayDate("2026-07-26", "ar"), /يوليو|‏/);
    assert.match(formatTreatmentPlanDateRange("2026-01-01", "2026-02-01", "en"), /Jan/);
  });

  it("localizes validation messages while preserving validation keys", () => {
    assert.equal(
      validateTreatmentPlanEditForm({ title: "", startDate: "2026-01-01", endDate: "" }),
      TREATMENT_PLAN_VALIDATION_KEYS.TITLE_REQUIRED,
    );
    assert.equal(
      getTreatmentPlanValidationMessage(TREATMENT_PLAN_VALIDATION_KEYS.END_DATE_BEFORE_START, tFactory("ar")),
      "لا يمكن أن يكون تاريخ الانتهاء قبل تاريخ البدء",
    );
  });

  it("keeps plan title unchanged during list localization", () => {
    const localized = applyTreatmentPlanListItemLocalization({
      id: "plan-1",
      title: "Weekly Speech Goals",
      patientName: "Ahmed",
      status: "active",
      startDate: "2026-03-01",
      endDate: null,
    }, { t: tFactory("ar"), locale: "ar" });

    assert.equal(localized.title, "Weekly Speech Goals");
    assert.equal(localized.patientName, "Ahmed");
    assert.equal(localized.status, "active");
  });

  it("falls back to English labels when t is unavailable", () => {
    assert.equal(getTreatmentPlanStatusLabel("archived", null), "Archived");
    assert.equal(buildTreatmentPlanFilters(null).find((item) => item.id === "completed")?.label, "Completed");
  });
});
