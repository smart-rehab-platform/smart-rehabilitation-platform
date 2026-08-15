/**
 * Speech Analysis V3.3 — historical target-sound acoustic progress.
 * Deterministic measurement trends only. Not pronunciation correctness.
 *
 * Aggregation formulas (per analysis):
 * - mean_duration_ms = average(duration_ms) over usable occurrences
 * - mean_f0_hz = average(mean_f0_hz) over usable occurrences with non-null F0
 * - mean_intensity_db = average(mean_intensity_db) over usable occurrences with non-null intensity
 * - mean_f1/f2 similarly when non-null values exist
 *
 * Variability uses sample standard deviation (n-1) across per-analysis means.
 */

const speechWordAlignmentService = require("./speechWordAlignment.service");

const USABLE_STATUSES = new Set(["usable", "usable_with_caution"]);

const roundMetric = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Number(Number(value).toFixed(decimals));
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeExpectedTextKey = (text) =>
  speechWordAlignmentService.normalizeSpeechText(text);

const normalizeTargetPhoneKey = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  return value.trim().toLowerCase().replace(/\s+/g, "_").replace(/^\/|\/$/g, "");
};

const parsePhonemeAnalysis = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value;
};

const mean = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

const sampleStdDev = (values) => {
  if (!Array.isArray(values) || values.length < 2) {
    return null;
  }
  const avg = mean(values);
  if (avg === null) {
    return null;
  }
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
};

const isUsableAcousticStatus = (status) =>
  USABLE_STATUSES.has(String(status || "").trim().toLowerCase());

const extractRequestedTargetPhone = (phonemeAnalysis) => {
  const requested = phonemeAnalysis?.target_phone?.requested;
  if (requested) {
    return normalizeTargetPhoneKey(requested);
  }
  return "";
};

const aggregateAnalysisAcoustics = (analysis) => {
  const phoneme = parsePhonemeAnalysis(analysis.speech_phoneme_analysis);
  if (!phoneme) {
    return null;
  }

  const requested = extractRequestedTargetPhone(phoneme);
  const occurrences = Array.isArray(phoneme.target_occurrences)
    ? phoneme.target_occurrences
    : [];

  const durations = [];
  const f0Values = [];
  const intensityValues = [];
  const f1Values = [];
  const f2Values = [];
  let usableOccurrenceCount = 0;
  let cautionCount = 0;

  occurrences.forEach((occurrence) => {
    const acoustics = occurrence?.acoustic_measurements;
    if (!acoustics || typeof acoustics !== "object") {
      return;
    }
    const status = acoustics.quality?.status;
    if (!isUsableAcousticStatus(status)) {
      return;
    }
    usableOccurrenceCount += 1;
    if (String(status).toLowerCase() === "usable_with_caution") {
      cautionCount += 1;
    }

    const duration = toNumber(acoustics.duration_ms);
    if (duration !== null) {
      durations.push(duration);
    }
    const f0 = toNumber(acoustics.mean_f0_hz);
    if (f0 !== null) {
      f0Values.push(f0);
    }
    const intensity = toNumber(acoustics.mean_intensity_db);
    if (intensity !== null) {
      intensityValues.push(intensity);
    }
    const f1 = toNumber(acoustics.mean_f1_hz);
    if (f1 !== null) {
      f1Values.push(f1);
    }
    const f2 = toNumber(acoustics.mean_f2_hz);
    if (f2 !== null) {
      f2Values.push(f2);
    }
  });

  const qualityStatus =
    usableOccurrenceCount === 0
      ? "unavailable"
      : cautionCount > 0
        ? "usable_with_caution"
        : "usable";

  return {
    analysis_id: analysis.id,
    analyzed_at: analysis.analyzed_at,
    exercise_id: analysis.exercise_id ?? null,
    expected_text: phoneme.expected_text ?? analysis.expected_text ?? null,
    target_phone_requested: requested || null,
    target_phone_ipa: phoneme.target_phone?.ipa ?? null,
    target_phone_display: phoneme.target_phone?.display ?? null,
    target_phone: occurrences[0]?.phone ?? phoneme.target_phone?.requested ?? null,
    occurrence_count: occurrences.length,
    usable_occurrence_count: usableOccurrenceCount,
    valid_f0_occurrence_count: f0Values.length,
    valid_intensity_occurrence_count: intensityValues.length,
    valid_f1_occurrence_count: f1Values.length,
    valid_f2_occurrence_count: f2Values.length,
    mean_duration_ms: roundMetric(mean(durations), 1),
    mean_f0_hz: roundMetric(mean(f0Values), 2),
    mean_intensity_db: roundMetric(mean(intensityValues), 2),
    mean_f1_hz: roundMetric(mean(f1Values), 1),
    mean_f2_hz: roundMetric(mean(f2Values), 1),
    quality_status: qualityStatus,
    has_usable_acoustics: usableOccurrenceCount > 0,
  };
};

const isComparableAcousticAnalysis = (summary, scope = {}) => {
  if (!summary || !summary.analysis_id) {
    return false;
  }
  if (!scope.exercise_id || summary.exercise_id !== scope.exercise_id) {
    return false;
  }
  if (scope.expected_text) {
    const scopeKey = normalizeExpectedTextKey(scope.expected_text);
    const analysisKey = normalizeExpectedTextKey(summary.expected_text || "");
    if (!scopeKey || analysisKey !== scopeKey) {
      return false;
    }
  } else {
    return false;
  }

  const scopeTarget = normalizeTargetPhoneKey(scope.target_phone_requested || "");
  if (!scopeTarget || summary.target_phone_requested !== scopeTarget) {
    return false;
  }

  return true;
};

const buildMetricTrend = (points, valueKey) => {
  const values = points
    .map((point) => ({
      analysis_id: point.analysis_id,
      value: toNumber(point[valueKey]),
    }))
    .filter((item) => item.value !== null);

  if (values.length === 0) {
    return null;
  }

  const nums = values.map((item) => item.value);
  const first = nums[0];
  const latest = nums[nums.length - 1];
  const change = values.length >= 2 ? roundMetric(latest - first, 2) : null;

  return {
    valid_attempt_count: values.length,
    first: roundMetric(first, 2),
    latest: roundMetric(latest, 2),
    change,
    change_direction:
      change === null
        ? null
        : change > 0
          ? "increase"
          : change < 0
            ? "decrease"
            : "unchanged",
    average: roundMetric(mean(nums), 2),
    min: roundMetric(Math.min(...nums), 2),
    max: roundMetric(Math.max(...nums), 2),
  };
};

const buildFormantTrend = (points) => {
  const f1 = buildMetricTrend(points, "mean_f1_hz");
  const f2 = buildMetricTrend(points, "mean_f2_hz");
  if (!f1 || f1.valid_attempt_count < 2) {
    return null;
  }
  if (!f2 || f2.valid_attempt_count < 2) {
    return null;
  }
  return {
    f1_hz: f1,
    f2_hz: f2,
  };
};

const buildVariability = (points) => {
  const durationValues = points
    .map((point) => toNumber(point.mean_duration_ms))
    .filter((value) => value !== null);
  const f0Values = points
    .map((point) => toNumber(point.mean_f0_hz))
    .filter((value) => value !== null);
  const intensityValues = points
    .map((point) => toNumber(point.mean_intensity_db))
    .filter((value) => value !== null);

  const variability = {
    duration_ms_stddev: roundMetric(sampleStdDev(durationValues), 2),
    f0_hz_stddev: roundMetric(sampleStdDev(f0Values), 2),
    intensity_db_stddev: roundMetric(sampleStdDev(intensityValues), 2),
  };

  if (
    variability.duration_ms_stddev === null &&
    variability.f0_hz_stddev === null &&
    variability.intensity_db_stddev === null
  ) {
    return null;
  }

  return variability;
};

const buildSpeechAcousticProgress = ({
  patientId,
  analyses,
  scope = {},
  currentAnalysisId = null,
} = {}) => {
  const requiredScope = {
    patient_id: patientId || null,
    exercise_id: scope.exercise_id || null,
    expected_text: scope.expected_text || null,
    target_phone_requested: normalizeTargetPhoneKey(
      scope.target_phone_requested || ""
    ) || null,
    target_phone_ipa: scope.target_phone_ipa || null,
  };

  if (
    !requiredScope.patient_id ||
    !requiredScope.exercise_id ||
    !requiredScope.expected_text ||
    !requiredScope.target_phone_requested
  ) {
    return null;
  }

  const summaries = (Array.isArray(analyses) ? analyses : [])
    .map((analysis) => aggregateAnalysisAcoustics(analysis))
    .filter(Boolean)
    .filter((summary) => isComparableAcousticAnalysis(summary, requiredScope))
    .sort((a, b) => {
      const aTime = new Date(a.analyzed_at).getTime();
      const bTime = new Date(b.analyzed_at).getTime();
      return aTime - bTime;
    });

  const usablePoints = summaries.filter((summary) => summary.has_usable_acoustics);

  const historyPoints = summaries.map((summary) => ({
    analysis_id: summary.analysis_id,
    analyzed_at: summary.analyzed_at,
    target_phone: summary.target_phone,
    duration_ms: summary.mean_duration_ms,
    mean_f0_hz: summary.mean_f0_hz,
    mean_intensity_db: summary.mean_intensity_db,
    mean_f1_hz: summary.mean_f1_hz,
    mean_f2_hz: summary.mean_f2_hz,
    quality_status: summary.quality_status,
    occurrence_count: summary.occurrence_count,
    usable_occurrence_count: summary.usable_occurrence_count,
    valid_f0_occurrence_count: summary.valid_f0_occurrence_count,
    valid_intensity_occurrence_count: summary.valid_intensity_occurrence_count,
  }));

  const durationTrend = buildMetricTrend(usablePoints, "mean_duration_ms");
  const f0Trend = buildMetricTrend(usablePoints, "mean_f0_hz");
  const intensityTrend = buildMetricTrend(usablePoints, "mean_intensity_db");
  const formantTrend = buildFormantTrend(usablePoints);
  const variability = buildVariability(usablePoints);

  let previous = null;
  let changesFromPrevious = null;
  const anchorId = currentAnalysisId || usablePoints[usablePoints.length - 1]?.analysis_id;
  if (anchorId) {
    const anchorIndex = usablePoints.findIndex((point) => point.analysis_id === anchorId);
    const previousIndex =
      anchorIndex > 0
        ? anchorIndex - 1
        : usablePoints.length >= 2 && usablePoints[usablePoints.length - 1].analysis_id === anchorId
          ? usablePoints.length - 2
          : -1;
    if (previousIndex >= 0) {
      previous = {
        analysis_id: usablePoints[previousIndex].analysis_id,
        analyzed_at: usablePoints[previousIndex].analyzed_at,
        duration_ms: usablePoints[previousIndex].mean_duration_ms,
        mean_f0_hz: usablePoints[previousIndex].mean_f0_hz,
        mean_intensity_db: usablePoints[previousIndex].mean_intensity_db,
      };
      const current = usablePoints[anchorIndex >= 0 ? anchorIndex : usablePoints.length - 1];
      changesFromPrevious = {
        duration_ms:
          current.mean_duration_ms !== null && previous.duration_ms !== null
            ? roundMetric(current.mean_duration_ms - previous.duration_ms, 1)
            : null,
        f0_hz:
          current.mean_f0_hz !== null && previous.mean_f0_hz !== null
            ? roundMetric(current.mean_f0_hz - previous.mean_f0_hz, 2)
            : null,
        intensity_db:
          current.mean_intensity_db !== null && previous.mean_intensity_db !== null
            ? roundMetric(current.mean_intensity_db - previous.mean_intensity_db, 2)
            : null,
      };
    }
  }

  const targetPhone =
    summaries[0]
      ? {
          requested: requiredScope.target_phone_requested,
          ipa: summaries[0].target_phone_ipa,
          display: summaries[0].target_phone_display,
        }
      : {
          requested: requiredScope.target_phone_requested,
          ipa: requiredScope.target_phone_ipa,
          display: null,
        };

  return {
    comparison_scope: requiredScope,
    total_comparable_attempts: summaries.length,
    usable_acoustic_attempts: usablePoints.length,
    target_phone: targetPhone,
    duration_trend: durationTrend,
    f0_trend: f0Trend,
    intensity_trend: intensityTrend,
    formant_trend: formantTrend,
    variability,
    previous_comparable_analysis: previous,
    changes_from_previous: changesFromPrevious,
    history_points: historyPoints,
  };
};

module.exports = {
  USABLE_STATUSES,
  normalizeTargetPhoneKey,
  aggregateAnalysisAcoustics,
  isComparableAcousticAnalysis,
  buildMetricTrend,
  sampleStdDev,
  buildSpeechAcousticProgress,
};
