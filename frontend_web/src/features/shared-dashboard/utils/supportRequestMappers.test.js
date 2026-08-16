import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  buildSupportRequestCategoryFilterOptions,
  buildSupportRequestStatusFilterOptions,
  formatSupportRequestDateTime,
  getSupportRequestCategoryLabel,
  getSupportRequestStatusLabel,
  SUPPORT_REQUEST_CATEGORY_VALUES,
  SUPPORT_REQUEST_STATUS_VALUES,
} from "./supportRequestLocalization.js";

describe("supportRequestLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates shared status labels in English and Arabic", () => {
    assert.equal(getSupportRequestStatusLabel("pending", translateEn), "Pending");
    assert.equal(getSupportRequestStatusLabel("in_progress", translateEn), "In Progress");
    assert.equal(getSupportRequestStatusLabel("resolved", translateEn), "Resolved");

    assert.equal(getSupportRequestStatusLabel("pending", translateAr), "قيد الانتظار");
    assert.equal(getSupportRequestStatusLabel("in_progress", translateAr), "قيد المعالجة");
    assert.equal(getSupportRequestStatusLabel("resolved", translateAr), "محلول");
  });

  it("translates shared category labels in English and Arabic", () => {
    assert.equal(getSupportRequestCategoryLabel("technical_issue", translateEn), "Technical Issue");
    assert.equal(getSupportRequestCategoryLabel("patient_case_issue", translateAr), "مشكلة مريض / حالة");
  });

  it("preserves backend enum values in filter builders", () => {
    const statusOptions = buildSupportRequestStatusFilterOptions(translateEn);
    const categoryOptions = buildSupportRequestCategoryFilterOptions(translateEn);

    assert.deepEqual(statusOptions.map((option) => option.value), SUPPORT_REQUEST_STATUS_VALUES);
    assert.deepEqual(categoryOptions.map((option) => option.value), SUPPORT_REQUEST_CATEGORY_VALUES);
  });

  it("localizes mapped labels while keeping backend enum values distinct", () => {
    const pendingEn = getSupportRequestStatusLabel("pending", translateEn);
    const pendingAr = getSupportRequestStatusLabel("pending", translateAr);

    assert.notEqual(pendingEn, pendingAr);
    assert.equal(pendingEn, "Pending");
    assert.equal(pendingAr, "قيد الانتظار");
  });

  it("formats support request dates using the app locale", () => {
    const formatted = formatSupportRequestDateTime("2026-03-15T10:00:00.000Z", "ar", translateEn);

    assert.ok(formatted);
    assert.notEqual(formatted, "Date unavailable");
  });

  it("falls back to English labels when t is unavailable", () => {
    assert.equal(getSupportRequestStatusLabel("pending"), "Pending");
    assert.equal(getSupportRequestCategoryLabel("other"), "Other");
  });
});
