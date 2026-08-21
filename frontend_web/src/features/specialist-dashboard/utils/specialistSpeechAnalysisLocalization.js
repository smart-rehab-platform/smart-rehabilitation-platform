import { formatAppDateTime } from "../../../i18n/formatters.js";
import {
  formatSpeechScore,
  formatSpeechScoreDelta,
  getSpeechHistorySummary,
  speechInsightTrendLabel,
  speechTrendLabel,
} from "./specialistSpeechAnalysisMappers.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

export function getSpecialistSpeechAnalysisLabels(t) {
  return {
    pageTitle: translateKey(t, "specialist.speechAnalysis.pageTitle", "Speech Analysis"),
    backToPatient: translateKey(t, "specialist.speechAnalysis.backToPatient", "Back to Patient"),
    loading: translateKey(t, "specialist.speechAnalysis.loading", "Loading speech analysis..."),
    retry: translateKey(t, "specialist.speechAnalysis.retry", "Retry"),
    emptyResults: translateKey(
      t,
      "specialist.speechAnalysis.emptyResults",
      "No speech analysis results yet. Run analysis on an audio submission to get started.",
    ),
    latestSummary: translateKey(
      t,
      "specialist.speechAnalysis.latestSummary",
      "Latest Analysis Summary",
    ),
    resultsSubtitle: translateKey(
      t,
      "specialist.speechAnalysis.resultsSubtitle",
      "Speech analysis results",
    ),
    latestLine: translateKey(t, "specialist.speechAnalysis.latestLine", "Latest: {dateTime}"),
    submissionLine: translateKey(t, "specialist.speechAnalysis.submissionLine", "Submission {id}"),
    scoresTitle: translateKey(t, "specialist.speechAnalysis.scoresTitle", "Scores"),
    pronunciation: translateKey(t, "specialist.speechAnalysis.pronunciation", "Pronunciation"),
    fluency: translateKey(t, "specialist.speechAnalysis.fluency", "Fluency"),
    overall: translateKey(t, "specialist.speechAnalysis.overall", "Overall"),
    expectedVsSpoken: translateKey(
      t,
      "specialist.speechAnalysis.expectedVsSpoken",
      "Expected vs Spoken",
    ),
    expected: translateKey(t, "specialist.speechAnalysis.expected", "Expected"),
    spoken: translateKey(t, "specialist.speechAnalysis.spoken", "Spoken"),
    targetWord: translateKey(t, "specialist.speechAnalysis.targetWord", "Target word"),
    targetPhoneme: translateKey(t, "specialist.speechAnalysis.targetPhoneme", "Target sound"),
    analysisQuality: translateKey(
      t,
      "specialist.speechAnalysis.analysisQuality",
      "Analysis Quality",
    ),
    asrConfidence: translateKey(
      t,
      "specialist.speechAnalysis.asrConfidence",
      "ASR Transcription Confidence",
    ),
    averageWordProbability: translateKey(
      t,
      "specialist.speechAnalysis.averageWordProbability",
      "Average word probability",
    ),
    wordAnalysis: translateKey(t, "specialist.speechAnalysis.wordAnalysis", "Word Analysis"),
    wordAccuracy: translateKey(t, "specialist.speechAnalysis.wordAccuracy", "Word accuracy"),
    wordCorrect: translateKey(t, "specialist.speechAnalysis.wordCorrect", "Correct"),
    wordSubstitutions: translateKey(
      t,
      "specialist.speechAnalysis.wordSubstitutions",
      "ASR Mismatches",
    ),
    wordOmissions: translateKey(t, "specialist.speechAnalysis.wordOmissions", "Omissions"),
    wordInsertions: translateKey(t, "specialist.speechAnalysis.wordInsertions", "Insertions"),
    alignedWords: translateKey(t, "specialist.speechAnalysis.alignedWords", "Aligned words"),
    timingTitle: translateKey(
      t,
      "specialist.speechAnalysis.timingTitle",
      "Speech Timing & Fluency",
    ),
    timingSubtitle: translateKey(
      t,
      "specialist.speechAnalysis.timingSubtitle",
      "Objective timing measurements from audio transcription timestamps.",
    ),
    speakingRate: translateKey(t, "specialist.speechAnalysis.speakingRate", "Speaking Rate"),
    speechDuration: translateKey(t, "specialist.speechAnalysis.speechDuration", "Speech Duration"),
    pauses: translateKey(t, "specialist.speechAnalysis.pauses", "Pauses"),
    totalPauseTime: translateKey(t, "specialist.speechAnalysis.totalPauseTime", "Total Pause Time"),
    longestPause: translateKey(t, "specialist.speechAnalysis.longestPause", "Longest Pause"),
    pauseRatio: translateKey(t, "specialist.speechAnalysis.pauseRatio", "Pause Ratio"),
    wordsPerMinute: translateKey(t, "specialist.speechAnalysis.wordsPerMinute", "{value} words/min"),
    secondsValue: translateKey(t, "specialist.speechAnalysis.secondsValue", "{value} sec"),
    phonemeTitle: translateKey(
      t,
      "specialist.speechAnalysis.phonemeTitle",
      "Target Sound Alignment",
    ),
    alignedOccurrences: translateKey(
      t,
      "specialist.speechAnalysis.alignedOccurrences",
      "Aligned Occurrences",
    ),
    acousticMeasurements: translateKey(
      t,
      "specialist.speechAnalysis.acousticMeasurements",
      "Acoustic Measurements",
    ),
    progressInsightsTitle: translateKey(
      t,
      "specialist.speechAnalysis.progressInsightsTitle",
      "Speech Progress Insights",
    ),
    repeatedDifficulties: translateKey(
      t,
      "specialist.speechAnalysis.repeatedDifficulties",
      "Repeated Difficulties",
    ),
    repeatedSubstitutions: translateKey(
      t,
      "specialist.speechAnalysis.repeatedSubstitutions",
      "Repeated ASR Mismatches",
    ),
    fluencyTrends: translateKey(t, "specialist.speechAnalysis.fluencyTrends", "Fluency Trends"),
    insufficientHistory: translateKey(
      t,
      "specialist.speechAnalysis.insufficientHistory",
      "Not enough comparable attempts yet for trend insights.",
    ),
    progressLoading: translateKey(
      t,
      "specialist.speechAnalysis.progressLoading",
      "Loading progress insights...",
    ),
    progressLoadFailed: translateKey(
      t,
      "specialist.speechAnalysis.progressLoadFailed",
      "Unable to load progress insights.",
    ),
    acousticProgressTitle: translateKey(
      t,
      "specialist.speechAnalysis.acousticProgressTitle",
      "Target Sound Acoustic Progress",
    ),
    previousAttempt: translateKey(
      t,
      "specialist.speechAnalysis.previousAttempt",
      "Previous attempt",
    ),
    wordAccuracyChartTitle: translateKey(
      t,
      "specialist.speechAnalysis.wordAccuracyChartTitle",
      "Word Accuracy Over Time",
    ),
    acousticDurationChartTitle: translateKey(
      t,
      "specialist.speechAnalysis.acousticDurationChartTitle",
      "Target Sound Duration Over Time",
    ),
    overallTrendTitle: translateKey(
      t,
      "specialist.speechAnalysis.overallTrendTitle",
      "Overall Score Trend",
    ),
    comparisonTitle: translateKey(
      t,
      "specialist.speechAnalysis.comparisonTitle",
      "Comparison with Previous",
    ),
    previousLine: translateKey(t, "specialist.speechAnalysis.previousLine", "Previous: {date}"),
    aiFeedbackTitle: translateKey(
      t,
      "specialist.speechAnalysis.aiFeedbackTitle",
      "AI Feedback & Recommendations",
    ),
    improvementSummary: translateKey(
      t,
      "specialist.speechAnalysis.improvementSummary",
      "Improvement Summary",
    ),
    clinicalNote: translateKey(t, "specialist.speechAnalysis.clinicalNote", "Clinical Note"),
    recommendedAction: translateKey(
      t,
      "specialist.speechAnalysis.recommendedAction",
      "Recommended Action",
    ),
    recommendations: translateKey(t, "specialist.speechAnalysis.recommendations", "Recommendations"),
    treatmentAnalysis: translateKey(
      t,
      "specialist.speechAnalysis.treatmentAnalysis",
      "Treatment Analysis",
    ),
    decisionSupport: translateKey(
      t,
      "specialist.speechAnalysis.decisionSupport",
      "Decision Support",
    ),
    suggestedLine: translateKey(t, "specialist.speechAnalysis.suggestedLine", "Suggested: {action}"),
    transcriptTitle: translateKey(t, "specialist.speechAnalysis.transcriptTitle", "Transcript"),
    languageLine: translateKey(t, "specialist.speechAnalysis.languageLine", "Language: {language}"),
    durationLine: translateKey(t, "specialist.speechAnalysis.durationLine", "Duration: {seconds}s"),
    noTranscript: translateKey(
      t,
      "specialist.speechAnalysis.noTranscript",
      "No transcript available for this analysis.",
    ),
    historyTitle: translateKey(t, "specialist.speechAnalysis.historyTitle", "Analysis History"),
    emptyHistory: translateKey(
      t,
      "specialist.speechAnalysis.emptyHistory",
      "No previous speech analyses recorded.",
    ),
    historyWordAccuracy: translateKey(
      t,
      "specialist.speechAnalysis.historyWordAccuracy",
      "Word Accuracy: {accuracy}%",
    ),
    historyFallback: translateKey(
      t,
      "specialist.speechAnalysis.historyFallback",
      "Speech analysis",
    ),
    historySummary: translateKey(
      t,
      "specialist.speechAnalysis.historySummary",
      "Overall {overall} • Pronunciation {pronunciation}",
    ),
    unknownDate: translateKey(t, "specialist.speechAnalysis.unknownDate", "Unknown date"),
    runTitle: translateKey(t, "specialist.speechAnalysis.runTitle", "Run Speech Analysis"),
    runSubtitle: translateKey(
      t,
      "specialist.speechAnalysis.runSubtitle",
      "Analyze the audio from this exercise submission using speech recognition.",
    ),
    analyzing: translateKey(t, "specialist.speechAnalysis.analyzing", "Analyzing..."),
    analyzeSubmission: translateKey(
      t,
      "specialist.speechAnalysis.analyzeSubmission",
      "Analyze Submission",
    ),
    audioPlayback: translateKey(t, "specialist.speechAnalysis.audioPlayback", "Submission audio"),
    audioLoadFailed: translateKey(
      t,
      "specialist.speechAnalysis.audioLoadFailed",
      "Unable to load audio recording.",
    ),
    existingLoaded: translateKey(
      t,
      "specialist.speechAnalysis.existingLoaded",
      "Existing speech analysis loaded.",
    ),
    completedSuccess: translateKey(
      t,
      "specialist.speechAnalysis.completedSuccess",
      "Speech analysis completed successfully.",
    ),
    noSubmissionSelected: translateKey(
      t,
      "specialist.speechAnalysis.noSubmissionSelected",
      "No submission selected for speech analysis.",
    ),
    trendImproving: translateKey(t, "specialist.speechAnalysis.trendImproving", "Improving"),
    trendDeclining: translateKey(t, "specialist.speechAnalysis.trendDeclining", "Declining"),
    trendBaseline: translateKey(t, "specialist.speechAnalysis.trendBaseline", "Baseline"),
    trendStable: translateKey(t, "specialist.speechAnalysis.trendStable", "Stable"),
    trendInsufficient: translateKey(
      t,
      "specialist.speechAnalysis.trendInsufficient",
      "Insufficient data",
    ),
    qualityGood: translateKey(t, "specialist.speechAnalysis.qualityGood", "Good"),
    qualityUsableWithCaution: translateKey(
      t,
      "specialist.speechAnalysis.qualityUsableWithCaution",
      "Use with Caution",
    ),
    qualityLow: translateKey(
      t,
      "specialist.speechAnalysis.qualityLow",
      "Low Quality Recording/Analysis",
    ),
    statusCorrect: translateKey(t, "specialist.speechAnalysis.statusCorrect", "Correct"),
    statusSubstitution: translateKey(
      t,
      "specialist.speechAnalysis.statusSubstitution",
      "Mismatch",
    ),
    statusOmission: translateKey(t, "specialist.speechAnalysis.statusOmission", "Omission"),
    statusInsertion: translateKey(t, "specialist.speechAnalysis.statusInsertion", "Insertion"),
    durationMs: translateKey(t, "specialist.speechAnalysis.durationMs", "Duration"),
    meanF0: translateKey(t, "specialist.speechAnalysis.meanF0", "Mean F0"),
    meanIntensity: translateKey(t, "specialist.speechAnalysis.meanIntensity", "Mean intensity"),
    meanF1: translateKey(t, "specialist.speechAnalysis.meanF1", "Mean F1"),
    meanF2: translateKey(t, "specialist.speechAnalysis.meanF2", "Mean F2"),
    detectedCount: translateKey(
      t,
      "specialist.speechAnalysis.detectedCount",
      "Detected {count} times",
    ),
  };
}

export function getSpeechQualityStatusLabel(status, t) {
  switch ((status || "").toLowerCase()) {
    case "good":
      return translateKey(t, "specialist.speechAnalysis.qualityGood", "Good");
    case "usable_with_caution":
      return translateKey(
        t,
        "specialist.speechAnalysis.qualityUsableWithCaution",
        "Use with Caution",
      );
    case "low_quality":
      return translateKey(
        t,
        "specialist.speechAnalysis.qualityLow",
        "Low Quality Recording/Analysis",
      );
    default:
      return status || "—";
  }
}

export function getSpeechTrendDisplayLabel(trend, t) {
  switch (speechInsightTrendLabel(trend)) {
    case "improving":
      return translateKey(t, "specialist.speechAnalysis.trendImproving", "Improving");
    case "declining":
      return translateKey(t, "specialist.speechAnalysis.trendDeclining", "Declining");
    case "baseline":
      return translateKey(t, "specialist.speechAnalysis.trendBaseline", "Baseline");
    case "insufficient_data":
      return translateKey(
        t,
        "specialist.speechAnalysis.trendInsufficient",
        "Insufficient data",
      );
    default:
      return translateKey(t, "specialist.speechAnalysis.trendStable", "Stable");
  }
}

export function getSpeechComparisonTrendLabel(trend, t) {
  return getSpeechTrendDisplayLabel(speechTrendLabel(trend), t);
}

export function getSpeechWordStatusLabel(status, t) {
  switch ((status || "").toLowerCase()) {
    case "correct":
      return translateKey(t, "specialist.speechAnalysis.statusCorrect", "Correct");
    case "substitution":
      return translateKey(t, "specialist.speechAnalysis.statusSubstitution", "Mismatch");
    case "omission":
      return translateKey(t, "specialist.speechAnalysis.statusOmission", "Omission");
    case "insertion":
      return translateKey(t, "specialist.speechAnalysis.statusInsertion", "Insertion");
    default:
      return status || "—";
  }
}

export function formatSpeechAnalysisDateTime(iso, locale, t) {
  if (!iso) {
    return translateKey(t, "specialist.speechAnalysis.unknownDate", "Unknown date");
  }
  return formatAppDateTime(iso, locale) || translateKey(
    t,
    "specialist.speechAnalysis.unknownDate",
    "Unknown date",
  );
}

export function getSpeechHistorySummaryLabel(analysis, t) {
  const summary = getSpeechHistorySummary(analysis);
  if (summary.kind === "wordAccuracy") {
    const accuracy =
      summary.accuracy === Math.round(summary.accuracy)
        ? String(Math.round(summary.accuracy))
        : summary.accuracy.toFixed(1);
    return translateKey(
      t,
      "specialist.speechAnalysis.historyWordAccuracy",
      "Word Accuracy: {accuracy}%",
      { accuracy },
    );
  }
  if (analysis?.overallScore != null || analysis?.pronunciationScore != null) {
    return translateKey(
      t,
      "specialist.speechAnalysis.historySummary",
      "Overall {overall} • Pronunciation {pronunciation}",
      {
        overall: formatSpeechScore(analysis?.overallScore),
        pronunciation: formatSpeechScore(analysis?.pronunciationScore),
      },
    );
  }
  return translateKey(t, "specialist.speechAnalysis.historyFallback", "Speech analysis");
}

export function formatSpeechMetricDelta(delta, t) {
  return formatSpeechScoreDelta(delta);
}
