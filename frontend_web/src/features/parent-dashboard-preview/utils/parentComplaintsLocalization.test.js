import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  buildParentComplaintCategoryOptions,
  COMPLAINT_CATEGORY_VALUES,
  getParentComplaintCategoryLabel,
  getParentComplaintStatusLabel,
} from "./parentComplaintsLocalization.js";

describe("parentComplaintsLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates complaint statuses and categories", () => {
    assert.equal(getParentComplaintStatusLabel("pending", translateEn), "Pending");
    assert.equal(getParentComplaintStatusLabel("under_review", translateAr), "قيد المراجعة");
    assert.equal(getParentComplaintCategoryLabel("specialist_not_responding", translateAr), "الأخصائي لا يرد");
  });

  it("preserves backend enum values in category options", () => {
    const options = buildParentComplaintCategoryOptions(translateEn);
    assert.deepEqual(options.map((option) => option.value), COMPLAINT_CATEGORY_VALUES);
  });
});
