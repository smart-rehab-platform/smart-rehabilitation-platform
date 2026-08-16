import { readNumber, readString } from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  formatProgressPeriodLabel,
  getProgressEmptyMessage,
  getProgressPeriodLabel,
  PROGRESS_EMPTY_MESSAGE,
  PROGRESS_PERIOD_LABELS,
} from "./parentProgressLocalization";

export {
  formatProgressPeriodLabel,
  getProgressEmptyMessage,
  getProgressPeriodLabel,
  PROGRESS_EMPTY_MESSAGE,
  PROGRESS_PERIOD_LABELS,
};

export function mapProgressSnapshot(row, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const period = readString(row, ["period"]) || "weekly";
  const periodStart = readString(row, ["period_start", "periodStart"]);
  const periodEnd = readString(row, ["period_end", "periodEnd"]);

  return {
    id: `${period}-${periodStart || periodEnd || Math.random()}`,
    period,
    periodStart,
    periodEnd,
    periodLabel: formatProgressPeriodLabel(periodStart, periodEnd, locale, t),
    exercisesCompleted: readNumber(row, ["exercises_completed", "exercisesCompleted"]),
    averagePerformance: readNumber(row, ["average_performance", "averagePerformance"]),
    improvementPercentage: readNumber(row, ["improvement_percentage", "improvementPercentage"]),
  };
}

export function mapProgressSnapshots(rows, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => mapProgressSnapshot(row, options));
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

export function hasProgressData(state) {
  return Boolean(
    state?.improvementPercentage != null
    || state?.metrics?.totalExercisesCompleted != null
    || state?.daily?.length
    || state?.weekly?.length
    || state?.monthly?.length,
  );
}
