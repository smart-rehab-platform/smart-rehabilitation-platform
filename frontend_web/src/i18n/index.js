import ar from "./ar.json" with { type: "json" };
import en from "./en.json" with { type: "json" };

export const localeMessages = Object.freeze({
  en,
  ar,
});

const INTERPOLATION_PATTERN = /\{(\w+)\}/g;

function getNestedString(source, keyPath) {
  if (!source || typeof keyPath !== "string" || !keyPath.trim()) {
    return undefined;
  }

  let current = source;

  for (const segment of keyPath.split(".")) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }

    current = current[segment];
  }

  return typeof current === "string" ? current : undefined;
}

export function interpolate(template, params) {
  if (typeof template !== "string") {
    return "";
  }

  if (!params || typeof params !== "object") {
    return template;
  }

  return template.replace(INTERPOLATION_PATTERN, (_, token) => {
    const value = params[token];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function isRtlLocale(locale) {
  return locale === "ar";
}

export function getLocaleDirection(locale) {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

export function applyDocumentLocale(locale, rootElement = null) {
  const root =
    rootElement ??
    (typeof document !== "undefined" ? document.documentElement : null);

  if (!root) {
    return;
  }

  root.lang = locale;
  root.dir = getLocaleDirection(locale);
}

export function resolveTranslation(locale, key, catalogs = localeMessages) {
  const normalizedLocale = locale === "ar" ? "ar" : "en";
  const primaryCatalog = catalogs[normalizedLocale] ?? catalogs.en;
  const fallbackCatalog = catalogs.en;

  let value = getNestedString(primaryCatalog, key);

  if (value === undefined && normalizedLocale !== "en") {
    value = getNestedString(fallbackCatalog, key);
  }

  return value;
}

export function createTranslator(locale, catalogs = localeMessages) {
  return function translate(key, params) {
    const resolved = resolveTranslation(locale, key, catalogs);

    if (resolved === undefined) {
      return "";
    }

    return interpolate(resolved, params);
  };
}
