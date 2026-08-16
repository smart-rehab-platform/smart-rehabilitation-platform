import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LANGUAGE_OPTIONS,
  applyLanguageSelection,
  getLanguageLabelForLocale,
  isLanguageOptionSelected,
} from "./languageSelectorUtils.js";
import { setStoredLocale } from "../../services/localeStorage.js";

describe("languageSelectorUtils", () => {
  it("exposes self-identifying language option labels", () => {
    assert.deepEqual(LANGUAGE_OPTIONS, [
      { code: "en", label: "English" },
      { code: "ar", label: "العربية" },
    ]);
  });

  it("returns the current locale display label", () => {
    assert.equal(getLanguageLabelForLocale("en"), "English");
    assert.equal(getLanguageLabelForLocale("ar"), "العربية");
  });

  it("marks the active locale option", () => {
    assert.equal(isLanguageOptionSelected("en", "en"), true);
    assert.equal(isLanguageOptionSelected("en", "ar"), false);
    assert.equal(isLanguageOptionSelected("ar", "ar"), true);
  });

  it("calls setLocale with English or Arabic without reloading", () => {
    let currentLocale = "en";
    const setLocale = (nextLocale) => {
      currentLocale = nextLocale;
    };

    applyLanguageSelection(setLocale, "ar");
    assert.equal(currentLocale, "ar");

    applyLanguageSelection(setLocale, "en");
    assert.equal(currentLocale, "en");
  });

  it("persists locale through the existing storage layer", () => {
    const storage = new Map();

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key) => (storage.has(key) ? storage.get(key) : null),
        setItem: (key, value) => storage.set(key, String(value)),
        removeItem: (key) => storage.delete(key),
      },
    });

    assert.equal(setStoredLocale("ar"), "ar");
    assert.equal(storage.get("app_locale_language_code"), "ar");
    assert.equal(setStoredLocale("en"), "en");
    assert.equal(storage.get("app_locale_language_code"), "en");
  });
});
