import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyDocumentLocale,
  createTranslator,
  getLocaleDirection,
  interpolate,
  isRtlLocale,
  resolveTranslation,
} from "./index.js";

describe("i18n foundation", () => {
  it("resolves nested translation keys", () => {
    const translateEn = createTranslator("en");

    assert.equal(translateEn("common.save"), "Save");
    assert.equal(translateEn("common.language"), "Language");
  });

  it("falls back to English when Arabic translation is missing", () => {
    const catalogs = {
      en: {
        common: {
          save: "Save",
          missingInArabic: "English only",
        },
      },
      ar: {
        common: {
          save: "حفظ",
        },
      },
    };

    const translateAr = createTranslator("ar", catalogs);

    assert.equal(translateAr("common.save"), "حفظ");
    assert.equal(translateAr("common.missingInArabic"), "English only");
    assert.equal(resolveTranslation("ar", "common.unknown", catalogs), undefined);
  });

  it("returns an empty string instead of undefined/null/raw keys when no translation exists", () => {
    const translateEn = createTranslator("en");

    assert.equal(translateEn("common.notDefined"), "");
    assert.equal(translateEn(""), "");
  });

  it("supports interpolation placeholders", () => {
    const catalogs = {
      en: {
        common: {
          greeting: "Hello, {name}",
        },
      },
      ar: {
        common: {
          greeting: "مرحباً، {name}",
        },
      },
    };

    const translateEn = createTranslator("en", catalogs);
    const translateAr = createTranslator("ar", catalogs);

    assert.equal(translateEn("common.greeting", { name: "Sara" }), "Hello, Sara");
    assert.equal(translateAr("common.greeting", { name: "Sara" }), "مرحباً، Sara");
    assert.equal(interpolate("Count: {count}", { count: 3 }), "Count: 3");
  });

  it("creates independent translators without requiring a page reload", () => {
    const before = createTranslator("en");
    const after = createTranslator("ar");

    assert.equal(before("common.save"), "Save");
    assert.equal(after("common.save"), "حفظ");
    assert.notEqual(before("common.save"), after("common.save"));
  });

  it("sets English document attributes", () => {
    const root = { lang: "", dir: "" };

    applyDocumentLocale("en", root);

    assert.equal(root.lang, "en");
    assert.equal(root.dir, "ltr");
    assert.equal(isRtlLocale("en"), false);
    assert.equal(getLocaleDirection("en"), "ltr");
  });

  it("sets Arabic document attributes", () => {
    const root = { lang: "", dir: "" };

    applyDocumentLocale("ar", root);

    assert.equal(root.lang, "ar");
    assert.equal(root.dir, "rtl");
    assert.equal(isRtlLocale("ar"), true);
    assert.equal(getLocaleDirection("ar"), "rtl");
  });
});
