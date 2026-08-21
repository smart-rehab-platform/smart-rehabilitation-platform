import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSpeechComparison,
  buildSpeechProgressScope,
  formatSpeechScore,
  formatSpeechScoreDelta,
  mapSpeechAcousticProgress,
  mapSpeechAnalysisItem,
  mapSpeechAiFeedback,
  mapSpeechAnalysisQuality,
  mapSpeechExpectedSpeech,
  mapSpeechFluencyMetrics,
  mapSpeechPhonemeAnalysis,
  mapSpeechProgressInsights,
  mapSpeechProgressPoint,
  mapSpeechWordAnalysis,
  mergeSpeechAnalyses,
  speechTrendLabel,
} from "./specialistSpeechAnalysisMappers.js";

describe("specialistSpeechAnalysisMappers", () => {
  it("formats scores like Flutter", () => {
    assert.equal(formatSpeechScore(null), "—");
    assert.equal(formatSpeechScore(0.85), "85%");
    assert.equal(formatSpeechScore(85), "85");
    assert.equal(formatSpeechScore(85.5), "85.5");
    assert.equal(formatSpeechScoreDelta(null), "—");
    assert.equal(formatSpeechScoreDelta(-30), "-30");
    assert.equal(formatSpeechScoreDelta(12), "+12");
  });

  it("maps analysis item and AI feedback from analyze response shape", () => {
    const item = mapSpeechAnalysisItem({
      id: "a1",
      submission_id: "s1",
      patient_id: "p1",
      transcript: "Hello",
      pronunciation_score: "85.00",
      fluency_score: "85.00",
      overall_score: "85.00",
      language: "en",
      duration: 10,
      analyzed_at: "2026-08-12T19:59:37.557Z",
      ai_progress_note: {
        improvement_summary: "Baseline summary",
        clinical_note: "Clinical note",
        recommended_action: "Keep practicing",
        provider_response: {
          recommendations: ["A", "B"],
          decision_support: {
            reason: "Reason",
            suggested_action: "Suggested",
          },
        },
      },
      comparison: {
        trend: "baseline",
        pronunciation_change: null,
        fluency_change: null,
        overall_score_change: null,
      },
    });

    assert.equal(item.id, "a1");
    assert.equal(item.overallScore, 85);
    assert.equal(item.durationSeconds, 10);
    assert.equal(item.aiFeedback.hasContent, true);
    assert.equal(item.aiFeedback.improvementSummary, "Baseline summary");
    assert.deepEqual(item.aiFeedback.recommendations, ["A", "B"]);
    assert.equal(item.comparison.hasComparison, true);
    assert.equal(speechTrendLabel(item.comparison.trend), "Baseline");
  });

  it("maps modern V3 analysis response with nested current_analysis", () => {
    const item = mapSpeechAnalysisItem({
      current_analysis: {
        id: "modern-1",
        submission_id: "sub-1",
        exercise_id: "ex-1",
        transcript: "Hello world",
        pronunciation_score: 80,
        fluency_score: 75,
        overall_score: 78,
        word_accuracy_percentage: 82,
        expected_speech: {
          expected_text: "Hello world",
          target_word: "world",
          target_phoneme: "r",
        },
        word_analysis: {
          word_accuracy_percentage: 82,
          correct_words: 2,
          substitutions: 0,
          omissions: 0,
          insertions: 0,
          aligned_words: [{ expected: "hello", detected: "hello", status: "correct" }],
        },
        fluency_metrics: {
          speech_duration_seconds: 3.2,
          words_per_minute: 90,
          pause_count: 1,
        },
        asr_confidence: {
          average_word_probability: 0.91,
        },
        analysis_quality: {
          status: "good",
          confidence: "high",
          warnings: [{ code: "sample", message: "Sample warning" }],
        },
        phoneme_analysis: {
          quality: { available: true, status: "available" },
          target_occurrences: [
            {
              word: "world",
              phone: "R",
              acoustic_measurements: { duration_ms: 120, mean_f0_hz: 180 },
            },
          ],
        },
        analyzed_at: "2026-08-12T20:00:00.000Z",
      },
      progress_insights: {
        comparable_attempt_count: 2,
        word_accuracy_trend: {
          first_accuracy: 70,
          latest_accuracy: 82,
          trend: "improving",
        },
        history_points: [
          { analysis_id: "a", word_accuracy_percentage: 70, analyzed_at: "2026-08-01T00:00:00.000Z" },
          { analysis_id: "b", word_accuracy_percentage: 82, analyzed_at: "2026-08-12T00:00:00.000Z" },
        ],
      },
    });

    assert.equal(item.id, "modern-1");
    assert.equal(item.exerciseId, "ex-1");
    assert.equal(item.expectedSpeech.expectedText, "Hello world");
    assert.equal(item.wordAnalysis.wordAccuracyPercentage, 82);
    assert.equal(item.fluencyMetrics.wordsPerMinute, 90);
    assert.equal(item.asrConfidence.averageWordProbability, 0.91);
    assert.equal(item.analysisQuality.status, "good");
    assert.equal(item.phonemeAnalysis.hasContent, true);
    assert.equal(item.progressInsights.hasContent, true);
  });

  it("maps legacy analysis safely without advanced sections", () => {
    const item = mapSpeechAnalysisItem({
      id: "legacy-1",
      submission_id: "sub-legacy",
      transcript: "Hi",
      pronunciation_score: 60,
      fluency_score: 55,
      overall_score: 58,
      analyzed_at: "2025-01-01T00:00:00.000Z",
    });

    assert.equal(item.id, "legacy-1");
    assert.equal(item.expectedSpeech, null);
    assert.equal(item.wordAnalysis, null);
    assert.equal(item.fluencyMetrics, null);
    assert.equal(item.phonemeAnalysis, null);
    assert.equal(item.analysisQuality, null);
  });

  it("maps expected speech and word accuracy fallback", () => {
    const expected = mapSpeechExpectedSpeech({
      expected_text: "Say red",
      target_phoneme: "r",
    });
    assert.equal(expected.expectedText, "Say red");
    assert.equal(expected.targetPhoneme, "r");

    const wordAnalysis = mapSpeechWordAnalysis(null, 77.5);
    assert.equal(wordAnalysis.wordAccuracyPercentage, 77.5);
    assert.equal(wordAnalysis.hasContent, true);
  });

  it("maps progress point word accuracy and progress bundle insights", () => {
    const point = mapSpeechProgressPoint({
      id: "p1",
      overall_score: 80,
      word_accuracy_percentage: 75,
      analyzed_at: "2026-08-12T20:00:00.000Z",
    });
    assert.equal(point.wordAccuracyPercentage, 75);

    const insights = mapSpeechProgressInsights({
      comparable_attempt_count: 3,
      word_accuracy_trend: {
        first_accuracy: 60,
        latest_accuracy: 75,
        trend: "improving",
      },
      repeated_word_difficulties: [{ expected_word: "red", accuracy_percentage: 40 }],
      history_points: [
        { analysis_id: "1", word_accuracy_percentage: 60, analyzed_at: "2026-08-01T00:00:00.000Z" },
        { analysis_id: "2", word_accuracy_percentage: 75, analyzed_at: "2026-08-12T00:00:00.000Z" },
      ],
    });
    assert.equal(insights.hasContent, true);
    assert.equal(insights.wordAccuracyTrend.latestAccuracy, 75);
    assert.equal(insights.repeatedWordDifficulties.length, 1);
  });

  it("maps acoustic progress and phoneme analysis only when meaningful", () => {
    const acoustic = mapSpeechAcousticProgress({
      usable_acoustic_attempts: 2,
      duration_trend: { valid_attempt_count: 2, first: 100, latest: 120, change: 20 },
      history_points: [
        { analysis_id: "1", duration_ms: 100, analyzed_at: "2026-08-01T00:00:00.000Z" },
        { analysis_id: "2", duration_ms: 120, analyzed_at: "2026-08-12T00:00:00.000Z" },
      ],
    });
    assert.equal(acoustic.hasContent, true);

    assert.equal(mapSpeechPhonemeAnalysis(null), null);
    assert.equal(mapSpeechAnalysisQuality(null), null);
    assert.equal(mapSpeechFluencyMetrics(null), null);
  });

  it("builds progress scope like Flutter", () => {
    const analysis = mapSpeechAnalysisItem({
      id: "a",
      submission_id: "s",
      exercise_id: "ex-1",
      expected_speech: { expected_text: "Hello", target_phoneme: "r" },
      phoneme_analysis: {
        quality: { available: true },
        target_phone: { requested: "r" },
      },
      word_analysis: { word_accuracy_percentage: 80 },
      analyzed_at: "2026-08-12T20:00:00.000Z",
    });
    const scope = buildSpeechProgressScope(analysis);
    assert.equal(scope.exerciseId, "ex-1");
    assert.equal(scope.expectedText, "Hello");
    assert.equal(scope.targetPhoneme, "r");
  });

  it("builds declining comparison from previous analysis", () => {
    const newer = mapSpeechAnalysisItem({
      id: "new",
      submission_id: "s2",
      pronunciation_score: 55,
      fluency_score: 65,
      overall_score: 60,
      analyzed_at: "2026-08-12T20:00:00.000Z",
    });
    const older = mapSpeechAnalysisItem({
      id: "old",
      submission_id: "s1",
      pronunciation_score: 85,
      fluency_score: 85,
      overall_score: 85,
      analyzed_at: "2026-08-12T19:00:00.000Z",
    });
    const merged = mergeSpeechAnalyses([older], newer);
    assert.deepEqual(merged.map((row) => row.id), ["new", "old"]);
    const comparison = buildSpeechComparison(newer, merged);
    assert.equal(comparison.trend, "regression");
    assert.equal(comparison.trendLabel, "Declining");
    assert.equal(comparison.overallScoreChange, -25);
    assert.equal(comparison.pronunciationChange, -30);
  });

  it("parses nested provider_response AI feedback", () => {
    const feedback = mapSpeechAiFeedback({
      provider_response: {
        clinical_note: "Note",
        improvement_summary: "Improved",
      },
    });
    assert.equal(feedback.clinicalNote, "Note");
    assert.equal(feedback.improvementSummary, "Improved");
    assert.equal(feedback.hasContent, true);
  });
});
