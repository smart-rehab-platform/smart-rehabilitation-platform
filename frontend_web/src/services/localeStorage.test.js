import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getStoredLocale,
  normalizeLocale,
  setStoredLocale,
} from "./localeStorage.js";

const AUTH_TOKEN_KEY = "auth_token";

function createMemoryStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe("localeStorage", () => {
  /** @type {Storage | null} */
  let originalLocalStorage;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it("defaults to English when nothing is persisted", () => {
    assert.equal(getStoredLocale(), DEFAULT_LOCALE);
    assert.equal(normalizeLocale(undefined), DEFAULT_LOCALE);
  });

  it("falls back to English for invalid persisted values", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "fr");
    assert.equal(getStoredLocale(), DEFAULT_LOCALE);

    localStorage.setItem(LOCALE_STORAGE_KEY, "");
    assert.equal(getStoredLocale(), DEFAULT_LOCALE);

    localStorage.setItem(LOCALE_STORAGE_KEY, "   ");
    assert.equal(getStoredLocale(), DEFAULT_LOCALE);
  });

  it("persists Arabic and English locales", () => {
    assert.equal(setStoredLocale("ar"), "ar");
    assert.equal(localStorage.getItem(LOCALE_STORAGE_KEY), "ar");
    assert.equal(getStoredLocale(), "ar");

    assert.equal(setStoredLocale("en"), "en");
    assert.equal(localStorage.getItem(LOCALE_STORAGE_KEY), "en");
    assert.equal(getStoredLocale(), "en");
  });

  it("normalizes locale casing and whitespace before persisting", () => {
    assert.equal(setStoredLocale(" AR "), "ar");
    assert.equal(localStorage.getItem(LOCALE_STORAGE_KEY), "ar");
  });

  it("does not modify auth/session storage keys", () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "session-token");
    localStorage.setItem("remember_me", "true");

    setStoredLocale("ar");

    assert.equal(localStorage.getItem(AUTH_TOKEN_KEY), "session-token");
    assert.equal(localStorage.getItem("remember_me"), "true");
    assert.equal(localStorage.getItem(LOCALE_STORAGE_KEY), "ar");
  });
});
