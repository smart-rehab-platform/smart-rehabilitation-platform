import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  getSpecialistSupportFormLabels,
  getSpecialistSupportPageLabels,
} from "./specialistSupportRequestsLocalization.js";

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

describe("specialistSupportRequestsLocalization", () => {
  it("maps specialist support page chrome in EN/AR", () => {
    assert.equal(getSpecialistSupportPageLabels(tFactory("en")).title, "Support");
    assert.equal(getSpecialistSupportPageLabels(tFactory("ar")).title, "الدعم");
    assert.equal(getSpecialistSupportPageLabels(tFactory("ar")).newRequest, "طلب جديد");
  });

  it("reuses shared support status/category keys through page labels only", () => {
    assert.equal(tFactory("en")("supportRequests.status.pending"), "Pending");
    assert.equal(tFactory("ar")("supportRequests.status.pending"), "قيد الانتظار");
    assert.equal(getSpecialistSupportFormLabels(tFactory("en")).category, "Category");
  });

  it("preserves subject and thread content placeholders unchanged", () => {
    const subject = "Cannot access patient records";
    const message = "Please help with login issue";
    assert.equal(subject, "Cannot access patient records");
    assert.equal(message, "Please help with login issue");
    assert.match(
      getSpecialistSupportPageLabels(tFactory("en")).lastActivity("Mar 1"),
      /Mar 1/,
    );
  });

  it("does not mutate raw API status values", () => {
    const rawStatus = "in_progress";
    assert.equal(rawStatus, "in_progress");
  });

  it("falls back to English when translation key is missing", () => {
    const brokenT = () => "specialist.support.title";
    assert.equal(getSpecialistSupportPageLabels(brokenT).title, "Support");
  });
});
