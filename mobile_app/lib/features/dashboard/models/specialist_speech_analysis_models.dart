import 'dart:convert';

import '../../../core/utils/api_response_parser.dart';

/// Parsed AI feedback extracted from [raw_ai_output] or nested progress-note fields.
class SpeechAnalysisAiFeedback {
  const SpeechAnalysisAiFeedback({
    this.clinicalNote,
    this.improvementSummary,
    this.recommendedAction,
    this.recommendations = const [],
    this.treatmentAnalysis,
    this.decisionSupportReason,
    this.suggestedAction,
    this.transcriptSummary,
  });

  final String? clinicalNote;
  final String? improvementSummary;
  final String? recommendedAction;
  final List<String> recommendations;
  final String? treatmentAnalysis;
  final String? decisionSupportReason;
  final String? suggestedAction;
  final String? transcriptSummary;

  bool get hasContent =>
      (clinicalNote?.trim().isNotEmpty ?? false) ||
      (improvementSummary?.trim().isNotEmpty ?? false) ||
      (recommendedAction?.trim().isNotEmpty ?? false) ||
      recommendations.isNotEmpty ||
      (treatmentAnalysis?.trim().isNotEmpty ?? false) ||
      (decisionSupportReason?.trim().isNotEmpty ?? false) ||
      (transcriptSummary?.trim().isNotEmpty ?? false);

  static SpeechAnalysisAiFeedback fromRawOutput(dynamic raw) {
    final map = _normalizeRawMap(raw);
    if (map == null) {
      return const SpeechAnalysisAiFeedback();
    }

    final provider = ApiResponseParser.asMap(map['provider_response']) ?? map;
    final decisionSupport = ApiResponseParser.asMap(
      provider['decision_support'] ?? map['decision_support'],
    );
    final aiNote = ApiResponseParser.asMap(map['ai_progress_note']);

    return SpeechAnalysisAiFeedback(
      clinicalNote: _readText(provider, const ['clinical_note', 'clinicalNote']) ??
          _readText(aiNote, const ['clinical_note', 'clinicalNote']),
      improvementSummary:
          _readText(provider, const ['improvement_summary', 'improvementSummary']) ??
              _readText(aiNote, const ['improvement_summary', 'improvementSummary']),
      recommendedAction:
          _readText(provider, const ['recommended_action', 'recommendedAction']) ??
              _readText(aiNote, const ['recommended_action', 'recommendedAction']),
      recommendations: _readRecommendations(provider) +
          _readRecommendations(aiNote ?? const {}),
      treatmentAnalysis:
          _readText(provider, const ['treatment_analysis', 'treatmentAnalysis']) ??
              _readText(aiNote, const ['treatment_analysis', 'treatmentAnalysis']),
      decisionSupportReason: _readText(decisionSupport, const ['reason']),
      suggestedAction: _readText(decisionSupport, const [
        'suggested_action',
        'suggestedAction',
      ]),
      transcriptSummary: _readText(aiNote, const [
        'transcript_summary',
        'transcriptSummary',
      ]),
    );
  }
}

class SpeechExpectedSpeech {
  const SpeechExpectedSpeech({
    this.expectedText,
    this.targetWord,
    this.targetPhoneme,
  });

  final String? expectedText;
  final String? targetWord;
  final String? targetPhoneme;

  bool get hasContent =>
      (expectedText?.trim().isNotEmpty ?? false) ||
      (targetWord?.trim().isNotEmpty ?? false) ||
      (targetPhoneme?.trim().isNotEmpty ?? false);

  static SpeechExpectedSpeech? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final expectedText = ApiResponseParser.readString(map, const [
      'expected_text',
      'expectedText',
    ]);
    final targetWord = ApiResponseParser.readString(map, const [
      'target_word',
      'targetWord',
    ]);
    final targetPhoneme = ApiResponseParser.readString(map, const [
      'target_phoneme',
      'targetPhoneme',
    ]);

    final parsed = SpeechExpectedSpeech(
      expectedText: expectedText,
      targetWord: targetWord,
      targetPhoneme: targetPhoneme,
    );

    return parsed.hasContent ? parsed : null;
  }
}

class SpeechAlignedWord {
  const SpeechAlignedWord({
    this.expected,
    this.detected,
    this.status,
  });

  final String? expected;
  final String? detected;
  final String? status;

  factory SpeechAlignedWord.fromMap(Map<String, dynamic> map) {
    return SpeechAlignedWord(
      expected: ApiResponseParser.readString(map, const ['expected']),
      detected: ApiResponseParser.readString(map, const ['detected']),
      status: ApiResponseParser.readString(map, const ['status']),
    );
  }
}

class SpeechWordAnalysis {
  const SpeechWordAnalysis({
    this.wordAccuracyPercentage,
    this.correctWords,
    this.substitutions,
    this.omissions,
    this.insertions,
    this.expectedWordCount,
    this.alignedWords = const [],
  });

  final double? wordAccuracyPercentage;
  final int? correctWords;
  final int? substitutions;
  final int? omissions;
  final int? insertions;
  final int? expectedWordCount;
  final List<SpeechAlignedWord> alignedWords;

  bool get hasContent => wordAccuracyPercentage != null;

  static SpeechWordAnalysis? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final wordAccuracy = ApiResponseParser.readDouble(map, const [
      'word_accuracy_percentage',
      'wordAccuracyPercentage',
    ]);

    if (wordAccuracy == null) {
      return null;
    }

    final alignedRaw = map['aligned_words'] ?? map['alignedWords'];
    final alignedWords = alignedRaw is List
        ? alignedRaw
            .whereType<Map>()
            .map(
              (item) => SpeechAlignedWord.fromMap(
                item.map((key, value) => MapEntry(key.toString(), value)),
              ),
            )
            .toList()
        : const <SpeechAlignedWord>[];

    return SpeechWordAnalysis(
      wordAccuracyPercentage: wordAccuracy,
      correctWords: _readInt(map, const ['correct_words', 'correctWords']),
      substitutions: _readInt(map, const ['substitutions']),
      omissions: _readInt(map, const ['omissions']),
      insertions: _readInt(map, const ['insertions']),
      expectedWordCount: _readInt(map, const [
        'expected_word_count',
        'expectedWordCount',
      ]),
      alignedWords: alignedWords,
    );
  }
}

class SpeechAsrConfidence {
  const SpeechAsrConfidence({
    this.averageWordProbability,
    this.minimumWordProbability,
    this.lowConfidenceWordCount,
    this.wordProbabilityCount,
  });

  final double? averageWordProbability;
  final double? minimumWordProbability;
  final int? lowConfidenceWordCount;
  final int? wordProbabilityCount;

  bool get hasContent => averageWordProbability != null;

  static SpeechAsrConfidence? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final average = ApiResponseParser.readDouble(map, const [
      'average_word_probability',
      'averageWordProbability',
    ]);

    if (average == null) {
      return null;
    }

    return SpeechAsrConfidence(
      averageWordProbability: average,
      minimumWordProbability: ApiResponseParser.readDouble(map, const [
        'minimum_word_probability',
        'minimumWordProbability',
      ]),
      lowConfidenceWordCount: _readInt(map, const [
        'low_confidence_word_count',
        'lowConfidenceWordCount',
      ]),
      wordProbabilityCount: _readInt(map, const [
        'word_probability_count',
        'wordProbabilityCount',
      ]),
    );
  }
}

class SpeechFluencyMetrics {
  const SpeechFluencyMetrics({
    this.speechDurationSeconds,
    this.audioDurationSeconds,
    this.wordCount,
    this.wordsPerSecond,
    this.wordsPerMinute,
    this.pauseThresholdSeconds,
    this.pauseCount,
    this.totalPauseDurationSeconds,
    this.averagePauseDurationSeconds,
    this.longestPauseSeconds,
    this.pauseRatioPercentage,
    this.timingSource,
  });

  final double? speechDurationSeconds;
  final double? audioDurationSeconds;
  final int? wordCount;
  final double? wordsPerSecond;
  final double? wordsPerMinute;
  final double? pauseThresholdSeconds;
  final int? pauseCount;
  final double? totalPauseDurationSeconds;
  final double? averagePauseDurationSeconds;
  final double? longestPauseSeconds;
  final double? pauseRatioPercentage;
  final String? timingSource;

  bool get hasContent =>
      speechDurationSeconds != null ||
      wordsPerMinute != null ||
      pauseCount != null;

  static SpeechFluencyMetrics? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final speechDuration = ApiResponseParser.readDouble(map, const [
      'speech_duration_seconds',
      'speechDurationSeconds',
    ]);
    final wordsPerMinute = ApiResponseParser.readDouble(map, const [
      'words_per_minute',
      'wordsPerMinute',
    ]);
    final pauseCount = _readInt(map, const ['pause_count', 'pauseCount']);

    if (speechDuration == null && wordsPerMinute == null && pauseCount == null) {
      return null;
    }

    return SpeechFluencyMetrics(
      speechDurationSeconds: speechDuration,
      audioDurationSeconds: ApiResponseParser.readDouble(map, const [
        'audio_duration_seconds',
        'audioDurationSeconds',
      ]),
      wordCount: _readInt(map, const ['word_count', 'wordCount']),
      wordsPerSecond: ApiResponseParser.readDouble(map, const [
        'words_per_second',
        'wordsPerSecond',
      ]),
      wordsPerMinute: wordsPerMinute,
      pauseThresholdSeconds: ApiResponseParser.readDouble(map, const [
        'pause_threshold_seconds',
        'pauseThresholdSeconds',
      ]),
      pauseCount: pauseCount,
      totalPauseDurationSeconds: ApiResponseParser.readDouble(map, const [
        'total_pause_duration_seconds',
        'totalPauseDurationSeconds',
      ]),
      averagePauseDurationSeconds: ApiResponseParser.readDouble(map, const [
        'average_pause_duration_seconds',
        'averagePauseDurationSeconds',
      ]),
      longestPauseSeconds: ApiResponseParser.readDouble(map, const [
        'longest_pause_seconds',
        'longestPauseSeconds',
      ]),
      pauseRatioPercentage: ApiResponseParser.readDouble(map, const [
        'pause_ratio_percentage',
        'pauseRatioPercentage',
      ]),
      timingSource: ApiResponseParser.readString(map, const [
        'timing_source',
        'timingSource',
      ]),
    );
  }
}

class SpeechMetricTrend {
  const SpeechMetricTrend({
    this.first,
    this.latest,
    this.change,
    this.average,
    this.changePercentagePoints,
    this.attemptCount,
  });

  final double? first;
  final double? latest;
  final double? change;
  final double? average;
  final double? changePercentagePoints;
  final int? attemptCount;

  static SpeechMetricTrend? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final first = ApiResponseParser.readDouble(map, const ['first']);
    final latest = ApiResponseParser.readDouble(map, const ['latest']);
    if (first == null && latest == null) {
      return null;
    }

    return SpeechMetricTrend(
      first: first,
      latest: latest,
      change: ApiResponseParser.readDouble(map, const ['change']),
      average: ApiResponseParser.readDouble(map, const ['average']),
      changePercentagePoints: ApiResponseParser.readDouble(map, const [
        'change_percentage_points',
        'changePercentagePoints',
      ]),
      attemptCount: _readInt(map, const ['attempt_count', 'attemptCount']),
    );
  }
}

class SpeechWordAccuracyTrend {
  const SpeechWordAccuracyTrend({
    this.attemptCount,
    this.firstAccuracy,
    this.latestAccuracy,
    this.changePercentagePoints,
    this.averageAccuracy,
    this.bestAccuracy,
    this.worstAccuracy,
    this.trend,
  });

  final int? attemptCount;
  final double? firstAccuracy;
  final double? latestAccuracy;
  final double? changePercentagePoints;
  final double? averageAccuracy;
  final double? bestAccuracy;
  final double? worstAccuracy;
  final String? trend;

  bool get hasContent => firstAccuracy != null || latestAccuracy != null;

  String get trendLabel => switch ((trend ?? '').toLowerCase()) {
        'improving' => 'Improving',
        'declining' => 'Declining',
        'baseline' => 'Baseline',
        'stable' => 'Stable',
        'insufficient_data' => 'Insufficient data',
        _ => trend ?? '—',
      };

  static SpeechWordAccuracyTrend? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final first = ApiResponseParser.readDouble(map, const [
      'first_accuracy',
      'firstAccuracy',
    ]);
    final latest = ApiResponseParser.readDouble(map, const [
      'latest_accuracy',
      'latestAccuracy',
    ]);

    if (first == null && latest == null) {
      return null;
    }

    return SpeechWordAccuracyTrend(
      attemptCount: _readInt(map, const ['attempt_count', 'attemptCount']),
      firstAccuracy: first,
      latestAccuracy: latest,
      changePercentagePoints: ApiResponseParser.readDouble(map, const [
        'change_percentage_points',
        'changePercentagePoints',
      ]),
      averageAccuracy: ApiResponseParser.readDouble(map, const [
        'average_accuracy',
        'averageAccuracy',
      ]),
      bestAccuracy: ApiResponseParser.readDouble(map, const [
        'best_accuracy',
        'bestAccuracy',
      ]),
      worstAccuracy: ApiResponseParser.readDouble(map, const [
        'worst_accuracy',
        'worstAccuracy',
      ]),
      trend: ApiResponseParser.readString(map, const ['trend']),
    );
  }
}

class SpeechRepeatedWordDifficulty {
  const SpeechRepeatedWordDifficulty({
    required this.expectedWord,
    this.timesExpected,
    this.timesCorrect,
    this.timesIncorrect,
    this.accuracyPercentage,
    this.substitutions,
    this.omissions,
  });

  final String expectedWord;
  final int? timesExpected;
  final int? timesCorrect;
  final int? timesIncorrect;
  final double? accuracyPercentage;
  final int? substitutions;
  final int? omissions;

  factory SpeechRepeatedWordDifficulty.fromMap(Map<String, dynamic> map) {
    return SpeechRepeatedWordDifficulty(
      expectedWord: ApiResponseParser.readString(map, const [
            'expected_word',
            'expectedWord',
          ]) ??
          '',
      timesExpected: _readInt(map, const ['times_expected', 'timesExpected']),
      timesCorrect: _readInt(map, const ['times_correct', 'timesCorrect']),
      timesIncorrect:
          _readInt(map, const ['times_incorrect', 'timesIncorrect']),
      accuracyPercentage: ApiResponseParser.readDouble(map, const [
        'accuracy_percentage',
        'accuracyPercentage',
      ]),
      substitutions: _readInt(map, const ['substitutions']),
      omissions: _readInt(map, const ['omissions']),
    );
  }
}

class SpeechRepeatedWordSubstitution {
  const SpeechRepeatedWordSubstitution({
    required this.expectedWord,
    required this.detectedWord,
    this.count,
  });

  final String expectedWord;
  final String detectedWord;
  final int? count;

  factory SpeechRepeatedWordSubstitution.fromMap(Map<String, dynamic> map) {
    return SpeechRepeatedWordSubstitution(
      expectedWord: ApiResponseParser.readString(map, const [
            'expected_word',
            'expectedWord',
          ]) ??
          '',
      detectedWord: ApiResponseParser.readString(map, const [
            'detected_word',
            'detectedWord',
          ]) ??
          '',
      count: _readInt(map, const ['count']),
    );
  }
}

class SpeechFluencyTrend {
  const SpeechFluencyTrend({
    this.attemptCount,
    this.wordsPerMinute,
    this.pauseRatioPercentage,
    this.pauseCount,
    this.averagePauseDurationSeconds,
  });

  final int? attemptCount;
  final SpeechMetricTrend? wordsPerMinute;
  final SpeechMetricTrend? pauseRatioPercentage;
  final SpeechMetricTrend? pauseCount;
  final SpeechMetricTrend? averagePauseDurationSeconds;

  bool get hasContent =>
      wordsPerMinute != null ||
      pauseRatioPercentage != null ||
      pauseCount != null ||
      averagePauseDurationSeconds != null;

  static SpeechFluencyTrend? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final parsed = SpeechFluencyTrend(
      attemptCount: _readInt(map, const ['attempt_count', 'attemptCount']),
      wordsPerMinute: SpeechMetricTrend.fromMap(
        ApiResponseParser.asMap(map['words_per_minute'] ?? map['wordsPerMinute']),
      ),
      pauseRatioPercentage: SpeechMetricTrend.fromMap(
        ApiResponseParser.asMap(
          map['pause_ratio_percentage'] ?? map['pauseRatioPercentage'],
        ),
      ),
      pauseCount: SpeechMetricTrend.fromMap(
        ApiResponseParser.asMap(map['pause_count'] ?? map['pauseCount']),
      ),
      averagePauseDurationSeconds: SpeechMetricTrend.fromMap(
        ApiResponseParser.asMap(
          map['average_pause_duration_seconds'] ??
              map['averagePauseDurationSeconds'],
        ),
      ),
    );

    return parsed.hasContent ? parsed : null;
  }
}

class SpeechHistoryPoint {
  const SpeechHistoryPoint({
    required this.analysisId,
    this.analyzedAt,
    this.wordAccuracyPercentage,
    this.wordsPerMinute,
    this.pauseRatioPercentage,
    this.overallScore,
  });

  final String analysisId;
  final DateTime? analyzedAt;
  final double? wordAccuracyPercentage;
  final double? wordsPerMinute;
  final double? pauseRatioPercentage;
  final double? overallScore;

  factory SpeechHistoryPoint.fromMap(Map<String, dynamic> map) {
    return SpeechHistoryPoint(
      analysisId: ApiResponseParser.readString(map, const [
            'analysis_id',
            'analysisId',
            'id',
          ]) ??
          '',
      analyzedAt: ApiResponseParser.readDate(
        map['analyzed_at'] ?? map['analyzedAt'],
      ),
      wordAccuracyPercentage: ApiResponseParser.readDouble(map, const [
        'word_accuracy_percentage',
        'wordAccuracyPercentage',
      ]),
      wordsPerMinute: ApiResponseParser.readDouble(map, const [
        'words_per_minute',
        'wordsPerMinute',
      ]),
      pauseRatioPercentage: ApiResponseParser.readDouble(map, const [
        'pause_ratio_percentage',
        'pauseRatioPercentage',
      ]),
      overallScore: ApiResponseParser.readDouble(map, const [
        'overall_score',
        'overallScore',
      ]),
    );
  }
}

class SpeechProgressInsights {
  const SpeechProgressInsights({
    this.patientId,
    this.exerciseId,
    this.expectedText,
    this.comparisonMode,
    this.comparableAttemptCount,
    this.wordAccuracyTrend,
    this.repeatedWordDifficulties = const [],
    this.repeatedWordSubstitutions = const [],
    this.fluencyTrend,
    this.historyPoints = const [],
  });

  final String? patientId;
  final String? exerciseId;
  final String? expectedText;
  final String? comparisonMode;
  final int? comparableAttemptCount;
  final SpeechWordAccuracyTrend? wordAccuracyTrend;
  final List<SpeechRepeatedWordDifficulty> repeatedWordDifficulties;
  final List<SpeechRepeatedWordSubstitution> repeatedWordSubstitutions;
  final SpeechFluencyTrend? fluencyTrend;
  final List<SpeechHistoryPoint> historyPoints;

  bool get hasContent =>
      (wordAccuracyTrend?.hasContent ?? false) ||
      repeatedWordDifficulties.isNotEmpty ||
      repeatedWordSubstitutions.isNotEmpty ||
      (fluencyTrend?.hasContent ?? false) ||
      historyPoints.length >= 2;

  static SpeechProgressInsights? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final scope = ApiResponseParser.asMap(map['scope']);
    final difficultiesRaw =
        map['repeated_word_difficulties'] ?? map['repeatedWordDifficulties'];
    final substitutionsRaw = map['repeated_word_substitutions'] ??
        map['repeatedWordSubstitutions'];
    final historyRaw = map['history_points'] ?? map['historyPoints'];

    final parsed = SpeechProgressInsights(
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
      exerciseId: ApiResponseParser.readString(scope ?? {}, const [
        'exercise_id',
        'exerciseId',
      ]),
      expectedText: ApiResponseParser.readString(scope ?? {}, const [
        'expected_text',
        'expectedText',
      ]),
      comparisonMode: ApiResponseParser.readString(scope ?? {}, const [
        'comparison_mode',
        'comparisonMode',
      ]),
      comparableAttemptCount: _readInt(map, const [
        'comparable_attempt_count',
        'comparableAttemptCount',
      ]),
      wordAccuracyTrend: SpeechWordAccuracyTrend.fromMap(
        ApiResponseParser.asMap(
          map['word_accuracy_trend'] ?? map['wordAccuracyTrend'],
        ),
      ),
      repeatedWordDifficulties: difficultiesRaw is List
          ? difficultiesRaw
              .whereType<Map>()
              .map(
                (item) => SpeechRepeatedWordDifficulty.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .where((item) => item.expectedWord.isNotEmpty)
              .toList()
          : const [],
      repeatedWordSubstitutions: substitutionsRaw is List
          ? substitutionsRaw
              .whereType<Map>()
              .map(
                (item) => SpeechRepeatedWordSubstitution.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .where(
                (item) =>
                    item.expectedWord.isNotEmpty && item.detectedWord.isNotEmpty,
              )
              .toList()
          : const [],
      fluencyTrend: SpeechFluencyTrend.fromMap(
        ApiResponseParser.asMap(map['fluency_trend'] ?? map['fluencyTrend']),
      ),
      historyPoints: historyRaw is List
          ? historyRaw
              .whereType<Map>()
              .map(
                (item) => SpeechHistoryPoint.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .where((item) => item.analysisId.isNotEmpty)
              .toList()
          : const [],
    );

    return parsed.hasContent ? parsed : null;
  }
}

class SpeechTargetPhone {
  const SpeechTargetPhone({
    this.requested,
    this.alignerPhones = const [],
    this.ipa,
    this.display,
  });

  final String? requested;
  final List<String> alignerPhones;
  final String? ipa;
  final String? display;

  bool get hasContent =>
      (requested?.trim().isNotEmpty ?? false) ||
      (display?.trim().isNotEmpty ?? false);

  factory SpeechTargetPhone.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const SpeechTargetPhone();
    }

    return SpeechTargetPhone(
      requested: ApiResponseParser.readString(map, const ['requested']),
      alignerPhones: _readStringList(map['aligner_phones'] ?? map['alignerPhones']),
      ipa: ApiResponseParser.readString(map, const ['ipa']),
      display: ApiResponseParser.readString(map, const ['display']),
    );
  }
}

class SpeechPhonemeAlignedWord {
  const SpeechPhonemeAlignedWord({
    this.word,
    this.wordIndex,
    this.start,
    this.end,
    this.durationSeconds,
  });

  final String? word;
  final int? wordIndex;
  final double? start;
  final double? end;
  final double? durationSeconds;

  factory SpeechPhonemeAlignedWord.fromMap(Map<String, dynamic> map) {
    return SpeechPhonemeAlignedWord(
      word: ApiResponseParser.readString(map, const ['word']),
      wordIndex: ApiResponseParser.readInt(map, const ['word_index', 'wordIndex']),
      start: ApiResponseParser.readDouble(map, const ['start']),
      end: ApiResponseParser.readDouble(map, const ['end']),
      durationSeconds: ApiResponseParser.readDouble(map, const [
        'duration_seconds',
        'durationSeconds',
      ]),
    );
  }
}

class SpeechPhonemeAlignedPhone {
  const SpeechPhonemeAlignedPhone({
    this.phone,
    this.phoneIndex,
    this.start,
    this.end,
    this.durationSeconds,
  });

  final String? phone;
  final int? phoneIndex;
  final double? start;
  final double? end;
  final double? durationSeconds;

  factory SpeechPhonemeAlignedPhone.fromMap(Map<String, dynamic> map) {
    return SpeechPhonemeAlignedPhone(
      phone: ApiResponseParser.readString(map, const ['phone']),
      phoneIndex: ApiResponseParser.readInt(map, const ['phone_index', 'phoneIndex']),
      start: ApiResponseParser.readDouble(map, const ['start']),
      end: ApiResponseParser.readDouble(map, const ['end']),
      durationSeconds: ApiResponseParser.readDouble(map, const [
        'duration_seconds',
        'durationSeconds',
      ]),
    );
  }
}

class SpeechTargetOccurrence {
  const SpeechTargetOccurrence({
    this.word,
    this.wordIndex,
    this.phoneIndex,
    this.phone,
    this.start,
    this.end,
    this.durationSeconds,
    this.acousticMeasurements,
  });

  final String? word;
  final int? wordIndex;
  final int? phoneIndex;
  final String? phone;
  final double? start;
  final double? end;
  final double? durationSeconds;
  final SpeechAcousticMeasurements? acousticMeasurements;

  factory SpeechTargetOccurrence.fromMap(Map<String, dynamic> map) {
    return SpeechTargetOccurrence(
      word: ApiResponseParser.readString(map, const ['word']),
      wordIndex: ApiResponseParser.readInt(map, const ['word_index', 'wordIndex']),
      phoneIndex: ApiResponseParser.readInt(map, const ['phone_index', 'phoneIndex']),
      phone: ApiResponseParser.readString(map, const ['phone']),
      start: ApiResponseParser.readDouble(map, const ['start']),
      end: ApiResponseParser.readDouble(map, const ['end']),
      durationSeconds: ApiResponseParser.readDouble(map, const [
        'duration_seconds',
        'durationSeconds',
      ]),
      acousticMeasurements: SpeechAcousticMeasurements.fromMap(
        ApiResponseParser.asMap(
          map['acoustic_measurements'] ?? map['acousticMeasurements'],
        ),
      ),
    );
  }
}

class SpeechAcousticMeasurements {
  const SpeechAcousticMeasurements({
    this.durationMs,
    this.meanF0Hz,
    this.meanIntensityDb,
    this.meanF1Hz,
    this.meanF2Hz,
    this.quality,
  });

  final double? durationMs;
  final double? meanF0Hz;
  final double? meanIntensityDb;
  final double? meanF1Hz;
  final double? meanF2Hz;
  final SpeechPhonemeQuality? quality;

  bool get hasAnyMeasurement =>
      durationMs != null ||
      meanF0Hz != null ||
      meanIntensityDb != null ||
      meanF1Hz != null ||
      meanF2Hz != null;

  static SpeechAcousticMeasurements? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    return SpeechAcousticMeasurements(
      durationMs: ApiResponseParser.readDouble(map, const [
        'duration_ms',
        'durationMs',
      ]),
      meanF0Hz: ApiResponseParser.readDouble(map, const [
        'mean_f0_hz',
        'meanF0Hz',
      ]),
      meanIntensityDb: ApiResponseParser.readDouble(map, const [
        'mean_intensity_db',
        'meanIntensityDb',
      ]),
      meanF1Hz: ApiResponseParser.readDouble(map, const [
        'mean_f1_hz',
        'meanF1Hz',
      ]),
      meanF2Hz: ApiResponseParser.readDouble(map, const [
        'mean_f2_hz',
        'meanF2Hz',
      ]),
      quality: SpeechPhonemeQuality.fromMap(
        ApiResponseParser.asMap(map['quality']),
      ),
    );
  }
}

class SpeechPhonemeWarning {
  const SpeechPhonemeWarning({
    required this.code,
    required this.message,
  });

  final String code;
  final String message;

  factory SpeechPhonemeWarning.fromMap(Map<String, dynamic> map) {
    return SpeechPhonemeWarning(
      code: ApiResponseParser.readString(map, const ['code']) ?? '',
      message: ApiResponseParser.readString(map, const ['message']) ?? '',
    );
  }
}

class SpeechPhonemeQuality {
  const SpeechPhonemeQuality({
    this.available,
    this.status,
    this.warnings = const [],
  });

  final bool? available;
  final String? status;
  final List<SpeechPhonemeWarning> warnings;

  bool get hasContent => available == true || (status?.isNotEmpty ?? false);

  static SpeechPhonemeQuality? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final warningsRaw = map['warnings'];
    final warnings = warningsRaw is List
        ? warningsRaw
            .whereType<Map>()
            .map(
              (item) => SpeechPhonemeWarning.fromMap(
                item.map((key, value) => MapEntry(key.toString(), value)),
              ),
            )
            .toList()
        : const <SpeechPhonemeWarning>[];

    return SpeechPhonemeQuality(
      available: map['available'] == true,
      status: ApiResponseParser.readString(map, const ['status']),
      warnings: warnings,
    );
  }
}

class SpeechPhonemeAnalysis {
  const SpeechPhonemeAnalysis({
    this.version,
    this.language,
    this.alignmentEngine,
    this.phoneSet,
    this.expectedText,
    this.targetPhone,
    this.words = const [],
    this.phones = const [],
    this.targetOccurrences = const [],
    this.quality,
  });

  final String? version;
  final String? language;
  final String? alignmentEngine;
  final String? phoneSet;
  final String? expectedText;
  final SpeechTargetPhone? targetPhone;
  final List<SpeechPhonemeAlignedWord> words;
  final List<SpeechPhonemeAlignedPhone> phones;
  final List<SpeechTargetOccurrence> targetOccurrences;
  final SpeechPhonemeQuality? quality;

  bool get hasContent =>
      quality?.available == true ||
      words.isNotEmpty ||
      targetOccurrences.isNotEmpty;

  static SpeechPhonemeAnalysis? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final wordsRaw = map['words'];
    final phonesRaw = map['phones'];
    final occurrencesRaw = map['target_occurrences'] ?? map['targetOccurrences'];

    final parsed = SpeechPhonemeAnalysis(
      version: ApiResponseParser.readString(map, const ['version']),
      language: ApiResponseParser.readString(map, const ['language']),
      alignmentEngine: ApiResponseParser.readString(map, const [
        'alignment_engine',
        'alignmentEngine',
      ]),
      phoneSet: ApiResponseParser.readString(map, const ['phone_set', 'phoneSet']),
      expectedText: ApiResponseParser.readString(map, const [
        'expected_text',
        'expectedText',
      ]),
      targetPhone: SpeechTargetPhone.fromMap(
        ApiResponseParser.asMap(map['target_phone'] ?? map['targetPhone']),
      ),
      words: wordsRaw is List
          ? wordsRaw
              .whereType<Map>()
              .map(
                (item) => SpeechPhonemeAlignedWord.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .toList()
          : const [],
      phones: phonesRaw is List
          ? phonesRaw
              .whereType<Map>()
              .map(
                (item) => SpeechPhonemeAlignedPhone.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .toList()
          : const [],
      targetOccurrences: occurrencesRaw is List
          ? occurrencesRaw
              .whereType<Map>()
              .map(
                (item) => SpeechTargetOccurrence.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .toList()
          : const [],
      quality: SpeechPhonemeQuality.fromMap(
        ApiResponseParser.asMap(map['quality']),
      ),
    );

    return parsed.hasContent ? parsed : null;
  }
}

class SpeechAcousticMetricTrend {
  const SpeechAcousticMetricTrend({
    this.validAttemptCount,
    this.first,
    this.latest,
    this.change,
    this.changeDirection,
    this.average,
    this.min,
    this.max,
  });

  final int? validAttemptCount;
  final double? first;
  final double? latest;
  final double? change;
  final String? changeDirection;
  final double? average;
  final double? min;
  final double? max;

  bool get hasContent =>
      (validAttemptCount ?? 0) > 0 && (first != null || latest != null);

  static SpeechAcousticMetricTrend? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }
    final parsed = SpeechAcousticMetricTrend(
      validAttemptCount: ApiResponseParser.readInt(map, const [
        'valid_attempt_count',
        'validAttemptCount',
      ]),
      first: ApiResponseParser.readDouble(map, const ['first']),
      latest: ApiResponseParser.readDouble(map, const ['latest']),
      change: ApiResponseParser.readDouble(map, const ['change']),
      changeDirection: ApiResponseParser.readString(map, const [
        'change_direction',
        'changeDirection',
      ]),
      average: ApiResponseParser.readDouble(map, const ['average']),
      min: ApiResponseParser.readDouble(map, const ['min']),
      max: ApiResponseParser.readDouble(map, const ['max']),
    );
    return parsed.hasContent ? parsed : null;
  }
}

class SpeechAcousticHistoryPoint {
  const SpeechAcousticHistoryPoint({
    required this.analysisId,
    this.analyzedAt,
    this.targetPhone,
    this.durationMs,
    this.meanF0Hz,
    this.meanIntensityDb,
    this.meanF1Hz,
    this.meanF2Hz,
    this.qualityStatus,
  });

  final String analysisId;
  final DateTime? analyzedAt;
  final String? targetPhone;
  final double? durationMs;
  final double? meanF0Hz;
  final double? meanIntensityDb;
  final double? meanF1Hz;
  final double? meanF2Hz;
  final String? qualityStatus;

  factory SpeechAcousticHistoryPoint.fromMap(Map<String, dynamic> map) {
    return SpeechAcousticHistoryPoint(
      analysisId: ApiResponseParser.readString(map, const [
            'analysis_id',
            'analysisId',
          ]) ??
          '',
      analyzedAt: ApiResponseParser.readDate(
        map['analyzed_at'] ?? map['analyzedAt'],
      ),
      targetPhone: ApiResponseParser.readString(map, const [
        'target_phone',
        'targetPhone',
      ]),
      durationMs: ApiResponseParser.readDouble(map, const [
        'duration_ms',
        'durationMs',
      ]),
      meanF0Hz: ApiResponseParser.readDouble(map, const [
        'mean_f0_hz',
        'meanF0Hz',
      ]),
      meanIntensityDb: ApiResponseParser.readDouble(map, const [
        'mean_intensity_db',
        'meanIntensityDb',
      ]),
      meanF1Hz: ApiResponseParser.readDouble(map, const [
        'mean_f1_hz',
        'meanF1Hz',
      ]),
      meanF2Hz: ApiResponseParser.readDouble(map, const [
        'mean_f2_hz',
        'meanF2Hz',
      ]),
      qualityStatus: ApiResponseParser.readString(map, const [
        'quality_status',
        'qualityStatus',
      ]),
    );
  }
}

class SpeechAcousticVariability {
  const SpeechAcousticVariability({
    this.durationMsStddev,
    this.f0HzStddev,
    this.intensityDbStddev,
  });

  final double? durationMsStddev;
  final double? f0HzStddev;
  final double? intensityDbStddev;

  bool get hasContent =>
      durationMsStddev != null || f0HzStddev != null || intensityDbStddev != null;

  static SpeechAcousticVariability? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }
    final parsed = SpeechAcousticVariability(
      durationMsStddev: ApiResponseParser.readDouble(map, const [
        'duration_ms_stddev',
        'durationMsStddev',
      ]),
      f0HzStddev: ApiResponseParser.readDouble(map, const [
        'f0_hz_stddev',
        'f0HzStddev',
      ]),
      intensityDbStddev: ApiResponseParser.readDouble(map, const [
        'intensity_db_stddev',
        'intensityDbStddev',
      ]),
    );
    return parsed.hasContent ? parsed : null;
  }
}

class SpeechPreviousAcousticAnalysis {
  const SpeechPreviousAcousticAnalysis({
    this.analysisId,
    this.analyzedAt,
    this.durationMs,
    this.meanF0Hz,
    this.meanIntensityDb,
  });

  final String? analysisId;
  final DateTime? analyzedAt;
  final double? durationMs;
  final double? meanF0Hz;
  final double? meanIntensityDb;

  bool get hasContent => analysisId != null && analysisId!.isNotEmpty;

  static SpeechPreviousAcousticAnalysis? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }
    final parsed = SpeechPreviousAcousticAnalysis(
      analysisId: ApiResponseParser.readString(map, const [
        'analysis_id',
        'analysisId',
      ]),
      analyzedAt: ApiResponseParser.readDate(
        map['analyzed_at'] ?? map['analyzedAt'],
      ),
      durationMs: ApiResponseParser.readDouble(map, const [
        'duration_ms',
        'durationMs',
      ]),
      meanF0Hz: ApiResponseParser.readDouble(map, const [
        'mean_f0_hz',
        'meanF0Hz',
      ]),
      meanIntensityDb: ApiResponseParser.readDouble(map, const [
        'mean_intensity_db',
        'meanIntensityDb',
      ]),
    );
    return parsed.hasContent ? parsed : null;
  }
}

class SpeechAcousticProgress {
  const SpeechAcousticProgress({
    this.totalComparableAttempts,
    this.usableAcousticAttempts,
    this.targetPhone,
    this.durationTrend,
    this.f0Trend,
    this.intensityTrend,
    this.variability,
    this.previousComparableAnalysis,
    this.changesFromPrevious,
    this.historyPoints = const [],
  });

  final int? totalComparableAttempts;
  final int? usableAcousticAttempts;
  final SpeechTargetPhone? targetPhone;
  final SpeechAcousticMetricTrend? durationTrend;
  final SpeechAcousticMetricTrend? f0Trend;
  final SpeechAcousticMetricTrend? intensityTrend;
  final SpeechAcousticVariability? variability;
  final SpeechPreviousAcousticAnalysis? previousComparableAnalysis;
  final Map<String, double?>? changesFromPrevious;
  final List<SpeechAcousticHistoryPoint> historyPoints;

  bool get hasContent =>
      (usableAcousticAttempts ?? 0) >= 2 ||
      (durationTrend?.change != null) ||
      historyPoints.where((point) => point.durationMs != null).length >= 2;

  static SpeechAcousticProgress? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final historyRaw = map['history_points'] ?? map['historyPoints'];
    final changesRaw =
        ApiResponseParser.asMap(map['changes_from_previous'] ?? map['changesFromPrevious']);

    final parsed = SpeechAcousticProgress(
      totalComparableAttempts: ApiResponseParser.readInt(map, const [
        'total_comparable_attempts',
        'totalComparableAttempts',
      ]),
      usableAcousticAttempts: ApiResponseParser.readInt(map, const [
        'usable_acoustic_attempts',
        'usableAcousticAttempts',
      ]),
      targetPhone: SpeechTargetPhone.fromMap(
        ApiResponseParser.asMap(map['target_phone'] ?? map['targetPhone']),
      ),
      durationTrend: SpeechAcousticMetricTrend.fromMap(
        ApiResponseParser.asMap(map['duration_trend'] ?? map['durationTrend']),
      ),
      f0Trend: SpeechAcousticMetricTrend.fromMap(
        ApiResponseParser.asMap(map['f0_trend'] ?? map['f0Trend']),
      ),
      intensityTrend: SpeechAcousticMetricTrend.fromMap(
        ApiResponseParser.asMap(
          map['intensity_trend'] ?? map['intensityTrend'],
        ),
      ),
      variability: SpeechAcousticVariability.fromMap(
        ApiResponseParser.asMap(map['variability']),
      ),
      previousComparableAnalysis: SpeechPreviousAcousticAnalysis.fromMap(
        ApiResponseParser.asMap(
          map['previous_comparable_analysis'] ??
              map['previousComparableAnalysis'],
        ),
      ),
      changesFromPrevious: changesRaw == null
          ? null
          : {
              'duration_ms': ApiResponseParser.readDouble(changesRaw, const [
                'duration_ms',
                'durationMs',
              ]),
              'f0_hz': ApiResponseParser.readDouble(changesRaw, const [
                'f0_hz',
                'f0Hz',
              ]),
              'intensity_db': ApiResponseParser.readDouble(changesRaw, const [
                'intensity_db',
                'intensityDb',
              ]),
            },
      historyPoints: historyRaw is List
          ? historyRaw
              .whereType<Map>()
              .map(
                (item) => SpeechAcousticHistoryPoint.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .where((item) => item.analysisId.isNotEmpty)
              .toList()
          : const [],
    );

    final hasAnyData = (parsed.usableAcousticAttempts ?? 0) >= 1 ||
        parsed.historyPoints.isNotEmpty ||
        parsed.durationTrend != null ||
        parsed.f0Trend != null ||
        parsed.intensityTrend != null;
    return hasAnyData ? parsed : null;
  }
}

class SpeechAnalysisQualityWarning {
  const SpeechAnalysisQualityWarning({
    required this.code,
    required this.message,
  });

  final String code;
  final String message;

  factory SpeechAnalysisQualityWarning.fromMap(Map<String, dynamic> map) {
    return SpeechAnalysisQualityWarning(
      code: ApiResponseParser.readString(map, const ['code']) ?? '',
      message: ApiResponseParser.readString(map, const ['message']) ?? '',
    );
  }
}

class SpeechAnalysisQuality {
  const SpeechAnalysisQuality({
    this.status,
    this.confidence,
    this.warnings = const [],
  });

  final String? status;
  final String? confidence;
  final List<SpeechAnalysisQualityWarning> warnings;

  bool get hasContent => status != null && status!.isNotEmpty;

  String get statusLabel => switch ((status ?? '').toLowerCase()) {
        'good' => 'Good',
        'usable_with_caution' => 'Use with Caution',
        'low_quality' => 'Low Quality Recording/Analysis',
        _ => status ?? '—',
      };

  static SpeechAnalysisQuality? fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return null;
    }

    final status = ApiResponseParser.readString(map, const ['status']);
    if (status == null || status.isEmpty) {
      return null;
    }

    final warningsRaw = map['warnings'];
    final warnings = warningsRaw is List
        ? warningsRaw
            .whereType<Map>()
            .map(
              (item) => SpeechAnalysisQualityWarning.fromMap(
                item.map((key, value) => MapEntry(key.toString(), value)),
              ),
            )
            .where((item) => item.code.isNotEmpty)
            .toList()
        : const <SpeechAnalysisQualityWarning>[];

    return SpeechAnalysisQuality(
      status: status,
      confidence: ApiResponseParser.readString(map, const ['confidence']),
      warnings: warnings,
    );
  }
}

class SpeechAnalysisComparison {
  const SpeechAnalysisComparison({
    this.comparedToAnalysisId,
    this.pronunciationChange,
    this.fluencyChange,
    this.overallScoreChange,
    this.trend,
    this.previousAnalyzedAt,
  });

  final String? comparedToAnalysisId;
  final double? pronunciationChange;
  final double? fluencyChange;
  final double? overallScoreChange;
  final String? trend;
  final DateTime? previousAnalyzedAt;

  bool get hasComparison =>
      pronunciationChange != null ||
      fluencyChange != null ||
      overallScoreChange != null ||
      (trend?.isNotEmpty ?? false);

  String get trendLabel => switch ((trend ?? '').toLowerCase()) {
        'improvement' => 'Improving',
        'regression' => 'Declining',
        'baseline' => 'Baseline',
        'stable' => 'Stable',
        _ => trend ?? '—',
      };

  static SpeechAnalysisComparison? fromMaps({
    Map<String, dynamic>? comparisonMap,
    SpecialistSpeechAnalysisItem? current,
    SpecialistSpeechAnalysisItem? previous,
  }) {
    if (comparisonMap != null) {
      return SpeechAnalysisComparison(
        comparedToAnalysisId: ApiResponseParser.readString(
          comparisonMap,
          const ['previous_speech_analysis_id', 'compared_to_analysis_id'],
        ),
        pronunciationChange: ApiResponseParser.readDouble(
          comparisonMap,
          const ['pronunciation_change', 'pronunciationChange'],
        ),
        fluencyChange: ApiResponseParser.readDouble(
          comparisonMap,
          const ['fluency_change', 'fluencyChange'],
        ),
        overallScoreChange: ApiResponseParser.readDouble(
          comparisonMap,
          const ['overall_score_change', 'overallScoreChange'],
        ),
        trend: ApiResponseParser.readString(comparisonMap, const ['trend']),
        previousAnalyzedAt: previous?.analyzedAt,
      );
    }

    if (current == null || previous == null) {
      return null;
    }

    return SpeechAnalysisComparison(
      comparedToAnalysisId: previous.id,
      pronunciationChange: _delta(current.pronunciationScore, previous.pronunciationScore),
      fluencyChange: _delta(current.fluencyScore, previous.fluencyScore),
      overallScoreChange: _delta(current.overallScore, previous.overallScore),
      trend: _inferTrend(
        _delta(current.overallScore, previous.overallScore),
      ),
      previousAnalyzedAt: previous.analyzedAt,
    );
  }

  static double? _delta(double? current, double? previous) {
    if (current == null || previous == null) {
      return null;
    }
    return double.parse((current - previous).toStringAsFixed(2));
  }

  static String _inferTrend(double? overallChange) {
    if (overallChange == null) {
      return 'stable';
    }
    if (overallChange >= 3) {
      return 'improvement';
    }
    if (overallChange <= -3) {
      return 'regression';
    }
    return 'stable';
  }
}

class SpecialistSpeechAnalysisItem {
  const SpecialistSpeechAnalysisItem({
    required this.id,
    required this.submissionId,
    required this.patientId,
    this.patientName,
    this.transcript,
    this.pronunciationScore,
    this.fluencyScore,
    this.overallScore,
    this.comparedToAnalysisId,
    this.rawAiOutput,
    this.analyzedAt,
    this.exerciseTitle,
    this.exerciseId,
    this.submissionStatus,
    this.audioFileUrl,
    this.language,
    this.durationSeconds,
    this.aiFeedback = const SpeechAnalysisAiFeedback(),
    this.comparison,
    this.expectedSpeech,
    this.wordAnalysis,
    this.fluencyMetrics,
    this.asrConfidence,
    this.progressInsights,
    this.analysisQuality,
    this.phonemeAnalysis,
  });

  final String id;
  final String submissionId;
  final String patientId;
  final String? patientName;
  final String? transcript;
  final double? pronunciationScore;
  final double? fluencyScore;
  final double? overallScore;
  final String? comparedToAnalysisId;
  final Map<String, dynamic>? rawAiOutput;
  final DateTime? analyzedAt;
  final String? exerciseTitle;
  final String? exerciseId;
  final String? submissionStatus;
  final String? audioFileUrl;
  final String? language;
  final double? durationSeconds;
  final SpeechAnalysisAiFeedback aiFeedback;
  final SpeechAnalysisComparison? comparison;
  final SpeechExpectedSpeech? expectedSpeech;
  final SpeechWordAnalysis? wordAnalysis;
  final SpeechFluencyMetrics? fluencyMetrics;
  final SpeechAsrConfidence? asrConfidence;
  final SpeechProgressInsights? progressInsights;
  final SpeechAnalysisQuality? analysisQuality;
  final SpeechPhonemeAnalysis? phonemeAnalysis;

  factory SpecialistSpeechAnalysisItem.fromMap(
    Map<String, dynamic> map, {
    String? fallbackPatientId,
    String? fallbackPatientName,
  }) {
    final raw = _normalizeRawMap(map['raw_ai_output'] ?? map['rawAiOutput']);
    final nestedCurrent = ApiResponseParser.asMap(map['current_analysis']);
    final source = nestedCurrent ?? map;

    final aiNote = ApiResponseParser.asMap(map['ai_progress_note']);
    final feedback = aiNote != null
        ? SpeechAnalysisAiFeedback.fromRawOutput(aiNote)
        : SpeechAnalysisAiFeedback.fromRawOutput(raw);

    final comparisonMap = ApiResponseParser.asMap(map['comparison']);
    final expectedSpeechMap = ApiResponseParser.asMap(
      map['expected_speech'] ?? map['expectedSpeech'],
    );
    final wordAnalysisMap = ApiResponseParser.asMap(
      map['word_analysis'] ?? map['wordAnalysis'],
    );
    final fluencyMetricsMap = ApiResponseParser.asMap(
      map['fluency_metrics'] ?? map['fluencyMetrics'],
    );
    final asrConfidenceMap = ApiResponseParser.asMap(
      map['asr_confidence'] ?? map['asrConfidence'],
    );
    final progressInsightsMap = ApiResponseParser.asMap(
      map['progress_insights'] ?? map['progressInsights'] ?? map['insights'],
    );
    final analysisQualityMap = ApiResponseParser.asMap(
      map['analysis_quality'] ?? map['analysisQuality'],
    );
    final phonemeAnalysisMap = ApiResponseParser.asMap(
      map['phoneme_analysis'] ?? map['phonemeAnalysis'],
    );

    return SpecialistSpeechAnalysisItem(
      id: ApiResponseParser.readString(source, const ['id', '_id']) ?? '',
      submissionId: ApiResponseParser.readString(source, const [
            'submission_id',
            'submissionId',
          ]) ??
          '',
      patientId: ApiResponseParser.readString(source, const [
            'patient_id',
            'patientId',
          ]) ??
          fallbackPatientId ??
          '',
      patientName: ApiResponseParser.readString(source, const [
            'patient_name',
            'patientName',
          ]) ??
          fallbackPatientName ??
          ApiResponseParser.readString(raw ?? {}, const [
            'patient_name',
            'patientName',
          ]),
      transcript: ApiResponseParser.readString(source, const ['transcript']),
      pronunciationScore: ApiResponseParser.readDouble(source, const [
        'pronunciation_score',
        'pronunciationScore',
      ]),
      fluencyScore: ApiResponseParser.readDouble(source, const [
        'fluency_score',
        'fluencyScore',
      ]),
      overallScore: ApiResponseParser.readDouble(source, const [
        'overall_score',
        'overallScore',
      ]),
      comparedToAnalysisId: ApiResponseParser.readString(source, const [
        'compared_to_analysis_id',
        'comparedToAnalysisId',
      ]),
      rawAiOutput: raw,
      analyzedAt: ApiResponseParser.readDate(
        source['analyzed_at'] ?? source['analyzedAt'],
      ),
      exerciseTitle: ApiResponseParser.readString(source, const [
        'exercise_title',
        'exerciseTitle',
      ]),
      exerciseId: ApiResponseParser.readString(source, const [
        'exercise_id',
        'exerciseId',
      ]),
      submissionStatus: ApiResponseParser.readString(source, const [
        'submission_status',
        'submissionStatus',
        'status',
      ]),
      audioFileUrl: ApiResponseParser.readString(source, const [
        'audio_file_url',
        'audioFileUrl',
        'file_url',
        'fileUrl',
      ]),
      language: ApiResponseParser.readString(source, const ['language']) ??
          ApiResponseParser.readString(raw ?? {}, const ['language']),
      durationSeconds: ApiResponseParser.readDouble(source, const [
            'duration',
            'duration_seconds',
            'durationSeconds',
          ]) ??
          ApiResponseParser.readDouble(raw ?? {}, const ['duration']),
      aiFeedback: feedback,
      comparison: SpeechAnalysisComparison.fromMaps(comparisonMap: comparisonMap),
      expectedSpeech: SpeechExpectedSpeech.fromMap(expectedSpeechMap),
      wordAnalysis: SpeechWordAnalysis.fromMap(wordAnalysisMap),
      fluencyMetrics: SpeechFluencyMetrics.fromMap(fluencyMetricsMap),
      asrConfidence: SpeechAsrConfidence.fromMap(asrConfidenceMap),
      progressInsights: SpeechProgressInsights.fromMap(progressInsightsMap),
      analysisQuality: SpeechAnalysisQuality.fromMap(analysisQualityMap),
      phonemeAnalysis: SpeechPhonemeAnalysis.fromMap(phonemeAnalysisMap),
    );
  }

  SpecialistSpeechAnalysisItem withComparison(SpeechAnalysisComparison? value) {
    return SpecialistSpeechAnalysisItem(
      id: id,
      submissionId: submissionId,
      patientId: patientId,
      patientName: patientName,
      transcript: transcript,
      pronunciationScore: pronunciationScore,
      fluencyScore: fluencyScore,
      overallScore: overallScore,
      comparedToAnalysisId: comparedToAnalysisId,
      rawAiOutput: rawAiOutput,
      analyzedAt: analyzedAt,
      exerciseTitle: exerciseTitle,
      exerciseId: exerciseId,
      submissionStatus: submissionStatus,
      audioFileUrl: audioFileUrl,
      language: language,
      durationSeconds: durationSeconds,
      aiFeedback: aiFeedback,
      comparison: value ?? comparison,
      expectedSpeech: expectedSpeech,
      wordAnalysis: wordAnalysis,
      fluencyMetrics: fluencyMetrics,
      asrConfidence: asrConfidence,
      progressInsights: progressInsights,
      analysisQuality: analysisQuality,
      phonemeAnalysis: phonemeAnalysis,
    );
  }
}

class SpecialistSpeechProgressPoint {
  const SpecialistSpeechProgressPoint({
    required this.id,
    this.pronunciationScore,
    this.fluencyScore,
    this.overallScore,
    this.wordAccuracyPercentage,
    this.analyzedAt,
  });

  final String id;
  final double? pronunciationScore;
  final double? fluencyScore;
  final double? overallScore;
  final double? wordAccuracyPercentage;
  final DateTime? analyzedAt;

  factory SpecialistSpeechProgressPoint.fromMap(Map<String, dynamic> map) {
    return SpecialistSpeechProgressPoint(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      pronunciationScore: ApiResponseParser.readDouble(map, const [
        'pronunciation_score',
        'pronunciationScore',
      ]),
      fluencyScore: ApiResponseParser.readDouble(map, const [
        'fluency_score',
        'fluencyScore',
      ]),
      overallScore: ApiResponseParser.readDouble(map, const [
        'overall_score',
        'overallScore',
      ]),
      wordAccuracyPercentage: ApiResponseParser.readDouble(map, const [
        'word_accuracy_percentage',
        'wordAccuracyPercentage',
      ]),
      analyzedAt: ApiResponseParser.readDate(
        map['analyzed_at'] ?? map['analyzedAt'],
      ),
    );
  }
}

Map<String, dynamic>? _normalizeRawMap(dynamic raw) {
  if (raw is Map<String, dynamic>) {
    return raw;
  }
  if (raw is Map) {
    return raw.map((key, value) => MapEntry(key.toString(), value));
  }
  if (raw is String && raw.trim().isNotEmpty) {
    try {
      final decoded = jsonDecode(raw);
      return ApiResponseParser.asMap(decoded);
    } catch (_) {
      return null;
    }
  }
  return null;
}

String? _readText(Map<String, dynamic>? map, List<String> keys) {
  if (map == null) {
    return null;
  }
  return ApiResponseParser.readString(map, keys);
}

List<String> _readStringList(dynamic value) {
  if (value is! List) {
    return const [];
  }

  return value
      .map((item) => item?.toString().trim() ?? '')
      .where((item) => item.isNotEmpty)
      .toList();
}

List<String> _readRecommendations(Map<String, dynamic> map) {
  final value = map['recommendations'];
  if (value is! List) {
    return const [];
  }

  return value
      .map((item) => item?.toString().trim() ?? '')
      .where((item) => item.isNotEmpty)
      .toList();
}

int? _readInt(Map<String, dynamic> map, List<String> keys) {
  for (final key in keys) {
    final value = map[key];
    if (value is int) {
      return value;
    }
    if (value is num) {
      return value.toInt();
    }
    if (value is String) {
      final parsed = int.tryParse(value.trim());
      if (parsed != null) {
        return parsed;
      }
    }
  }
  return null;
}

String formatSpeechScore(double? score) {
  if (score == null) {
    return '—';
  }
  if (score <= 1) {
    return '${(score * 100).round()}%';
  }
  if (score == score.roundToDouble()) {
    return '${score.round()}';
  }
  return score.toStringAsFixed(1);
}

String formatSpeechScoreDelta(double? delta) {
  if (delta == null) {
    return '—';
  }
  final sign = delta > 0 ? '+' : '';
  if (delta == delta.roundToDouble()) {
    return '$sign${delta.round()}';
  }
  return '$sign${delta.toStringAsFixed(1)}';
}
