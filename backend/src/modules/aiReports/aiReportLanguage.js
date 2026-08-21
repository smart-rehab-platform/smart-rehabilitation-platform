const ALLOWED_AI_REPORT_LANGUAGES = new Set(["en", "ar"]);
const DEFAULT_AI_REPORT_LANGUAGE = "en";

/**
 * Normalize client locale/language into a supported AI report language.
 * Accepts: en, en-US, ar, ar-SA, ar-PS, etc.
 * Missing/empty → "en". Unsupported → null (caller may reject).
 */
const normalizeAiReportLanguage = (value, { fallbackToDefault = false } = {}) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallbackToDefault ? DEFAULT_AI_REPORT_LANGUAGE : DEFAULT_AI_REPORT_LANGUAGE;
  }

  const normalized = String(value).trim().toLowerCase().replace(/_/g, "-");
  const primary = normalized.split("-")[0];

  if (ALLOWED_AI_REPORT_LANGUAGES.has(primary)) {
    return primary;
  }

  return fallbackToDefault ? DEFAULT_AI_REPORT_LANGUAGE : null;
};

const parseAiReportLanguage = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return DEFAULT_AI_REPORT_LANGUAGE;
  }

  const normalized = String(value).trim().toLowerCase().replace(/_/g, "-");
  const primary = normalized.split("-")[0];

  if (ALLOWED_AI_REPORT_LANGUAGES.has(primary)) {
    return primary;
  }

  return null;
};

module.exports = {
  ALLOWED_AI_REPORT_LANGUAGES,
  DEFAULT_AI_REPORT_LANGUAGE,
  normalizeAiReportLanguage,
  parseAiReportLanguage,
};
