export const LANGUAGE_OPTIONS = Object.freeze([
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
]);

export function getLanguageLabelForLocale(locale) {
  return locale === "ar" ? "العربية" : "English";
}

export function isLanguageOptionSelected(locale, code) {
  return locale === code;
}

export function applyLanguageSelection(setLocale, code) {
  if (typeof setLocale !== "function") {
    return;
  }

  setLocale(code);
}
