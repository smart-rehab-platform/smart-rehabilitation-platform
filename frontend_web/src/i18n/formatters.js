export function formatAppDateTime(value, locale = "en") {
  const date = value instanceof Date ? value : new Date(value);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const normalizedLocale = locale === "ar" ? "ar" : "en";

  return new Intl.DateTimeFormat(normalizedLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatAppDate(value, locale = "en") {
  const date = value instanceof Date ? value : new Date(value);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const normalizedLocale = locale === "ar" ? "ar" : "en";

  return new Intl.DateTimeFormat(normalizedLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
