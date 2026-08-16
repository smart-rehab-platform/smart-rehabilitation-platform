import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  applyPatientDetailsLocalization,
  FAMILY_PATTERN_DISCLAIMER_EN,
  formatPatientDisplayDate,
  getFamilyPatternDisclaimerLabel,
  getPatientReviewStatusLabel,
  localizeFamilyPatternDisclaimer,
} from "./specialistPatientsLocalization.js";
function tFactory(locale) {
  const messages = locale === "ar" ? ar : en;
  return (key) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    return typeof value === "string" ? value : key;
  };
}

describe("specialistPatientsLocalization", () => {
  it("maps review status labels in EN/AR while preserving raw values", () => {
    assert.equal(getPatientReviewStatusLabel("pending", tFactory("en")), "Pending");
    assert.equal(getPatientReviewStatusLabel("reviewed", tFactory("ar")), "تمت المراجعة");
  });

  it("formats patient dates using app locale", () => {
    const value = "2026-03-15T10:00:00.000Z";
    assert.match(formatPatientDisplayDate(value, "en"), /Mar/);
    assert.match(formatPatientDisplayDate(value, "ar"), /مارس|‏/);
  });

  it("localizes patient details bundle labels without changing clinical data", () => {
    const base = {
      patient: { fullName: "Sara Ali", age: 8 },
      diagnosis: "Autism Spectrum",
      goals: [{ id: "g1", title: "Improve speech", term: "short_term", termLabel: "Short-term" }],
      treatmentPlan: {
        id: "tp1",
        title: "Speech Plan",
        status: "active",
        statusLabel: "Active",
        startDate: "2026-01-01T00:00:00.000Z",
        endDate: null,
      },
      assignedExercises: [],
      recentSubmissions: [{
        id: "s1",
        exerciseTitle: "Breathing Exercise",
        reviewStatusRaw: "pending",
        reviewStatus: "Pending",
        submittedAt: "2026-02-01T12:00:00.000Z",
      }],
      notes: [{ id: "n1", note: "Clinical note body", specialistName: "Dr. Noor", createdAt: "2026-02-02T09:00:00.000Z" }],
    };

    const localized = applyPatientDetailsLocalization(base, { t: tFactory("ar"), locale: "ar" });

    assert.equal(localized.patient.fullName, "Sara Ali");
    assert.equal(localized.goals[0].title, "Improve speech");
    assert.equal(localized.notes[0].note, "Clinical note body");
    assert.equal(localized.goals[0].termLabel, "قصير المدى");
    assert.equal(localized.recentSubmissions[0].reviewStatus, "قيد الانتظار");
    assert.equal(localized.recentSubmissions[0].reviewStatusRaw, "pending");
  });

  it("localizes the family pattern disclaimer in EN/AR without changing unknown backend text", () => {
    assert.equal(
      getFamilyPatternDisclaimerLabel(tFactory("en")),
      FAMILY_PATTERN_DISCLAIMER_EN,
    );
    assert.equal(
      localizeFamilyPatternDisclaimer(FAMILY_PATTERN_DISCLAIMER_EN, tFactory("ar")),
      "تحدد هذه الميزة الخصائص المتكررة بين الأطفال المرتبطين بحساب ولي الأمر نفسه. ولا تُستخدم لتشخيص الحالات الوراثية أو الجينية.",
    );
    assert.equal(
      localizeFamilyPatternDisclaimer("Custom backend disclaimer", tFactory("ar")),
      "Custom backend disclaimer",
    );
  });
});
