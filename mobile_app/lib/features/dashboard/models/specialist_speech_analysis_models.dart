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
    this.submissionStatus,
    this.audioFileUrl,
    this.language,
    this.durationSeconds,
    this.aiFeedback = const SpeechAnalysisAiFeedback(),
    this.comparison,
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
  final String? submissionStatus;
  final String? audioFileUrl;
  final String? language;
  final double? durationSeconds;
  final SpeechAnalysisAiFeedback aiFeedback;
  final SpeechAnalysisComparison? comparison;

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
      submissionStatus: submissionStatus,
      audioFileUrl: audioFileUrl,
      language: language,
      durationSeconds: durationSeconds,
      aiFeedback: aiFeedback,
      comparison: value ?? comparison,
    );
  }
}

class SpecialistSpeechProgressPoint {
  const SpecialistSpeechProgressPoint({
    required this.id,
    this.pronunciationScore,
    this.fluencyScore,
    this.overallScore,
    this.analyzedAt,
  });

  final String id;
  final double? pronunciationScore;
  final double? fluencyScore;
  final double? overallScore;
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
