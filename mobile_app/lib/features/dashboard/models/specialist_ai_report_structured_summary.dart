import 'dart:convert';

/// Structured AI report summary fields used for review/edit before PDF approval.
class SpecialistAiReportStructuredSummary {
  const SpecialistAiReportStructuredSummary({
    required this.isStructured,
    this.plainTextFallback,
    this.narrativeSections = const [],
    this.listSections = const [],
    this.priorityLevel,
    this.confidencePercent,
  });

  final bool isStructured;
  final String? plainTextFallback;
  final List<SpecialistAiReportNarrativeSection> narrativeSections;
  final List<SpecialistAiReportListSection> listSections;
  final String? priorityLevel;
  final int? confidencePercent;

  static const narrativeFieldIds = <String>[
    'executive_summary',
    'patient_progress_summary',
    'speech_analysis_summary',
    'exercise_adherence_summary',
    'goal_progress_summary',
  ];

  static const listFieldIds = <String>[
    'clinical_insights',
    'risks_or_regressions',
    'recommendations',
    'next_steps',
  ];

  factory SpecialistAiReportStructuredSummary.parse(dynamic raw) {
    final parsed = _tryParseObject(raw);
    if (parsed == null) {
      return SpecialistAiReportStructuredSummary(
        isStructured: false,
        plainTextFallback: _legacyFallback(raw),
      );
    }

    final narrative = <SpecialistAiReportNarrativeSection>[];
    for (final id in narrativeFieldIds) {
      final content = _readString(parsed, id);
      if (content != null) {
        narrative.add(
          SpecialistAiReportNarrativeSection(
            id: id,
            content: content,
            featured: id == 'executive_summary',
          ),
        );
      }
    }

    final lists = <SpecialistAiReportListSection>[];
    for (final id in listFieldIds) {
      final items = _readStringList(parsed, id);
      if (items.isNotEmpty) {
        lists.add(
          SpecialistAiReportListSection(
            id: id,
            items: items,
            variant: id == 'risks_or_regressions'
                ? 'warning'
                : id == 'recommendations'
                    ? 'numbered'
                    : 'default',
          ),
        );
      }
    }

    final priority = _normalizePriority(parsed['priority_level']);
    final confidence = _normalizeConfidence(parsed['estimated_confidence']);
    final usedFallback = parsed['used_fallback'] == true;

    final hasStructured = narrative.isNotEmpty ||
        lists.isNotEmpty ||
        priority != null ||
        confidence != null ||
        usedFallback;

    if (!hasStructured) {
      return SpecialistAiReportStructuredSummary(
        isStructured: false,
        plainTextFallback: _legacyFallback(raw),
      );
    }

    return SpecialistAiReportStructuredSummary(
      isStructured: true,
      narrativeSections: narrative,
      listSections: lists,
      priorityLevel: priority,
      confidencePercent: confidence,
    );
  }

  String narrativeText(String fieldId) {
    for (final section in narrativeSections) {
      if (section.id == fieldId) {
        return section.content;
      }
    }
    if (!isStructured &&
        fieldId == 'executive_summary' &&
        plainTextFallback != null) {
      return plainTextFallback!;
    }
    return '';
  }

  String listText(String fieldId) {
    for (final section in listSections) {
      if (section.id == fieldId) {
        return section.items.join('\n');
      }
    }
    return '';
  }

  Map<String, String> toDraftFormMap() {
    final form = <String, String>{};
    for (final id in narrativeFieldIds) {
      form[id] = narrativeText(id);
    }
    for (final id in listFieldIds) {
      form[id] = listText(id);
    }
    return form;
  }

  static Map<String, dynamic> buildUpdatePayload(Map<String, String> form) {
    final payload = <String, dynamic>{};
    for (final id in narrativeFieldIds) {
      payload[id] = (form[id] ?? '').trim();
    }
    for (final id in listFieldIds) {
      payload[id] = (form[id] ?? '')
          .split(RegExp(r'\r?\n'))
          .map((line) => line.trim())
          .where((line) => line.isNotEmpty)
          .toList();
    }
    return payload;
  }

  static bool hasClinicalContent(Map<String, String> form) {
    final payload = buildUpdatePayload(form);
    for (final id in narrativeFieldIds) {
      if ((payload[id] as String).isNotEmpty) {
        return true;
      }
    }
    for (final id in listFieldIds) {
      if ((payload[id] as List).isNotEmpty) {
        return true;
      }
    }
    return false;
  }

  static Map<String, dynamic>? _tryParseObject(dynamic raw) {
    if (raw == null) {
      return null;
    }
    if (raw is Map) {
      return raw.map((key, value) => MapEntry(key.toString(), value));
    }
    if (raw is! String) {
      return null;
    }
    final trimmed = raw.trim();
    if (trimmed.isEmpty ||
        (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return null;
    }
    try {
      final decoded = jsonDecode(trimmed);
      if (decoded is Map) {
        return decoded.map((key, value) => MapEntry(key.toString(), value));
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  static String? _legacyFallback(dynamic raw) {
    if (raw == null) {
      return null;
    }
    if (raw is String) {
      final trimmed = raw.trim();
      return trimmed.isEmpty ? null : trimmed;
    }
    return raw.toString().trim().isEmpty ? null : raw.toString().trim();
  }

  static String? _readString(Map<String, dynamic> record, String key) {
    final value = record[key];
    if (value is String && value.trim().isNotEmpty) {
      return value.trim();
    }
    return null;
  }

  static List<String> _readStringList(Map<String, dynamic> record, String key) {
    final value = record[key];
    if (value is! List) {
      return const [];
    }
    return value
        .map((item) => item is String ? item.trim() : item?.toString().trim())
        .whereType<String>()
        .where((item) => item.isNotEmpty)
        .toList();
  }

  static String? _normalizePriority(dynamic value) {
    final normalized = value?.toString().trim().toLowerCase();
    if (normalized == 'low' ||
        normalized == 'medium' ||
        normalized == 'high') {
      return normalized;
    }
    return null;
  }

  static int? _normalizeConfidence(dynamic value) {
    if (value == null) {
      return null;
    }
    final numeric = value is num ? value.toDouble() : double.tryParse('$value');
    if (numeric == null || !numeric.isFinite) {
      return null;
    }
    var scaled = numeric;
    if (scaled > 0 && scaled <= 1) {
      scaled *= 100;
    }
    return scaled.clamp(0, 100).round();
  }
}

class SpecialistAiReportNarrativeSection {
  const SpecialistAiReportNarrativeSection({
    required this.id,
    required this.content,
    this.featured = false,
  });

  final String id;
  final String content;
  final bool featured;
}

class SpecialistAiReportListSection {
  const SpecialistAiReportListSection({
    required this.id,
    required this.items,
    this.variant = 'default',
  });

  final String id;
  final List<String> items;
  final String variant;
}
