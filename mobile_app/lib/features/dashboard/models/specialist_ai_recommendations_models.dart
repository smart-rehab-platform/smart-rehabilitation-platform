import 'dart:convert';

import '../../../core/utils/api_response_parser.dart';

enum AiRecommendationType {
  exerciseSuggestion,
  planAdjustment,
  unknown;

  static AiRecommendationType fromApi(String? value) {
    return switch ((value ?? '').toLowerCase()) {
      'exercise_suggestion' => AiRecommendationType.exerciseSuggestion,
      'plan_adjustment' => AiRecommendationType.planAdjustment,
      _ => AiRecommendationType.unknown,
    };
  }

  String get apiValue => switch (this) {
        AiRecommendationType.exerciseSuggestion => 'exercise_suggestion',
        AiRecommendationType.planAdjustment => 'plan_adjustment',
        AiRecommendationType.unknown => 'exercise_suggestion',
      };

  String get label => switch (this) {
        AiRecommendationType.exerciseSuggestion => 'Exercise Suggestion',
        AiRecommendationType.planAdjustment => 'Plan Adjustment',
        AiRecommendationType.unknown => 'Recommendation',
      };
}

enum AiRecommendationStatus {
  pending,
  accepted,
  rejected,
  unknown;

  static AiRecommendationStatus fromApi(String? value) {
    return switch ((value ?? '').toLowerCase()) {
      'pending' => AiRecommendationStatus.pending,
      'accepted' => AiRecommendationStatus.accepted,
      'rejected' => AiRecommendationStatus.rejected,
      _ => AiRecommendationStatus.unknown,
    };
  }

  String get label => switch (this) {
        AiRecommendationStatus.pending => 'Pending',
        AiRecommendationStatus.accepted => 'Accepted',
        AiRecommendationStatus.rejected => 'Rejected',
        AiRecommendationStatus.unknown => 'Unknown',
      };

  bool get isPending => this == AiRecommendationStatus.pending;
}

class AiSuggestedExercise {
  const AiSuggestedExercise({
    this.exerciseId,
    this.title,
    this.reason,
  });

  final String? exerciseId;
  final String? title;
  final String? reason;

  factory AiSuggestedExercise.fromMap(Map<String, dynamic> map) {
    return AiSuggestedExercise(
      exerciseId: ApiResponseParser.readString(map, const [
        'exercise_id',
        'exerciseId',
        'id',
      ]),
      title: ApiResponseParser.readString(map, const ['title', 'name']),
      reason: ApiResponseParser.readString(map, const ['reason', 'summary']),
    );
  }

  String get displayLine {
    final name = title?.trim();
    final why = reason?.trim();
    if (name != null && name.isNotEmpty && why != null && why.isNotEmpty) {
      return '$name — $why';
    }
    return name ?? why ?? 'Suggested exercise';
  }
}

extension AiRecommendationDetailsDraftEdit on AiRecommendationDetails {
  static const clinicalAnalysisField = 'clinical_analysis';
  static const clinicalReasoningField = 'clinical_reasoning';
  static const planAdjustmentsField = 'treatment_plan_adjustments';
  static const suggestedExercisesField = 'suggested_exercises';

  static List<String> get editableFieldIds => const [
        clinicalReasoningField,
        clinicalAnalysisField,
        suggestedExercisesField,
        planAdjustmentsField,
      ];

  Map<String, String> toDraftFormMap() {
    final exerciseLines = suggestedExercises
        .map((exercise) => exercise.displayLine.trim())
        .where((line) => line.isNotEmpty)
        .toList();
    final uniqueAdjustments = <String>[];
    final seen = <String>{};
    for (final item in planAdjustments) {
      final text = item.trim();
      if (text.isEmpty || seen.contains(text)) {
        continue;
      }
      seen.add(text);
      uniqueAdjustments.add(text);
    }

    return {
      clinicalReasoningField: (clinicalReasoning ?? summary ?? '').trim(),
      clinicalAnalysisField: (clinicalAnalysis ?? '').trim(),
      suggestedExercisesField: exerciseLines.join('\n'),
      planAdjustmentsField: uniqueAdjustments.join('\n'),
    };
  }

  static List<String> _linesToList(String? value) {
    return (value ?? '')
        .split(RegExp(r'\r?\n'))
        .map((line) => line.trim())
        .where((line) => line.isNotEmpty)
        .toList();
  }

  static Map<String, dynamic>? _parseExerciseLine(String line) {
    final text = line.trim();
    if (text.isEmpty) {
      return null;
    }

    final match = RegExp(r'\s+[—–-]\s+').firstMatch(text);
    if (match != null) {
      final title = text.substring(0, match.start).trim();
      final reason = text.substring(match.end).trim();
      return {
        'exercise_id': null,
        'title': title.isEmpty ? text : title,
        'reason': reason.isEmpty ? null : reason,
      };
    }

    return {
      'exercise_id': null,
      'title': text,
      'reason': null,
    };
  }

  static Map<String, dynamic> buildUpdatePayload(
    Map<String, String> form, {
    List<AiSuggestedExercise> originalExercises = const [],
  }) {
    final exerciseLines = _linesToList(form[suggestedExercisesField]);
    final exercises = <Map<String, dynamic>>[];
    for (var index = 0; index < exerciseLines.length; index++) {
      final parsed = _parseExerciseLine(exerciseLines[index]);
      if (parsed == null) {
        continue;
      }
      if (index < originalExercises.length) {
        final original = originalExercises[index];
        final originalId = original.exerciseId?.trim();
        final originalTitle = original.title?.trim() ?? '';
        final parsedTitle = (parsed['title'] as String?)?.trim() ?? '';
        if (originalId != null &&
            originalId.isNotEmpty &&
            (originalTitle.isEmpty || originalTitle == parsedTitle)) {
          parsed['exercise_id'] = originalId;
        }
      }
      exercises.add(parsed);
    }

    return {
      clinicalAnalysisField: (form[clinicalAnalysisField] ?? '').trim(),
      clinicalReasoningField: (form[clinicalReasoningField] ?? '').trim(),
      planAdjustmentsField: _linesToList(form[planAdjustmentsField]),
      suggestedExercisesField: exercises,
    };
  }

  static bool hasClinicalContent(Map<String, String> form) {
    final payload = buildUpdatePayload(form);
    final analysis = (payload[clinicalAnalysisField] as String?) ?? '';
    final reasoning = (payload[clinicalReasoningField] as String?) ?? '';
    final adjustments =
        (payload[planAdjustmentsField] as List?)?.cast<String>() ?? const [];
    final exercises =
        (payload[suggestedExercisesField] as List?) ?? const [];
    return analysis.isNotEmpty ||
        reasoning.isNotEmpty ||
        adjustments.isNotEmpty ||
        exercises.isNotEmpty;
  }
}

class AiRecommendationDetails {
  const AiRecommendationDetails({
    this.summary,
    this.clinicalAnalysis,
    this.clinicalReasoning,
    this.suggestedExercises = const [],
    this.planAdjustments = const [],
    this.confidence,
    this.priorityLevel,
  });

  final String? summary;
  final String? clinicalAnalysis;
  final String? clinicalReasoning;
  final List<AiSuggestedExercise> suggestedExercises;
  final List<String> planAdjustments;
  final double? confidence;
  final String? priorityLevel;

  static AiRecommendationDetails parse(dynamic raw) {
    final map = _asDetailsMap(raw);
    if (map == null) {
      final text = _readPlainText(raw);
      return AiRecommendationDetails(summary: text);
    }

    final exercises = <AiSuggestedExercise>[];
    final rawExercises = map['suggested_exercises'] ?? map['suggestedExercises'];
    if (rawExercises is List) {
      for (final item in rawExercises) {
        if (item is Map) {
          exercises.add(
            AiSuggestedExercise.fromMap(
              item.map((key, value) => MapEntry(key.toString(), value)),
            ),
          );
        } else if (item != null) {
          final text = item.toString().trim();
          if (text.isNotEmpty) {
            exercises.add(AiSuggestedExercise(title: text));
          }
        }
      }
    }

    final adjustments = <String>[];
    final rawAdjustments =
        map['treatment_plan_adjustments'] ?? map['treatmentPlanAdjustments'];
    if (rawAdjustments is List) {
      for (final item in rawAdjustments) {
        final text = item?.toString().trim();
        if (text != null && text.isNotEmpty) {
          adjustments.add(text);
        }
      }
    }

    final suggestion = ApiResponseParser.readString(map, const [
      'suggestion',
    ]);
    if (suggestion != null &&
        suggestion.isNotEmpty &&
        !adjustments.contains(suggestion)) {
      adjustments.add(suggestion);
    }

    final summary = ApiResponseParser.readString(map, const [
          'reason',
          'clinical_reasoning',
          'clinicalReasoning',
        ]) ??
        ApiResponseParser.readString(map, const [
          'clinical_analysis',
          'clinicalAnalysis',
        ]);

    return AiRecommendationDetails(
      summary: summary,
      clinicalAnalysis: ApiResponseParser.readString(map, const [
        'clinical_analysis',
        'clinicalAnalysis',
      ]),
      clinicalReasoning: ApiResponseParser.readString(map, const [
        'clinical_reasoning',
        'clinicalReasoning',
        'reason',
      ]),
      suggestedExercises: exercises,
      planAdjustments: adjustments,
      confidence: ApiResponseParser.readDouble(map, const [
        'estimated_confidence',
        'estimatedConfidence',
        'confidence',
      ]),
      priorityLevel: ApiResponseParser.readString(map, const [
        'priority_level',
        'priorityLevel',
      ]),
    );
  }

  static Map<String, dynamic>? _asDetailsMap(dynamic raw) {
    if (raw is Map<String, dynamic>) {
      return raw;
    }
    if (raw is Map) {
      return raw.map((key, value) => MapEntry(key.toString(), value));
    }
    if (raw is String) {
      final trimmed = raw.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          final decoded = jsonDecode(trimmed);
          return _asDetailsMap(decoded);
        } catch (_) {
          return null;
        }
      }
    }
    return null;
  }

  static String? _readPlainText(dynamic raw) {
    if (raw is String) {
      final trimmed = raw.trim();
      return trimmed.isEmpty ? null : trimmed;
    }
    return null;
  }
}

class SpecialistAiRecommendationItem {
  const SpecialistAiRecommendationItem({
    required this.id,
    required this.patientId,
    required this.type,
    required this.status,
    required this.details,
    this.relatedPlanId,
    this.generatedAt,
  });

  final String id;
  final String patientId;
  final AiRecommendationType type;
  final AiRecommendationStatus status;
  final AiRecommendationDetails details;
  final String? relatedPlanId;
  final DateTime? generatedAt;

  factory SpecialistAiRecommendationItem.fromMap(Map<String, dynamic> map) {
    return SpecialistAiRecommendationItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      type: AiRecommendationType.fromApi(
        ApiResponseParser.readString(map, const ['type', 'recommendation_type']),
      ),
      status: AiRecommendationStatus.fromApi(
        ApiResponseParser.readString(map, const ['status']),
      ),
      details: AiRecommendationDetails.parse(map['details']),
      relatedPlanId: ApiResponseParser.readString(map, const [
        'related_plan_id',
        'relatedPlanId',
      ]),
      generatedAt: ApiResponseParser.readDate(
        map['generated_at'] ?? map['generatedAt'],
      ),
    );
  }
}

class SpecialistAiRecommendationsBundle {
  const SpecialistAiRecommendationsBundle({
    required this.patientId,
    required this.patientName,
    this.patientProfileImageUrl,
    this.planId,
    this.recommendations = const [],
  });

  final String patientId;
  final String patientName;
  final String? patientProfileImageUrl;
  final String? planId;
  final List<SpecialistAiRecommendationItem> recommendations;
}
