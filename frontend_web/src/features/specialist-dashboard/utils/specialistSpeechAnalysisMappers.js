function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readDouble(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
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

function readDateIso(value) {
  if (value == null || value === "") {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function asMap(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const decoded = JSON.parse(raw);
      return asMap(decoded);
    } catch {
      return null;
    }
  }
  return null;
}

function readText(map, keys) {
  if (!map) {
    return null;
  }
  const value = readString(map, keys);
  return value || null;
}

function readRecommendations(map) {
  if (!map || !Array.isArray(map.recommendations)) {
    return [];
  }
  return map.recommendations
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter(Boolean);
}

function readInt(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.trunc(value);
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter(Boolean);
}

function mapList(raw, mapper) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => mapper(asMap(item)))
    .filter(Boolean);
}

export function mapSpeechExpectedSpeech(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const expectedText = readText(source, ["expected_text", "expectedText"]);
  const targetWord = readText(source, ["target_word", "targetWord"]);
  const targetPhoneme = readText(source, ["target_phoneme", "targetPhoneme"]);
  const hasContent = Boolean(expectedText || targetWord || targetPhoneme);
  if (!hasContent) {
    return null;
  }
  return { expectedText, targetWord, targetPhoneme, hasContent: true };
}

function mapSpeechAlignedWord(map) {
  if (!map) {
    return null;
  }
  return {
    expected: readText(map, ["expected"]),
    detected: readText(map, ["detected"]),
    status: readText(map, ["status"]),
  };
}

export function mapSpeechWordAnalysis(map, fallbackAccuracy = null) {
  const source = asMap(map);
  const wordAccuracyPercentage =
    readDouble(source || {}, ["word_accuracy_percentage", "wordAccuracyPercentage"]) ??
    fallbackAccuracy;
  if (wordAccuracyPercentage == null) {
    return null;
  }
  const alignedWords = mapList(source?.aligned_words ?? source?.alignedWords, mapSpeechAlignedWord);
  return {
    wordAccuracyPercentage,
    correctWords: readInt(source, ["correct_words", "correctWords"]),
    substitutions: readInt(source, ["substitutions"]),
    omissions: readInt(source, ["omissions"]),
    insertions: readInt(source, ["insertions"]),
    expectedWordCount: readInt(source, ["expected_word_count", "expectedWordCount"]),
    alignedWords,
    hasContent: true,
  };
}

export function mapSpeechAsrConfidence(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const averageWordProbability = readDouble(source, [
    "average_word_probability",
    "averageWordProbability",
  ]);
  if (averageWordProbability == null) {
    return null;
  }
  return {
    averageWordProbability,
    minimumWordProbability: readDouble(source, [
      "minimum_word_probability",
      "minimumWordProbability",
    ]),
    lowConfidenceWordCount: readInt(source, [
      "low_confidence_word_count",
      "lowConfidenceWordCount",
    ]),
    wordProbabilityCount: readInt(source, ["word_probability_count", "wordProbabilityCount"]),
    hasContent: true,
  };
}

export function mapSpeechFluencyMetrics(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const speechDurationSeconds = readDouble(source, [
    "speech_duration_seconds",
    "speechDurationSeconds",
  ]);
  const wordsPerMinute = readDouble(source, ["words_per_minute", "wordsPerMinute"]);
  const pauseCount = readInt(source, ["pause_count", "pauseCount"]);
  if (speechDurationSeconds == null && wordsPerMinute == null && pauseCount == null) {
    return null;
  }
  return {
    speechDurationSeconds,
    audioDurationSeconds: readDouble(source, [
      "audio_duration_seconds",
      "audioDurationSeconds",
    ]),
    wordCount: readInt(source, ["word_count", "wordCount"]),
    wordsPerSecond: readDouble(source, ["words_per_second", "wordsPerSecond"]),
    wordsPerMinute,
    pauseThresholdSeconds: readDouble(source, [
      "pause_threshold_seconds",
      "pauseThresholdSeconds",
    ]),
    pauseCount,
    totalPauseDurationSeconds: readDouble(source, [
      "total_pause_duration_seconds",
      "totalPauseDurationSeconds",
    ]),
    averagePauseDurationSeconds: readDouble(source, [
      "average_pause_duration_seconds",
      "averagePauseDurationSeconds",
    ]),
    longestPauseSeconds: readDouble(source, ["longest_pause_seconds", "longestPauseSeconds"]),
    pauseRatioPercentage: readDouble(source, ["pause_ratio_percentage", "pauseRatioPercentage"]),
    timingSource: readText(source, ["timing_source", "timingSource"]),
    hasContent: true,
  };
}

function mapSpeechQualityWarning(map) {
  if (!map) {
    return null;
  }
  const code = readString(map, ["code"]);
  const message = readString(map, ["message"]);
  if (!code) {
    return null;
  }
  return { code, message: message || code };
}

export function mapSpeechAnalysisQuality(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const status = readText(source, ["status"]);
  if (!status) {
    return null;
  }
  const warnings = mapList(source.warnings, mapSpeechQualityWarning);
  return {
    status,
    confidence: readText(source, ["confidence"]),
    warnings,
    hasContent: true,
  };
}

export function mapSpeechTargetPhone(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const requested = readText(source, ["requested"]);
  const display = readText(source, ["display"]);
  const ipa = readText(source, ["ipa"]);
  const alignerPhones = readStringList(source.aligner_phones ?? source.alignerPhones);
  if (!requested && !display) {
    return null;
  }
  return { requested, display, ipa, alignerPhones, hasContent: true };
}

function mapSpeechAcousticMeasurements(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const durationMs = readDouble(source, ["duration_ms", "durationMs"]);
  const meanF0Hz = readDouble(source, ["mean_f0_hz", "meanF0Hz"]);
  const meanIntensityDb = readDouble(source, ["mean_intensity_db", "meanIntensityDb"]);
  const meanF1Hz = readDouble(source, ["mean_f1_hz", "meanF1Hz"]);
  const meanF2Hz = readDouble(source, ["mean_f2_hz", "meanF2Hz"]);
  const qualityMap = asMap(source.quality);
  const quality = qualityMap
    ? {
        available: qualityMap.available === true,
        status: readText(qualityMap, ["status"]),
        warnings: mapList(qualityMap.warnings, mapSpeechQualityWarning),
      }
    : null;
  const hasAnyMeasurement =
    durationMs != null ||
    meanF0Hz != null ||
    meanIntensityDb != null ||
    meanF1Hz != null ||
    meanF2Hz != null;
  if (!hasAnyMeasurement) {
    return null;
  }
  return {
    durationMs,
    meanF0Hz,
    meanIntensityDb,
    meanF1Hz,
    meanF2Hz,
    quality,
    hasAnyMeasurement: true,
  };
}

function mapSpeechTargetOccurrence(map) {
  if (!map) {
    return null;
  }
  return {
    word: readText(map, ["word"]),
    wordIndex: readInt(map, ["word_index", "wordIndex"]),
    phoneIndex: readInt(map, ["phone_index", "phoneIndex"]),
    phone: readText(map, ["phone"]),
    start: readDouble(map, ["start"]),
    end: readDouble(map, ["end"]),
    durationSeconds: readDouble(map, ["duration_seconds", "durationSeconds"]),
    acousticMeasurements: mapSpeechAcousticMeasurements(
      asMap(map.acoustic_measurements ?? map.acousticMeasurements),
    ),
  };
}

export function mapSpeechPhonemeAnalysis(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const qualityMap = asMap(source.quality);
  const quality = qualityMap
    ? {
        available: qualityMap.available === true,
        status: readText(qualityMap, ["status"]),
        warnings: mapList(qualityMap.warnings, mapSpeechQualityWarning),
      }
    : null;
  const words = mapList(source.words, (item) =>
    item
      ? {
          word: readText(item, ["word"]),
          wordIndex: readInt(item, ["word_index", "wordIndex"]),
          start: readDouble(item, ["start"]),
          end: readDouble(item, ["end"]),
          durationSeconds: readDouble(item, ["duration_seconds", "durationSeconds"]),
        }
      : null,
  );
  const phones = mapList(source.phones, (item) =>
    item
      ? {
          phone: readText(item, ["phone"]),
          phoneIndex: readInt(item, ["phone_index", "phoneIndex"]),
          start: readDouble(item, ["start"]),
          end: readDouble(item, ["end"]),
          durationSeconds: readDouble(item, ["duration_seconds", "durationSeconds"]),
        }
      : null,
  );
  const targetOccurrences = mapList(
    source.target_occurrences ?? source.targetOccurrences,
    mapSpeechTargetOccurrence,
  );
  const targetPhone = mapSpeechTargetPhone(asMap(source.target_phone ?? source.targetPhone));
  const hasContent =
    quality?.available === true || words.length > 0 || targetOccurrences.length > 0;
  if (!hasContent) {
    return null;
  }
  return {
    version: readText(source, ["version"]),
    language: readText(source, ["language"]),
    alignmentEngine: readText(source, ["alignment_engine", "alignmentEngine"]),
    phoneSet: readText(source, ["phone_set", "phoneSet"]),
    expectedText: readText(source, ["expected_text", "expectedText"]),
    targetPhone,
    words,
    phones,
    targetOccurrences,
    quality,
    hasContent: true,
  };
}

function mapSpeechMetricTrend(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const first = readDouble(source, ["first"]);
  const latest = readDouble(source, ["latest"]);
  if (first == null && latest == null) {
    return null;
  }
  return {
    first,
    latest,
    change: readDouble(source, ["change"]),
    average: readDouble(source, ["average"]),
    changePercentagePoints: readDouble(source, [
      "change_percentage_points",
      "changePercentagePoints",
    ]),
    attemptCount: readInt(source, ["attempt_count", "attemptCount"]),
    hasContent: true,
  };
}

function mapSpeechWordAccuracyTrend(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const firstAccuracy = readDouble(source, ["first_accuracy", "firstAccuracy"]);
  const latestAccuracy = readDouble(source, ["latest_accuracy", "latestAccuracy"]);
  if (firstAccuracy == null && latestAccuracy == null) {
    return null;
  }
  return {
    attemptCount: readInt(source, ["attempt_count", "attemptCount"]),
    firstAccuracy,
    latestAccuracy,
    changePercentagePoints: readDouble(source, [
      "change_percentage_points",
      "changePercentagePoints",
    ]),
    averageAccuracy: readDouble(source, ["average_accuracy", "averageAccuracy"]),
    bestAccuracy: readDouble(source, ["best_accuracy", "bestAccuracy"]),
    worstAccuracy: readDouble(source, ["worst_accuracy", "worstAccuracy"]),
    trend: readText(source, ["trend"]),
    hasContent: true,
  };
}

function mapSpeechHistoryPoint(map) {
  if (!map) {
    return null;
  }
  const analysisId =
    readString(map, ["analysis_id", "analysisId", "id"]) || null;
  if (!analysisId) {
    return null;
  }
  return {
    analysisId,
    analyzedAt: readDateIso(map.analyzed_at ?? map.analyzedAt),
    wordAccuracyPercentage: readDouble(map, [
      "word_accuracy_percentage",
      "wordAccuracyPercentage",
    ]),
    wordsPerMinute: readDouble(map, ["words_per_minute", "wordsPerMinute"]),
    pauseRatioPercentage: readDouble(map, [
      "pause_ratio_percentage",
      "pauseRatioPercentage",
    ]),
    overallScore: readDouble(map, ["overall_score", "overallScore"]),
  };
}

export function mapSpeechProgressInsights(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const scope = asMap(source.scope) || {};
  const wordAccuracyTrend = mapSpeechWordAccuracyTrend(
    asMap(source.word_accuracy_trend ?? source.wordAccuracyTrend),
  );
  const repeatedWordDifficulties = mapList(
    source.repeated_word_difficulties ?? source.repeatedWordDifficulties,
    (item) => {
      const expectedWord = readString(item || {}, ["expected_word", "expectedWord"]);
      if (!expectedWord) {
        return null;
      }
      return {
        expectedWord,
        timesExpected: readInt(item, ["times_expected", "timesExpected"]),
        timesCorrect: readInt(item, ["times_correct", "timesCorrect"]),
        timesIncorrect: readInt(item, ["times_incorrect", "timesIncorrect"]),
        accuracyPercentage: readDouble(item, ["accuracy_percentage", "accuracyPercentage"]),
        substitutions: readInt(item, ["substitutions"]),
        omissions: readInt(item, ["omissions"]),
      };
    },
  );
  const repeatedWordSubstitutions = mapList(
    source.repeated_word_substitutions ?? source.repeatedWordSubstitutions,
    (item) => {
      const expectedWord = readString(item || {}, ["expected_word", "expectedWord"]);
      const detectedWord = readString(item || {}, ["detected_word", "detectedWord"]);
      if (!expectedWord || !detectedWord) {
        return null;
      }
      return {
        expectedWord,
        detectedWord,
        count: readInt(item, ["count"]),
      };
    },
  );
  const fluencyTrendMap = asMap(source.fluency_trend ?? source.fluencyTrend);
  const fluencyTrend = fluencyTrendMap
    ? {
        attemptCount: readInt(fluencyTrendMap, ["attempt_count", "attemptCount"]),
        wordsPerMinute: mapSpeechMetricTrend(
          asMap(fluencyTrendMap.words_per_minute ?? fluencyTrendMap.wordsPerMinute),
        ),
        pauseRatioPercentage: mapSpeechMetricTrend(
          asMap(
            fluencyTrendMap.pause_ratio_percentage ?? fluencyTrendMap.pauseRatioPercentage,
          ),
        ),
        pauseCount: mapSpeechMetricTrend(
          asMap(fluencyTrendMap.pause_count ?? fluencyTrendMap.pauseCount),
        ),
        averagePauseDurationSeconds: mapSpeechMetricTrend(
          asMap(
            fluencyTrendMap.average_pause_duration_seconds ??
              fluencyTrendMap.averagePauseDurationSeconds,
          ),
        ),
        hasContent: Boolean(
          mapSpeechMetricTrend(
            asMap(fluencyTrendMap.words_per_minute ?? fluencyTrendMap.wordsPerMinute),
          ) ||
            mapSpeechMetricTrend(
              asMap(
                fluencyTrendMap.pause_ratio_percentage ?? fluencyTrendMap.pauseRatioPercentage,
              ),
            ) ||
            mapSpeechMetricTrend(asMap(fluencyTrendMap.pause_count ?? fluencyTrendMap.pauseCount)) ||
            mapSpeechMetricTrend(
              asMap(
                fluencyTrendMap.average_pause_duration_seconds ??
                  fluencyTrendMap.averagePauseDurationSeconds,
              ),
            ),
        ),
      }
    : null;
  const historyPoints = mapList(
    source.history_points ?? source.historyPoints,
    mapSpeechHistoryPoint,
  );
  const hasContent =
    wordAccuracyTrend?.hasContent ||
    repeatedWordDifficulties.length > 0 ||
    repeatedWordSubstitutions.length > 0 ||
    fluencyTrend?.hasContent ||
    historyPoints.length >= 2;
  if (!hasContent) {
    return null;
  }
  return {
    patientId: readText(source, ["patient_id", "patientId"]),
    exerciseId: readText(scope, ["exercise_id", "exerciseId"]),
    expectedText: readText(scope, ["expected_text", "expectedText"]),
    comparisonMode: readText(scope, ["comparison_mode", "comparisonMode"]),
    comparableAttemptCount: readInt(source, [
      "comparable_attempt_count",
      "comparableAttemptCount",
    ]),
    wordAccuracyTrend,
    repeatedWordDifficulties,
    repeatedWordSubstitutions,
    fluencyTrend: fluencyTrend?.hasContent ? fluencyTrend : null,
    historyPoints,
    hasContent: true,
  };
}

function mapSpeechAcousticMetricTrend(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const validAttemptCount = readInt(source, ["valid_attempt_count", "validAttemptCount"]);
  const first = readDouble(source, ["first"]);
  const latest = readDouble(source, ["latest"]);
  if ((validAttemptCount ?? 0) <= 0 && first == null && latest == null) {
    return null;
  }
  return {
    validAttemptCount,
    first,
    latest,
    change: readDouble(source, ["change"]),
    changeDirection: readText(source, ["change_direction", "changeDirection"]),
    average: readDouble(source, ["average"]),
    min: readDouble(source, ["min"]),
    max: readDouble(source, ["max"]),
    hasContent: (validAttemptCount ?? 0) > 0 && (first != null || latest != null),
  };
}

function mapSpeechAcousticHistoryPoint(map) {
  if (!map) {
    return null;
  }
  const analysisId = readString(map, ["analysis_id", "analysisId"]) || null;
  if (!analysisId) {
    return null;
  }
  return {
    analysisId,
    analyzedAt: readDateIso(map.analyzed_at ?? map.analyzedAt),
    targetPhone: readText(map, ["target_phone", "targetPhone"]),
    durationMs: readDouble(map, ["duration_ms", "durationMs"]),
    meanF0Hz: readDouble(map, ["mean_f0_hz", "meanF0Hz"]),
    meanIntensityDb: readDouble(map, ["mean_intensity_db", "meanIntensityDb"]),
    meanF1Hz: readDouble(map, ["mean_f1_hz", "meanF1Hz"]),
    meanF2Hz: readDouble(map, ["mean_f2_hz", "meanF2Hz"]),
    qualityStatus: readText(map, ["quality_status", "qualityStatus"]),
  };
}

export function mapSpeechAcousticProgress(map) {
  const source = asMap(map);
  if (!source) {
    return null;
  }
  const historyPoints = mapList(
    source.history_points ?? source.historyPoints,
    mapSpeechAcousticHistoryPoint,
  );
  const changesMap = asMap(source.changes_from_previous ?? source.changesFromPrevious);
  const durationTrend = mapSpeechAcousticMetricTrend(
    asMap(source.duration_trend ?? source.durationTrend),
  );
  const f0Trend = mapSpeechAcousticMetricTrend(asMap(source.f0_trend ?? source.f0Trend));
  const intensityTrend = mapSpeechAcousticMetricTrend(
    asMap(source.intensity_trend ?? source.intensityTrend),
  );
  const variabilityMap = asMap(source.variability);
  const variability = variabilityMap
    ? {
        durationMsStddev: readDouble(variabilityMap, [
          "duration_ms_stddev",
          "durationMsStddev",
        ]),
        f0HzStddev: readDouble(variabilityMap, ["f0_hz_stddev", "f0HzStddev"]),
        intensityDbStddev: readDouble(variabilityMap, [
          "intensity_db_stddev",
          "intensityDbStddev",
        ]),
        hasContent: Boolean(
          readDouble(variabilityMap, ["duration_ms_stddev", "durationMsStddev"]) != null ||
            readDouble(variabilityMap, ["f0_hz_stddev", "f0HzStddev"]) != null ||
            readDouble(variabilityMap, ["intensity_db_stddev", "intensityDbStddev"]) != null,
        ),
      }
    : null;
  const previousMap = asMap(
    source.previous_comparable_analysis ?? source.previousComparableAnalysis,
  );
  const previousComparableAnalysis = previousMap
    ? {
        analysisId: readText(previousMap, ["analysis_id", "analysisId"]),
        analyzedAt: readDateIso(previousMap.analyzed_at ?? previousMap.analyzedAt),
        durationMs: readDouble(previousMap, ["duration_ms", "durationMs"]),
        meanF0Hz: readDouble(previousMap, ["mean_f0_hz", "meanF0Hz"]),
        meanIntensityDb: readDouble(previousMap, ["mean_intensity_db", "meanIntensityDb"]),
        hasContent: Boolean(readText(previousMap, ["analysis_id", "analysisId"])),
      }
    : null;
  const usableAcousticAttempts = readInt(source, [
    "usable_acoustic_attempts",
    "usableAcousticAttempts",
  ]);
  const hasContent =
    (usableAcousticAttempts ?? 0) >= 2 ||
    durationTrend?.change != null ||
    historyPoints.filter((point) => point.durationMs != null).length >= 2 ||
    (usableAcousticAttempts ?? 0) >= 1 ||
    historyPoints.length > 0 ||
    durationTrend != null ||
    f0Trend != null ||
    intensityTrend != null;
  if (!hasContent) {
    return null;
  }
  return {
    totalComparableAttempts: readInt(source, [
      "total_comparable_attempts",
      "totalComparableAttempts",
    ]),
    usableAcousticAttempts,
    targetPhone: mapSpeechTargetPhone(asMap(source.target_phone ?? source.targetPhone)),
    durationTrend,
    f0Trend,
    intensityTrend,
    variability: variability?.hasContent ? variability : null,
    previousComparableAnalysis:
      previousComparableAnalysis?.hasContent ? previousComparableAnalysis : null,
    changesFromPrevious: changesMap
      ? {
          durationMs: readDouble(changesMap, ["duration_ms", "durationMs"]),
          f0Hz: readDouble(changesMap, ["f0_hz", "f0Hz"]),
          intensityDb: readDouble(changesMap, ["intensity_db", "intensityDb"]),
        }
      : null,
    historyPoints,
    hasContent: true,
  };
}

export function mapSpeechProgressBundle(root) {
  const map = asMap(root);
  if (!map) {
    return { insights: null, acousticProgress: null };
  }
  return {
    insights: mapSpeechProgressInsights(map.insights ?? map.progress_insights ?? map.progressInsights),
    acousticProgress: mapSpeechAcousticProgress(
      map.acoustic_progress ?? map.acousticProgress,
    ),
  };
}

export function buildSpeechProgressScope(analysis) {
  if (!analysis) {
    return { exerciseId: null, expectedText: null, targetPhoneme: null };
  }
  return {
    exerciseId: analysis.exerciseId || null,
    expectedText: analysis.expectedSpeech?.expectedText || null,
    targetPhoneme:
      analysis.phonemeAnalysis?.targetPhone?.requested ||
      analysis.expectedSpeech?.targetPhoneme ||
      null,
  };
}

export function getSpeechHistorySummary(analysis) {
  const accuracy = analysis?.wordAnalysis?.wordAccuracyPercentage;
  if (accuracy == null) {
    return { kind: "fallback" };
  }
  return { kind: "wordAccuracy", accuracy };
}

export function formatSpeechScore(score) {
  if (score == null || !Number.isFinite(score)) {
    return "—";
  }
  if (score <= 1) {
    return `${Math.round(score * 100)}%`;
  }
  if (score === Math.round(score)) {
    return String(Math.round(score));
  }
  return score.toFixed(1);
}

export function formatSpeechScoreDelta(delta) {
  if (delta == null || !Number.isFinite(delta)) {
    return "—";
  }
  const sign = delta > 0 ? "+" : "";
  if (delta === Math.round(delta)) {
    return `${sign}${Math.round(delta)}`;
  }
  return `${sign}${delta.toFixed(1)}`;
}

export function formatSpeechDateTime(iso) {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

export function formatSpeechDateOnly(iso) {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSpeechChartLabel(iso) {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatSubmissionShortId(submissionId) {
  if (!submissionId || typeof submissionId !== "string") {
    return "";
  }
  return submissionId.length > 8 ? submissionId.slice(0, 8) : submissionId;
}

export function speechInsightTrendLabel(trend) {
  switch ((trend || "").toLowerCase()) {
    case "improving":
    case "improvement":
      return "improving";
    case "declining":
    case "regression":
      return "declining";
    case "baseline":
      return "baseline";
    case "stable":
      return "stable";
    case "insufficient_data":
      return "insufficient_data";
    default:
      return trend || "stable";
  }
}

export function speechTrendLabel(trend) {
  switch ((trend || "").toLowerCase()) {
    case "improvement":
      return "Improving";
    case "regression":
      return "Declining";
    case "baseline":
      return "Baseline";
    case "stable":
      return "Stable";
    default:
      return trend || "—";
  }
}

export function speechTrendTone(trend) {
  switch ((trend || "").toLowerCase()) {
    case "improvement":
      return "improving";
    case "regression":
      return "declining";
    case "baseline":
      return "baseline";
    case "stable":
      return "stable";
    default:
      return "stable";
  }
}

function scoreDelta(current, previous) {
  if (current == null || previous == null) {
    return null;
  }
  return Number((current - previous).toFixed(2));
}

function inferTrend(overallChange) {
  if (overallChange == null) {
    return "stable";
  }
  if (overallChange >= 3) {
    return "improvement";
  }
  if (overallChange <= -3) {
    return "regression";
  }
  return "stable";
}

export function mapSpeechAiFeedback(raw) {
  const map = asMap(raw);
  if (!map) {
    return {
      clinicalNote: null,
      improvementSummary: null,
      recommendedAction: null,
      recommendations: [],
      treatmentAnalysis: null,
      decisionSupportReason: null,
      suggestedAction: null,
      transcriptSummary: null,
      hasContent: false,
    };
  }

  const provider = asMap(map.provider_response) || map;
  const decisionSupport = asMap(provider.decision_support || map.decision_support);
  const aiNote = asMap(map.ai_progress_note);

  const clinicalNote =
    readText(provider, ["clinical_note", "clinicalNote"]) ||
    readText(map, ["clinical_note", "clinicalNote"]) ||
    readText(aiNote, ["clinical_note", "clinicalNote"]);
  const improvementSummary =
    readText(provider, ["improvement_summary", "improvementSummary"]) ||
    readText(map, ["improvement_summary", "improvementSummary"]) ||
    readText(aiNote, ["improvement_summary", "improvementSummary"]);
  const recommendedAction =
    readText(provider, ["recommended_action", "recommendedAction"]) ||
    readText(map, ["recommended_action", "recommendedAction"]) ||
    readText(aiNote, ["recommended_action", "recommendedAction"]);
  const recommendations = [
    ...readRecommendations(provider),
    ...readRecommendations(map),
    ...readRecommendations(aiNote || {}),
  ];
  const treatmentAnalysis =
    readText(provider, ["treatment_analysis", "treatmentAnalysis"]) ||
    readText(map, ["treatment_analysis", "treatmentAnalysis"]) ||
    readText(aiNote, ["treatment_analysis", "treatmentAnalysis"]);
  const decisionSupportReason =
    readText(decisionSupport, ["reason"]) ||
    readText(asMap(map.decision_support), ["reason"]);
  const suggestedAction =
    readText(decisionSupport, ["suggested_action", "suggestedAction"]) ||
    readText(asMap(map.decision_support), ["suggested_action", "suggestedAction"]);
  const transcriptSummary =
    readText(aiNote, ["transcript_summary", "transcriptSummary"]) ||
    readText(map, ["transcript_summary", "transcriptSummary"]);

  // Dedupe recommendations while preserving order
  const uniqueRecommendations = [];
  for (const item of recommendations) {
    if (!uniqueRecommendations.includes(item)) {
      uniqueRecommendations.push(item);
    }
  }

  const hasContent = Boolean(
    clinicalNote ||
      improvementSummary ||
      recommendedAction ||
      uniqueRecommendations.length ||
      treatmentAnalysis ||
      decisionSupportReason ||
      transcriptSummary,
  );

  return {
    clinicalNote,
    improvementSummary,
    recommendedAction,
    recommendations: uniqueRecommendations,
    treatmentAnalysis,
    decisionSupportReason,
    suggestedAction,
    transcriptSummary,
    hasContent,
  };
}

export function mapSpeechComparison({ comparisonMap = null, current = null, previous = null } = {}) {
  if (comparisonMap) {
    const comparison = {
      comparedToAnalysisId: readString(comparisonMap, [
        "previous_speech_analysis_id",
        "compared_to_analysis_id",
        "comparedToAnalysisId",
      ]) || null,
      pronunciationChange: readDouble(comparisonMap, [
        "pronunciation_change",
        "pronunciationChange",
      ]),
      fluencyChange: readDouble(comparisonMap, ["fluency_change", "fluencyChange"]),
      overallScoreChange: readDouble(comparisonMap, [
        "overall_score_change",
        "overallScoreChange",
      ]),
      trend: readString(comparisonMap, ["trend"]) || null,
      previousAnalyzedAt: previous?.analyzedAt || null,
    };
    comparison.hasComparison = Boolean(
      comparison.pronunciationChange != null ||
        comparison.fluencyChange != null ||
        comparison.overallScoreChange != null ||
        comparison.trend,
    );
    comparison.trendLabel = speechTrendLabel(comparison.trend);
    comparison.trendTone = speechTrendTone(comparison.trend);
    return comparison;
  }

  if (!current || !previous) {
    return null;
  }

  const overallScoreChange = scoreDelta(current.overallScore, previous.overallScore);
  const comparison = {
    comparedToAnalysisId: previous.id || null,
    pronunciationChange: scoreDelta(current.pronunciationScore, previous.pronunciationScore),
    fluencyChange: scoreDelta(current.fluencyScore, previous.fluencyScore),
    overallScoreChange,
    trend: inferTrend(overallScoreChange),
    previousAnalyzedAt: previous.analyzedAt || null,
  };
  comparison.hasComparison = Boolean(
    comparison.pronunciationChange != null ||
      comparison.fluencyChange != null ||
      comparison.overallScoreChange != null ||
      comparison.trend,
  );
  comparison.trendLabel = speechTrendLabel(comparison.trend);
  comparison.trendTone = speechTrendTone(comparison.trend);
  return comparison;
}

export function mapSpeechAnalysisItem(row, { fallbackPatientId = "", fallbackPatientName = "" } = {}) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const raw = asMap(row.raw_ai_output ?? row.rawAiOutput);
  const nestedCurrent = asMap(row.current_analysis);
  const source = nestedCurrent || row;
  const aiNote = asMap(row.ai_progress_note);
  const feedback = aiNote
    ? mapSpeechAiFeedback(aiNote)
    : mapSpeechAiFeedback(raw);
  const comparisonMap = asMap(row.comparison);
  const expectedSpeech = mapSpeechExpectedSpeech(
    asMap(source.expected_speech ?? source.expectedSpeech),
  );
  const topLevelWordAccuracy = readDouble(source, [
    "word_accuracy_percentage",
    "wordAccuracyPercentage",
  ]);
  const wordAnalysis = mapSpeechWordAnalysis(
    asMap(source.word_analysis ?? source.wordAnalysis),
    topLevelWordAccuracy,
  );
  const fluencyMetrics = mapSpeechFluencyMetrics(
    asMap(source.fluency_metrics ?? source.fluencyMetrics),
  );
  const asrConfidence = mapSpeechAsrConfidence(
    asMap(source.asr_confidence ?? source.asrConfidence),
  );
  const analysisQuality = mapSpeechAnalysisQuality(
    asMap(source.analysis_quality ?? source.analysisQuality),
  );
  const phonemeAnalysis = mapSpeechPhonemeAnalysis(
    asMap(source.phoneme_analysis ?? source.phonemeAnalysis),
  );
  const progressInsights = mapSpeechProgressInsights(
    asMap(row.progress_insights ?? row.progressInsights ?? row.insights),
  );

  const item = {
    id: readString(source, ["id", "_id"]),
    submissionId: readString(source, ["submission_id", "submissionId"]),
    patientId:
      readString(source, ["patient_id", "patientId"]) ||
      fallbackPatientId ||
      "",
    patientName:
      readString(source, ["patient_name", "patientName"]) ||
      fallbackPatientName ||
      readString(raw || {}, ["patient_name", "patientName"]) ||
      null,
    transcript: readText(source, ["transcript"]),
    pronunciationScore: readDouble(source, ["pronunciation_score", "pronunciationScore"]),
    fluencyScore: readDouble(source, ["fluency_score", "fluencyScore"]),
    overallScore: readDouble(source, ["overall_score", "overallScore"]),
    comparedToAnalysisId:
      readString(source, ["compared_to_analysis_id", "comparedToAnalysisId"]) || null,
    rawAiOutput: raw,
    analyzedAt: readDateIso(source.analyzed_at ?? source.analyzedAt),
    exerciseId: readText(source, ["exercise_id", "exerciseId"]),
    exerciseTitle: readText(source, ["exercise_title", "exerciseTitle"]),
    submissionStatus: readText(source, ["submission_status", "submissionStatus", "status"]),
    audioFileUrl: readText(source, ["audio_file_url", "audioFileUrl", "file_url", "fileUrl"]),
    language:
      readText(source, ["language"]) ||
      readText(raw || {}, ["language"]),
    durationSeconds:
      readDouble(source, ["duration", "duration_seconds", "durationSeconds"]) ??
      readDouble(raw || {}, ["duration"]),
    expectedSpeech,
    wordAnalysis,
    fluencyMetrics,
    asrConfidence,
    analysisQuality,
    phonemeAnalysis,
    progressInsights,
    aiFeedback: feedback,
    comparison: mapSpeechComparison({ comparisonMap }),
  };

  if (!item.id) {
    return null;
  }
  return item;
}

export function mapSpeechProgressPoint(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  return {
    id,
    pronunciationScore: readDouble(row, ["pronunciation_score", "pronunciationScore"]),
    fluencyScore: readDouble(row, ["fluency_score", "fluencyScore"]),
    overallScore: readDouble(row, ["overall_score", "overallScore"]),
    wordAccuracyPercentage: readDouble(row, [
      "word_accuracy_percentage",
      "wordAccuracyPercentage",
    ]),
    analyzedAt: readDateIso(row.analyzed_at ?? row.analyzedAt),
  };
}

export function mergeSpeechAnalyses(analyses, extra) {
  if (!extra?.id) {
    return analyses;
  }
  const merged = [extra, ...analyses.filter((item) => item.id !== extra.id)];
  merged.sort((a, b) => {
    const aTime = a.analyzedAt ? new Date(a.analyzedAt).getTime() : 0;
    const bTime = b.analyzedAt ? new Date(b.analyzedAt).getTime() : 0;
    return bTime - aTime;
  });
  return merged;
}

export function findPreviousSpeechAnalysis(selected, analyses) {
  const index = analyses.findIndex((item) => item.id === selected?.id);
  if (index < 0 || index + 1 >= analyses.length) {
    return null;
  }
  return analyses[index + 1];
}

export function buildSpeechComparison(selected, analyses) {
  if (!selected) {
    return null;
  }
  if (selected.comparison?.hasComparison) {
    return selected.comparison;
  }

  let previous = null;
  const compareId = selected.comparedToAnalysisId;
  if (compareId) {
    previous = analyses.find((item) => item.id === compareId) || null;
  }
  previous = previous || findPreviousSpeechAnalysis(selected, analyses);
  return mapSpeechComparison({ current: selected, previous });
}

export function resolvePatientName(patientRow, fallbackName = "") {
  return (
    readString(patientRow || {}, ["full_name", "fullName", "name"]) ||
    fallbackName ||
    "Patient"
  );
}

export function isArabicLanguage(language) {
  return (language || "").trim().toLowerCase().startsWith("ar");
}
