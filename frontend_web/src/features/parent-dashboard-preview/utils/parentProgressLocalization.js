import { formatChildDate } from "./parentChildrenLocalization.js";
import { translateKey } from "./parentLocalizationCore.js";

export const PROGRESS_PERIOD_VALUES = ["daily", "weekly", "monthly"];

export function getProgressPeriodLabel(period, t = null) {
  const normalized = typeof period === "string" ? period.trim().toLowerCase() : "";
  const key = normalized ? `parent.progress.period.${normalized}` : null;
  if (key) {
    const fallback = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return translateKey(t, key, fallback);
  }
  return translateKey(t, "parent.progress.period.weekly", "Weekly");
}

export function formatProgressPeriodLabel(start, end, locale = "en", t = null) {
  const startLabel = formatChildDate(start, locale, t);
  const endLabel = formatChildDate(end, locale, t);

  if (startLabel && endLabel) {
    return `${startLabel} – ${endLabel}`;
  }

  return startLabel || endLabel || null;
}

export function getProgressEmptyMessage(t) {
  return translateKey(
    t,
    "parent.progress.empty",
    "Progress data will appear once exercises are tracked.",
  );
}

export function buildProgressPeriodLabels(t) {
  return Object.fromEntries(
    PROGRESS_PERIOD_VALUES.map((value) => [value, getProgressPeriodLabel(value, t)]),
  );
}

/** @deprecated Use buildProgressPeriodLabels(t) */
export const PROGRESS_PERIOD_LABELS = buildProgressPeriodLabels(null);

/** @deprecated Use getProgressEmptyMessage(t) */
export const PROGRESS_EMPTY_MESSAGE = getProgressEmptyMessage(null);
