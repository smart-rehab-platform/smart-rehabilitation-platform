import { formatAppDate } from "../../../i18n/formatters.js";
import { formatEmptyDisplay, translateKey } from "./parentLocalizationCore.js";

export const VALID_JOURNEY_PERIODS = ["weekly", "monthly", "full"];

export function buildJourneyPeriodOptions(t) {
  return [
    { value: "weekly", label: translateKey(t, "parent.progress.period.weekly", "Weekly") },
    { value: "monthly", label: translateKey(t, "parent.progress.period.monthly", "Monthly") },
    { value: "full", label: translateKey(t, "parent.treatmentJourney.period.full", "Full Treatment") },
  ];
}

export function getJourneyPeriodLabel(period, t = null) {
  const normalized = String(period || "weekly").trim().toLowerCase();
  if (normalized === "full") {
    return translateKey(t, "parent.treatmentJourney.period.full", "Full Treatment");
  }
  return translateKey(t, `parent.progress.period.${normalized}`, normalized.charAt(0).toUpperCase() + normalized.slice(1));
}

export function getTreatmentJourneyTrendLabel(trend, t = null) {
  switch (String(trend || "").trim().toLowerCase()) {
    case "improving":
      return translateKey(t, "parent.treatmentJourney.trend.improving", "Improving");
    case "declining":
      return translateKey(t, "parent.treatmentJourney.trend.declining", "Needs Attention");
    case "stable":
    default:
      return translateKey(t, "parent.treatmentJourney.trend.stable", "Stable");
  }
}

export function formatTreatmentJourneyPercent(value, t = null) {
  if (value == null || !Number.isFinite(value)) {
    return formatEmptyDisplay(t);
  }
  return `${Math.round(value)}%`;
}

export function formatTreatmentJourneyScoreChange(scoreChange, t = null) {
  if (scoreChange == null || !Number.isFinite(scoreChange)) {
    return formatEmptyDisplay(t);
  }

  const rounded = Math.round(scoreChange);
  if (rounded > 0) {
    return translateKey(t, "parent.treatmentJourney.scoreChangePositive", "+{points} points", { points: rounded });
  }
  if (rounded < 0) {
    return translateKey(t, "parent.treatmentJourney.scoreChangeNegative", "{points} points", { points: rounded });
  }
  return translateKey(t, "parent.treatmentJourney.scoreChangeZero", "0 points");
}

export function formatTreatmentJourneyImprovement(improvementPercentage, t = null) {
  if (improvementPercentage == null || !Number.isFinite(improvementPercentage)) {
    return formatEmptyDisplay(t);
  }

  const rounded = Math.round(improvementPercentage);
  if (rounded > 0) {
    return `+${rounded}%`;
  }
  if (rounded < 0) {
    return `${rounded}%`;
  }
  return "0%";
}

export function formatTreatmentJourneyDisplayDate(date, locale = "en", t = null) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return formatEmptyDisplay(t);
  }
  return formatAppDate(date, locale) ?? formatEmptyDisplay(t);
}

export function formatChartXAxisLabel(date, period, locale = "en") {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const normalizedLocale = locale === "ar" ? "ar" : "en";
  const normalizedPeriod = String(period || "weekly").trim().toLowerCase();

  switch (normalizedPeriod) {
    case "monthly":
      return new Intl.DateTimeFormat(normalizedLocale, { month: "short" }).format(date);
    case "full":
      return new Intl.DateTimeFormat(normalizedLocale, { month: "short", year: "2-digit" }).format(date);
    case "weekly":
    default:
      return new Intl.DateTimeFormat(normalizedLocale, { month: "short", day: "numeric" }).format(date);
  }
}

export function buildTreatmentJourneyInterpretation(journey, t = null) {
  if (!journey?.chartPoints?.length) {
    return {
      title: translateKey(t, "parent.treatmentJourney.interpretation.buildingTitle", "Building your journey"),
      body: translateKey(t, "parent.treatmentJourney.interpretation.needMoreData", "More progress entries are needed to identify a trend."),
    };
  }

  if (journey.chartPoints.length === 1) {
    return {
      title: translateKey(t, "parent.treatmentJourney.interpretation.earlyTitle", "Early progress recorded"),
      body: translateKey(t, "parent.treatmentJourney.interpretation.needMoreData", "More progress entries are needed to identify a trend."),
    };
  }

  switch (String(journey.trend || "").trim().toLowerCase()) {
    case "improving":
      return {
        title: translateKey(t, "parent.treatmentJourney.interpretation.improvingTitle", "Progress is moving upward"),
        body: translateKey(t, "parent.treatmentJourney.interpretation.improvingBody", "The current score is higher than the starting score."),
      };
    case "declining":
      return {
        title: translateKey(t, "parent.treatmentJourney.interpretation.decliningTitle", "Progress needs attention"),
        body: translateKey(
          t,
          "parent.treatmentJourney.interpretation.decliningBody",
          "The latest score is lower than the previous period. Review recent feedback or contact the specialist.",
        ),
      };
    case "stable":
    default:
      return {
        title: translateKey(t, "parent.treatmentJourney.interpretation.stableTitle", "Progress is currently stable"),
        body: translateKey(t, "parent.treatmentJourney.interpretation.stableBody", "Recent scores are staying within a similar range."),
      };
  }
}

export function resolveTreatmentJourneyError(error, t = null) {
  const status = error?.response?.status;

  if (status === 401) {
    return translateKey(t, "parent.treatmentJourney.errors.signInRequired", "Please sign in to view treatment journey progress.");
  }
  if (status === 403) {
    return translateKey(t, "parent.treatmentJourney.errors.accessDenied", "You do not have access to this child's treatment journey.");
  }
  if (status === 404) {
    return translateKey(t, "parent.treatmentJourney.errors.notFound", "Treatment journey data was not found for this child.");
  }

  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage.trim();
  }

  if (error instanceof Error && error.message) {
    return error.message.replace(/^Exception:\s*/i, "");
  }

  return translateKey(t, "parent.treatmentJourney.errors.loadFailed", "Failed to load treatment journey. Please try again.");
}

/** @deprecated Use buildJourneyPeriodOptions(t) */
export const JOURNEY_PERIOD_OPTIONS = buildJourneyPeriodOptions(null);
