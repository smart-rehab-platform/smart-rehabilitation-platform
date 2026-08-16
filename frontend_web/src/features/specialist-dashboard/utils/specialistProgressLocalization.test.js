import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import { buildSpecialistPatientDetailPath } from "../../../routes/specialistDashboardRoutes.js";
import {
  applySpecialistPatientProgressListLocalization,
  formatProgressUpdatedLabel,
  getSpecialistProgressPageLabels,
} from "./specialistProgressLocalization.js";

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

describe("specialistProgressLocalization", () => {
  it("maps progress page labels in EN/AR using Flutter terminology", () => {
    assert.equal(getSpecialistProgressPageLabels(tFactory("en")).title, "Patient Progress");
    assert.equal(getSpecialistProgressPageLabels(tFactory("ar")).title, "تقدم المريض");
    assert.equal(getSpecialistProgressPageLabels(tFactory("ar")).empty, "لا تتوفر بيانات تقدم بعد.");
  });

  it("preserves patient names and progress values while localizing UI labels", () => {
    const localized = applySpecialistPatientProgressListLocalization([
      {
        patientId: "patient-1",
        patientName: "Layla Hassan",
        percent: 80,
        profileImageUrl: null,
        updatedAt: new Date("2026-01-11T10:00:00.000Z"),
      },
    ], { t: tFactory("ar"), locale: "ar" });

    assert.equal(localized[0].patientName, "Layla Hassan");
    assert.equal(localized[0].percent, 80);
    assert.equal(localized[0].patientId, "patient-1");
    assert.ok(localized[0].updatedLabel);
    assert.equal(
      localized[0].patientDetailPath,
      buildSpecialistPatientDetailPath("patient-1"),
    );
  });

  it("formats latest update labels using the active locale", () => {
    const updatedAt = new Date("2026-01-11T10:00:00.000Z");
    const english = formatProgressUpdatedLabel(updatedAt, { t: tFactory("en"), locale: "en" });
    const arabic = formatProgressUpdatedLabel(updatedAt, { t: tFactory("ar"), locale: "ar" });

    assert.match(english, /Latest update:/);
    assert.match(arabic, /آخر تحديث:/);
  });

  it("builds the existing patient details route without altering ids", () => {
    assert.equal(
      buildSpecialistPatientDetailPath("patient-42"),
      "/dashboard/specialist/patients/patient-42",
    );
  });

  it("falls back to English labels when translations are missing", () => {
    const brokenT = () => "specialist.progress.title";
    assert.equal(getSpecialistProgressPageLabels(brokenT).title, "Patient Progress");
  });
});
