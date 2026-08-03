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

export const VALID_JOURNEY_PERIODS = ["weekly", "monthly", "full"];

export const JOURNEY_PERIOD_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "full", label: "Full Treatment" },
];

export function isValidJourneyPeriod(period) {
  return VALID_JOURNEY_PERIODS.includes(String(period || "").trim().toLowerCase());
}

export function normalizeJourneyPeriod(period) {
  const normalized = String(period || "weekly").trim().toLowerCase();
  return isValidJourneyPeriod(normalized) ? normalized : "weekly";
}

export function journeyPeriodLabel(period) {
  const option = JOURNEY_PERIOD_OPTIONS.find(
    (entry) => entry.value === normalizeJourneyPeriod(period),
  );
  return option?.label ?? "Weekly";
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

export function treatmentJourneyTrendLabel(trend) {
  switch (String(trend || "").trim().toLowerCase()) {
    case "improving":
      return "Improving";
    case "declining":
      return "Needs Attention";
    case "stable":
    default:
      return "Stable";
  }
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

export function formatTreatmentJourneyPercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${Math.round(value)}%`;
}

export function formatTreatmentJourneyScoreChange(scoreChange) {
  if (scoreChange == null || !Number.isFinite(scoreChange)) {
    return "—";
  }

  const rounded = Math.round(scoreChange);
  if (rounded > 0) {
    return `+${rounded} points`;
  }

  if (rounded < 0) {
    return `${rounded} points`;
  }

  return "0 points";
}

export function formatTreatmentJourneyImprovement(improvementPercentage) {
  if (improvementPercentage == null || !Number.isFinite(improvementPercentage)) {
    return "—";
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

export function formatTreatmentJourneyDisplayDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatChartXAxisLabel(date, period) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  switch (normalizeJourneyPeriod(period)) {
    case "monthly":
      return date.toLocaleDateString(undefined, { month: "short" });
    case "full":
      return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    case "weekly":
    default:
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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

export function buildTreatmentJourneyInterpretation(journey) {
  if (!journey || !journeyHasData(journey)) {
    return {
      title: "Building your journey",
      body: "More progress entries are needed to identify a trend.",
    };
  }

  if (journey.chartPoints.length === 1) {
    return {
      title: "Early progress recorded",
      body: "More progress entries are needed to identify a trend.",
    };
  }

  switch (String(journey.trend || "").trim().toLowerCase()) {
    case "improving":
      return {
        title: "Progress is moving upward",
        body: "The current score is higher than the starting score.",
      };
    case "declining":
      return {
        title: "Progress needs attention",
        body:
          "The latest score is lower than the previous period. Review recent feedback or contact the specialist.",
      };
    case "stable":
    default:
      return {
        title: "Progress is currently stable",
        body: "Recent scores are staying within a similar range.",
      };
  }
}

export function resolveTreatmentJourneyError(error) {
  const status = error?.response?.status;

  if (status === 401) {
    return "Please sign in to view treatment journey progress.";
  }

  if (status === 403) {
    return "You do not have access to this child's treatment journey.";
  }

  if (status === 404) {
    return "Treatment journey data was not found for this child.";
  }

  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage.trim();
  }

  if (error instanceof Error && error.message) {
    return error.message.replace(/^Exception:\s*/i, "");
  }

  return "Failed to load treatment journey. Please try again.";
}
