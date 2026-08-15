/**
 * Deterministic longitudinal speech progress insights (V2.3).
 * Engineering measurements only — not clinical diagnosis.
 */

const speechWordAlignmentService = require("./speechWordAlignment.service");

const DEFAULT_CHANGE_THRESHOLD = 5;
const DEFAULT_MIN_EXPECTED_FOR_DIFFICULTY = 2;
const DEFAULT_MIN_INCORRECT_FOR_DIFFICULTY = 2;

const getChangeThreshold = () => {
  const parsed = Number(process.env.SPEECH_PROGRESS_CHANGE_THRESHOLD);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return DEFAULT_CHANGE_THRESHOLD;
};

const getRepeatedDifficultyMinExpected = () => {
  const parsed = Number(process.env.SPEECH_REPEATED_DIFFICULTY_MIN_EXPECTED);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }
  return DEFAULT_MIN_EXPECTED_FOR_DIFFICULTY;
};

const getRepeatedDifficultyMinIncorrect = () => {
  const parsed = Number(process.env.SPEECH_REPEATED_DIFFICULTY_MIN_INCORRECT);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }
  return DEFAULT_MIN_INCORRECT_FOR_DIFFICULTY;
};

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

const normalizeExpectedWordKey = (word) => {
  if (typeof word !== "string" || !word.trim()) {
    return "";
  }
  const tokens = speechWordAlignmentService.tokenizeWords(word);
  return tokens[0] || "";
};

const parseWordErrorDetails = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value;
};

const parseTimingMetrics = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value;
};

const getComparisonMode = (scope = {}) => {
  if (scope.exercise_id && scope.expected_text) {
    return "same_exercise_same_expected_text";
  }
  if (scope.exercise_id) {
    return "same_exercise";
  }
  if (scope.expected_text) {
    return "same_expected_text";
  }
  return "overall_patient_history";
};

/**
 * Comparable attempt rules:
 * 1. Same patient (caller must pre-filter by patient)
 * 2. Same exercise when exercise_id is in scope
 * 3. Same normalized expected text when expected_text is in scope
 */
const isComparableAnalysis = (analysis, scope = {}) => {
  if (!analysis || !analysis.id) {
    return false;
  }

  if (scope.exercise_id && analysis.exercise_id !== scope.exercise_id) {
    return false;
  }

  if (scope.expected_text) {
    const scopeKey = normalizeExpectedTextKey(scope.expected_text);
    const analysisKey = normalizeExpectedTextKey(analysis.expected_text || "");
    if (scopeKey && analysisKey !== scopeKey) {
      return false;
    }
  }

  return true;
};

const filterComparableAnalyses = (analyses, scope = {}) => {
  if (!Array.isArray(analyses)) {
    return [];
  }

  return analyses
    .filter((analysis) => isComparableAnalysis(analysis, scope))
    .sort(
      (left, right) =>
        new Date(left.analyzed_at).getTime() - new Date(right.analyzed_at).getTime()
    );
};

const classifyWordAccuracyTrend = (attemptCount, changePercentagePoints) => {
  if (attemptCount < 2) {
    return attemptCount === 1 ? "baseline" : "insufficient_data";
  }

  const threshold = getChangeThreshold();
  if (changePercentagePoints === null || changePercentagePoints === undefined) {
    return "insufficient_data";
  }

  if (changePercentagePoints >= threshold) {
    return "improving";
  }
  if (changePercentagePoints <= -threshold) {
    return "declining";
  }
  return "stable";
};

const buildWordAccuracyTrend = (comparableAnalyses) => {
  const attempts = comparableAnalyses.filter(
    (analysis) => toNumber(analysis.word_accuracy_percentage) !== null
  );

  if (attempts.length === 0) {
    return null;
  }

  const accuracies = attempts.map((analysis) =>
    toNumber(analysis.word_accuracy_percentage)
  );
  const firstAccuracy = accuracies[0];
  const latestAccuracy = accuracies[accuracies.length - 1];
  const changePercentagePoints = roundMetric(latestAccuracy - firstAccuracy);
  const averageAccuracy = roundMetric(
    accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length
  );

  return {
    attempt_count: attempts.length,
    first_attempt_at: attempts[0].analyzed_at,
    latest_attempt_at: attempts[attempts.length - 1].analyzed_at,
    first_accuracy: roundMetric(firstAccuracy),
    latest_accuracy: roundMetric(latestAccuracy),
    change_percentage_points: changePercentagePoints,
    average_accuracy: averageAccuracy,
    best_accuracy: roundMetric(Math.max(...accuracies)),
    worst_accuracy: roundMetric(Math.min(...accuracies)),
    trend: classifyWordAccuracyTrend(attempts.length, changePercentagePoints),
  };
};

const buildRepeatedWordDifficulties = (comparableAnalyses) => {
  const minExpected = getRepeatedDifficultyMinExpected();
  const minIncorrect = getRepeatedDifficultyMinIncorrect();
  const aggregates = new Map();

  comparableAnalyses.forEach((analysis) => {
    const details = parseWordErrorDetails(analysis.word_error_details);
    const alignedWords = Array.isArray(details?.aligned_words)
      ? details.aligned_words
      : [];
    const perAnalysisWords = new Map();

    alignedWords.forEach((entry) => {
      if (!entry || entry.status === "insertion") {
        return;
      }

      const expectedWord = normalizeExpectedWordKey(entry.expected);
      if (!expectedWord) {
        return;
      }

      if (!perAnalysisWords.has(expectedWord)) {
        perAnalysisWords.set(expectedWord, []);
      }

      perAnalysisWords.get(expectedWord).push(entry.status);
    });

    perAnalysisWords.forEach((statuses, expectedWord) => {
      if (!aggregates.has(expectedWord)) {
        aggregates.set(expectedWord, {
          expected_word: expectedWord,
          times_expected: 0,
          times_correct: 0,
          times_incorrect: 0,
          substitutions: 0,
          omissions: 0,
          last_seen_at: null,
        });
      }

      const aggregate = aggregates.get(expectedWord);
      aggregate.times_expected += 1;

      const attemptCorrect = statuses.every((status) => status === "correct");
      if (attemptCorrect) {
        aggregate.times_correct += 1;
      } else {
        aggregate.times_incorrect += 1;
      }

      statuses.forEach((status) => {
        if (status === "substitution") {
          aggregate.substitutions += 1;
        } else if (status === "omission") {
          aggregate.omissions += 1;
        }
      });

      aggregate.last_seen_at = analysis.analyzed_at;
    });
  });

  return Array.from(aggregates.values())
    .map((item) => ({
      ...item,
      accuracy_percentage:
        item.times_expected > 0
          ? roundMetric((item.times_correct / item.times_expected) * 100)
          : null,
    }))
    .filter(
      (item) =>
        item.times_expected >= minExpected && item.times_incorrect >= minIncorrect
    )
    .sort((left, right) => {
      if (right.times_incorrect !== left.times_incorrect) {
        return right.times_incorrect - left.times_incorrect;
      }
      const leftAccuracy = left.accuracy_percentage ?? 100;
      const rightAccuracy = right.accuracy_percentage ?? 100;
      if (leftAccuracy !== rightAccuracy) {
        return leftAccuracy - rightAccuracy;
      }
      return (
        new Date(right.last_seen_at || 0).getTime() -
        new Date(left.last_seen_at || 0).getTime()
      );
    });
};

const buildRepeatedWordSubstitutions = (comparableAnalyses) => {
  const aggregates = new Map();

  comparableAnalyses.forEach((analysis) => {
    const details = parseWordErrorDetails(analysis.word_error_details);
    const alignedWords = Array.isArray(details?.aligned_words)
      ? details.aligned_words
      : [];

    alignedWords.forEach((entry) => {
      if (!entry || entry.status !== "substitution") {
        return;
      }

      const expectedWord = normalizeExpectedWordKey(entry.expected);
      const detectedWord = normalizeExpectedWordKey(entry.detected);
      if (!expectedWord || !detectedWord) {
        return;
      }

      const key = `${expectedWord}→${detectedWord}`;
      if (!aggregates.has(key)) {
        aggregates.set(key, {
          expected_word: expectedWord,
          detected_word: detectedWord,
          count: 0,
          last_seen_at: null,
        });
      }

      const aggregate = aggregates.get(key);
      aggregate.count += 1;
      aggregate.last_seen_at = analysis.analyzed_at;
    });
  });

  return Array.from(aggregates.values())
    .filter((item) => item.count >= 2)
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return (
        new Date(right.last_seen_at || 0).getTime() -
        new Date(left.last_seen_at || 0).getTime()
      );
    });
};

const buildMetricTrend = (values) => {
  const numericValues = values.filter((value) => value !== null && value !== undefined);
  if (numericValues.length === 0) {
    return null;
  }

  const first = numericValues[0];
  const latest = numericValues[numericValues.length - 1];
  const average = roundMetric(
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
  );

  return {
    first: roundMetric(first),
    latest: roundMetric(latest),
    change: roundMetric(latest - first),
    average,
    attempt_count: numericValues.length,
  };
};

const buildFluencyTrend = (comparableAnalyses) => {
  const wpmSeries = [];
  const pauseRatioSeries = [];
  const pauseCountSeries = [];
  const averagePauseSeries = [];

  comparableAnalyses.forEach((analysis) => {
    const timing = parseTimingMetrics(analysis.speech_timing_metrics);
    if (!timing) {
      wpmSeries.push(null);
      pauseRatioSeries.push(null);
      pauseCountSeries.push(null);
      averagePauseSeries.push(null);
      return;
    }

    wpmSeries.push(toNumber(timing.words_per_minute));
    pauseRatioSeries.push(toNumber(timing.pause_ratio_percentage));
    pauseCountSeries.push(toNumber(timing.pause_count));
    averagePauseSeries.push(toNumber(timing.average_pause_duration_seconds));
  });

  const wordsPerMinute = buildMetricTrend(wpmSeries);
  const pauseRatio = buildMetricTrend(pauseRatioSeries);
  const pauseCount = buildMetricTrend(pauseCountSeries);
  const averagePauseDuration = buildMetricTrend(averagePauseSeries);

  if (!wordsPerMinute && !pauseRatio && !pauseCount && !averagePauseDuration) {
    return null;
  }

  const attemptCount = comparableAnalyses.filter((analysis) =>
    parseTimingMetrics(analysis.speech_timing_metrics)
  ).length;

  const fluencyTrend = {
    attempt_count: attemptCount,
    words_per_minute: wordsPerMinute,
    pause_ratio_percentage: pauseRatio
      ? {
          ...pauseRatio,
          change_percentage_points: pauseRatio.change,
        }
      : null,
    pause_count: pauseCount,
    average_pause_duration_seconds: averagePauseDuration,
  };

  if (fluencyTrend.pause_ratio_percentage) {
    delete fluencyTrend.pause_ratio_percentage.change;
  }

  return fluencyTrend;
};

const buildHistoryPoints = (comparableAnalyses) =>
  comparableAnalyses.map((analysis) => {
    const timing = parseTimingMetrics(analysis.speech_timing_metrics);
    return {
      analysis_id: analysis.id,
      analyzed_at: analysis.analyzed_at,
      exercise_id: analysis.exercise_id ?? null,
      expected_text: analysis.expected_text ?? null,
      word_accuracy_percentage: toNumber(analysis.word_accuracy_percentage),
      words_per_minute: toNumber(timing?.words_per_minute),
      pause_ratio_percentage: toNumber(timing?.pause_ratio_percentage),
      overall_score: toNumber(analysis.overall_score), // deprecated compatibility; not used by live Specialist charts
    };
  });

const buildSpeechProgressInsights = ({
  patientId,
  analyses = [],
  scope = {},
} = {}) => {
  const comparableAnalyses = filterComparableAnalyses(analyses, scope);
  const wordAccuracyTrend = buildWordAccuracyTrend(comparableAnalyses);
  const repeatedWordDifficulties = buildRepeatedWordDifficulties(
    comparableAnalyses.filter(
      (analysis) =>
        speechWordAlignmentService.hasMeaningfulExpectedText(
          analysis.expected_text
        ) && parseWordErrorDetails(analysis.word_error_details)
    )
  );
  const repeatedWordSubstitutions = buildRepeatedWordSubstitutions(
    comparableAnalyses.filter((analysis) =>
      parseWordErrorDetails(analysis.word_error_details)
    )
  );
  const fluencyTrend = buildFluencyTrend(comparableAnalyses);
  const historyPoints = buildHistoryPoints(comparableAnalyses);

  return {
    patient_id: patientId,
    scope: {
      exercise_id: scope.exercise_id ?? null,
      expected_text: scope.expected_text ?? null,
      comparison_mode: getComparisonMode(scope),
    },
    comparable_attempt_count: comparableAnalyses.length,
    word_accuracy_trend: wordAccuracyTrend,
    repeated_word_difficulties: repeatedWordDifficulties,
    repeated_word_substitutions: repeatedWordSubstitutions,
    fluency_trend: fluencyTrend,
    history_points: historyPoints,
  };
};

const findPreviousComparableAnalysisId = (analyses, currentContext) => {
  if (!currentContext?.patient_id) {
    return null;
  }

  const scope = {
    exercise_id: currentContext.exercise_id ?? null,
    expected_text: currentContext.expected_text ?? null,
  };

  const comparable = filterComparableAnalyses(analyses, scope).filter(
    (analysis) => analysis.id !== currentContext.current_analysis_id
  );

  if (comparable.length === 0) {
    return null;
  }

  return comparable[comparable.length - 1].id;
};

module.exports = {
  DEFAULT_CHANGE_THRESHOLD,
  DEFAULT_MIN_EXPECTED_FOR_DIFFICULTY,
  DEFAULT_MIN_INCORRECT_FOR_DIFFICULTY,
  getChangeThreshold,
  getRepeatedDifficultyMinExpected,
  getRepeatedDifficultyMinIncorrect,
  normalizeExpectedTextKey,
  normalizeExpectedWordKey,
  isComparableAnalysis,
  filterComparableAnalyses,
  classifyWordAccuracyTrend,
  buildWordAccuracyTrend,
  buildRepeatedWordDifficulties,
  buildRepeatedWordSubstitutions,
  buildFluencyTrend,
  buildHistoryPoints,
  buildSpeechProgressInsights,
  findPreviousComparableAnalysisId,
};
