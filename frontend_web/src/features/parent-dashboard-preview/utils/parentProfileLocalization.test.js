import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  formatOptionalProfileValue,
  getProfileEmptyMessages,
  getProfileRoleLabel,
  getProfileValidationMessages,
} from "./parentProfileLocalization.js";

describe("parentProfileLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates profile labels and empty states", () => {
    assert.equal(getProfileRoleLabel(translateEn), "Parent");
    assert.equal(getProfileRoleLabel(translateAr), "ولي الأمر");
    assert.match(getProfileEmptyMessages(translateEn).loadError, /couldn't load/i);
    assert.match(getProfileValidationMessages(translateAr).fullNameRequired, /الاسم الكامل/);
  });

  it("formats optional profile values with locale-aware empty display", () => {
    assert.equal(formatOptionalProfileValue(null, translateEn), "—");
    assert.equal(formatOptionalProfileValue("Cairo", translateEn), "Cairo");
  });
});
