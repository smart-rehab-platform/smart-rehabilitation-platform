import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  CASE_REQUEST_STATUS_VALUES,
  buildCaseRequestStatusFilterOptions,
  getCaseRequestCategoryLabel,
  getCaseRequestStatusLabel,
  getCaseRequestStatusSubtitle,
} from "./parentCaseRequestsLocalization.js";

describe("parentCaseRequestsLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates case request status labels", () => {
    assert.equal(getCaseRequestStatusLabel("pending", translateEn), "Pending Review");
    assert.equal(getCaseRequestStatusLabel("under_assessment", translateAr), "قيد التقييم");
    assert.equal(getCaseRequestStatusSubtitle("accepted", translateEn), "Case accepted; profile may be created soon.");
    assert.equal(
      getCaseRequestStatusSubtitle("converted_to_patient", translateAr),
      "تم قبول الحالة وإنشاء ملف المريض.",
    );
  });

  it("translates known case request category labels and preserves unknown values", () => {
    assert.equal(
      getCaseRequestCategoryLabel("Behavioral Therapy", translateEn),
      "Behavioral Therapy",
    );
    assert.equal(
      getCaseRequestCategoryLabel("Behavioral Therapy", translateAr),
      "العلاج السلوكي",
    );
    assert.equal(
      getCaseRequestCategoryLabel("Custom Category", translateAr),
      "Custom Category",
    );
  });

  it("preserves backend enum values in status filter options", () => {
    const options = buildCaseRequestStatusFilterOptions(translateEn);
    const statusIds = options.filter((option) => option.id !== "all").map((option) => option.id);
    assert.deepEqual(statusIds, CASE_REQUEST_STATUS_VALUES);
  });
});
