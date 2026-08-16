import { resolveMapperContext } from "./parentLocalizationCore.js";
import {
  buildJourneyPeriodOptions,
  buildTreatmentJourneyInterpretation,
  formatChartXAxisLabel,
  formatTreatmentJourneyDisplayDate,
  formatTreatmentJourneyImprovement,
  formatTreatmentJourneyPercent,
  formatTreatmentJourneyScoreChange,
  getJourneyPeriodLabel,
  getTreatmentJourneyTrendLabel,
  JOURNEY_PERIOD_OPTIONS,
  resolveTreatmentJourneyError,
  VALID_JOURNEY_PERIODS,
} from "./parentTreatmentJourneyLocalization.js";

export {
  buildJourneyPeriodOptions,
  buildTreatmentJourneyInterpretation,
  formatChartXAxisLabel,
  formatTreatmentJourneyDisplayDate,
  formatTreatmentJourneyImprovement,
  formatTreatmentJourneyPercent,
  formatTreatmentJourneyScoreChange,
  getJourneyPeriodLabel,
  getTreatmentJourneyTrendLabel,
  JOURNEY_PERIOD_OPTIONS,
  resolveTreatmentJourneyError,
  VALID_JOURNEY_PERIODS,
};

function readString(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readNumber(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export function isValidJourneyPeriod(period) {
  return VALID_JOURNEY_PERIODS.includes(String(period || "").trim().toLowerCase());
}

export function normalizeJourneyPeriod(period) {
  const normalized = String(period || "weekly").trim().toLowerCase();
  return isValidJourneyPeriod(normalized) ? normalized : "weekly";
}

export function journeyPeriodLabel(period, options = {}) {
  const { t } = resolveMapperContext(options);
  return getJourneyPeriodLabel(period, t);
}

function readDateValue(source, keys) {
  const raw = readString(source, keys);
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function clampScore(value) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
}

export function mapTreatmentJourneyChartPoint(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const date = readDateValue(row, ["date"]);
  const score = clampScore(readNumber(row, ["score"]));

  if (!date || score == null) {
    return null;
  }

  return {
    date,
    score,
    exercisesCompleted: readNumber(row, ["exercises_completed", "exercisesCompleted"]) ?? 0,
    improvementPercentage: readNumber(row, [
      "improvement_percentage",
      "improvementPercentage",
    ]),
    periodStart: readDateValue(row, ["period_start", "periodStart"]),
    periodEnd: readDateValue(row, ["period_end", "periodEnd"]),
  };
}

export function mapTreatmentJourneyResponse(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const chartPointsRaw = payload.chart_points ?? payload.chartPoints;
  const chartPoints = Array.isArray(chartPointsRaw)
    ? chartPointsRaw
      .map(mapTreatmentJourneyChartPoint)
      .filter(Boolean)
    : [];

  return {
    patientId: readString(payload, ["patient_id", "patientId"]) ?? "",
    period: normalizeJourneyPeriod(readString(payload, ["period"])),
    treatmentStart: readDateValue(payload, ["treatment_start", "treatmentStart"]),
    treatmentEnd: readDateValue(payload, ["treatment_end", "treatmentEnd"]),
    startingScore: clampScore(readNumber(payload, ["starting_score", "startingScore"])),
    currentScore: clampScore(readNumber(payload, ["current_score", "currentScore"])),
    scoreChange: readNumber(payload, ["score_change", "scoreChange"]),
    overallImprovement: readNumber(payload, [
      "overall_improvement",
      "overallImprovement",
    ]),
    trend: readString(payload, ["trend"]) ?? "stable",
    dataSource: readString(payload, ["data_source", "dataSource"]) ?? "",
    chartPoints,
  };
}

export function journeyHasData(journey) {
  return Boolean(journey?.chartPoints?.length);
}

export function treatmentJourneyTrendLabel(trend, options = {}) {
  const { t } = resolveMapperContext(options);
  return getTreatmentJourneyTrendLabel(trend, t);
}

export function treatmentJourneyTrendClass(trend) {
  switch (String(trend || "").trim().toLowerCase()) {
    case "improving":
      return "is-improving";
    case "declining":
      return "is-attention";
    case "stable":
    default:
      return "is-stable";
  }
}

export function calculateXAxisLabelIndices(pointCount, maxLabels = 4) {
  if (pointCount <= 0) {
    return [];
  }

  if (pointCount <= maxLabels) {
    return Array.from({ length: pointCount }, (_, index) => index);
  }

  const indices = new Set([0, pointCount - 1]);
  const step = (pointCount - 1) / (maxLabels - 1);

  for (let i = 1; i < maxLabels - 1; i += 1) {
    indices.add(Math.round(i * step));
  }

  return [...indices].sort((a, b) => a - b);
}

export function treatmentJourneyPreviewScores(points, maxPoints = 5) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  const startIndex = points.length > maxPoints ? points.length - maxPoints : 0;
  return points.slice(startIndex).map((point) => point.score);
}
