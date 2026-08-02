import { readNumber, readString } from "./parentDashboardMappers";
import { formatChildDate } from "./parentChildrenUtils";

export function mapProgressSnapshot(row) {
  const period = readString(row, ["period"]) || "weekly";
  const periodStart = readString(row, ["period_start", "periodStart"]);
  const periodEnd = readString(row, ["period_end", "periodEnd"]);

  return {
    id: `${period}-${periodStart || periodEnd || Math.random()}`,
    period,
    periodStart,
    periodEnd,
    periodLabel: formatProgressPeriodLabel(periodStart, periodEnd),
    exercisesCompleted: readNumber(row, ["exercises_completed", "exercisesCompleted"]),
    averagePerformance: readNumber(row, ["average_performance", "averagePerformance"]),
    improvementPercentage: readNumber(row, ["improvement_percentage", "improvementPercentage"]),
  };
}

export function mapProgressSnapshots(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapProgressSnapshot);
}

export function mapImprovementPercentage(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return readNumber(payload, ["improvement_percentage", "improvementPercentage"]);
}

export function mapPerformanceMetrics(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      totalExercisesCompleted: null,
      averagePerformance: null,
      averageImprovement: null,
    };
  }

  return {
    totalExercisesCompleted: readNumber(payload, [
      "total_exercises_completed",
      "totalExercisesCompleted",
    ]),
    averagePerformance: readNumber(payload, ["average_performance", "averagePerformance"]),
    averageImprovement: readNumber(payload, ["average_improvement", "averageImprovement"]),
  };
}

function formatProgressPeriodLabel(start, end) {
  const startLabel = formatChildDate(start);
  const endLabel = formatChildDate(end);

  if (startLabel && endLabel) {
    return `${startLabel} – ${endLabel}`;
  }

  return startLabel || endLabel || null;
}

export function hasProgressData(state) {
  return Boolean(
    state?.improvementPercentage != null
    || state?.metrics?.totalExercisesCompleted != null
    || state?.daily?.length
    || state?.weekly?.length
    || state?.monthly?.length,
  );
}

export const PROGRESS_EMPTY_MESSAGE =
  "Progress data will appear once exercises are tracked.";

export const PROGRESS_PERIOD_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};
