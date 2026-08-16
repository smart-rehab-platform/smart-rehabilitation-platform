export const LOCALE_STORAGE_KEY = "app_locale_language_code";
export const SUPPORTED_LOCALES = Object.freeze(["en", "ar"]);
export const DEFAULT_LOCALE = "en";

export function normalizeLocale(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (normalized === "ar") {
    return "ar";
  }

  return DEFAULT_LOCALE;
}

function getLocalStorage() {
  if (typeof globalThis === "undefined") {
    return null;
  }

  return globalThis.localStorage ?? null;
}

export function getStoredLocale() {
  const storage = getLocalStorage();

  if (!storage) {
    return DEFAULT_LOCALE;
  }

  return normalizeLocale(storage.getItem(LOCALE_STORAGE_KEY));
}

export function setStoredLocale(locale) {
  const normalized = normalizeLocale(locale);
  const storage = getLocalStorage();

  if (storage) {
    storage.setItem(LOCALE_STORAGE_KEY, normalized);
  }

  return normalized;
}
