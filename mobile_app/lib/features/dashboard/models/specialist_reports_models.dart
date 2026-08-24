import 'dart:convert';

import '../../../core/utils/api_response_parser.dart';
import 'specialist_ai_report_generation.dart';
import 'specialist_ai_report_structured_summary.dart';

enum SpecialistReportFilter {
  all,
  weekly,
  monthly,
  assessment,
  aiReports,
  recent;

  String get label => switch (this) {
        SpecialistReportFilter.all => 'All',
        SpecialistReportFilter.weekly => 'Weekly',
        SpecialistReportFilter.monthly => 'Monthly',
        SpecialistReportFilter.assessment => 'Assessment',
        SpecialistReportFilter.aiReports => 'AI Reports',
        SpecialistReportFilter.recent => 'Recent',
      };
}

/// Normalizes API summary values (plain text or JSON) for display.
class SpecialistReportSummary {
  const SpecialistReportSummary._();

  static String? normalize(dynamic raw) {
    if (raw == null) {
      return null;
    }
    if (raw is String) {
      final trimmed = raw.trim();
      if (trimmed.isEmpty) {
        return null;
      }
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          return _formatJson(jsonDecode(trimmed));
        } catch (_) {
          return trimmed;
        }
      }
      return trimmed;
    }
    if (raw is Map || raw is List) {
      final formatted = _formatJson(raw);
      return formatted.isEmpty ? null : formatted;
    }
    final text = raw.toString().trim();
    return text.isEmpty ? null : text;
  }

  static String _formatJson(dynamic value) {
    if (value == null) {
      return '';
    }
    if (value is String) {
      return value.trim();
    }
    if (value is Map) {
      final lines = <String>[];
      for (final entry in value.entries) {
        final formatted = _formatJson(entry.value);
        if (formatted.isEmpty) {
          continue;
        }
        lines.add('${entry.key}: $formatted');
      }
      return lines.join('\n');
    }
    if (value is List) {
      return value
          .map(_formatJson)
          .where((item) => item.isNotEmpty)
          .join('\n');
    }
    return value.toString().trim();
  }
}

String resolveAiReportLanguage(Map<String, dynamic> map, {String? summary}) {
  final direct = ApiResponseParser.readString(map, const ['language', 'locale']);
  if (direct != null && direct.trim().isNotEmpty) {
    return normalizeAiReportLanguage(direct);
  }

  final rawSummary = summary ?? map['summary'];
  if (rawSummary is String && rawSummary.trim().startsWith('{')) {
    try {
      final decoded = jsonDecode(rawSummary);
      if (decoded is Map && decoded['language'] != null) {
        return normalizeAiReportLanguage(decoded['language'].toString());
      }
    } catch (_) {
      // ignore malformed summary JSON
    }
  } else if (rawSummary is Map && rawSummary['language'] != null) {
    return normalizeAiReportLanguage(rawSummary['language'].toString());
  }

  return 'en';
}

class SpecialistReportListItem {
  const SpecialistReportListItem({
    required this.id,
    required this.patientId,
    required this.title,
    required this.isAiReport,
    this.patientName,
    this.patientProfileImageUrl,
    this.reportType,
    this.createdAt,
    this.summary,
    this.pdfUrl,
    this.specialistName,
    this.language = 'en',
  });

  final String id;
  final String patientId;
  final String title;
  final bool isAiReport;
  final String? patientName;
  final String? patientProfileImageUrl;
  final String? reportType;
  final DateTime? createdAt;
  final String? summary;
  final String? pdfUrl;
  final String? specialistName;
  final String language;

  bool get hasPdf {
    final url = pdfUrl;
    return url != null && url.trim().isNotEmpty;
  }

  /// AI report with no PDF yet ? awaiting specialist review.
  bool get isAwaitingReview => isAiReport && !hasPdf;

  String get statusLabel => hasPdf ? 'PDF Ready' : 'Awaiting Review';

  /// Standardized display title without embedding the patient name.
  String get displayTitle => standardizedReportTitle(
        isAiReport: isAiReport,
        reportType: reportType,
        rawTitle: title,
      );

  String get typeLabel {
    if (isAiReport) {
      final type = reportType?.trim();
      if (type == null || type.isEmpty) {
        return 'AI Report';
      }
      return 'AI ${_formatReportType(type)}';
    }
    return _formatReportType(reportType);
  }

  String get typeBadgeLabel => typeLabel;

  String get displaySummary => SpecialistReportSummary.normalize(summary) ?? '';

  String get preview => displaySummary;

  bool matchesFilter(SpecialistReportFilter filter) {
    return switch (filter) {
      SpecialistReportFilter.all => true,
      SpecialistReportFilter.weekly =>
        _normalizedType == 'weekly',
      SpecialistReportFilter.monthly =>
        _normalizedType == 'monthly',
      SpecialistReportFilter.assessment =>
        _normalizedType == 'assessment',
      SpecialistReportFilter.aiReports => isAiReport,
      SpecialistReportFilter.recent => _isRecent,
    };
  }

  String get _normalizedType => (reportType ?? '').toLowerCase();

  bool get _isRecent {
    final date = createdAt;
    if (date == null) {
      return false;
    }
    return DateTime.now().difference(date).inDays <= 7;
  }

  factory SpecialistReportListItem.fromRegularMap(Map<String, dynamic> map) {
    final reportType = ApiResponseParser.readString(map, const [
      'report_type',
      'reportType',
    ]);
    final rawTitle =
        ApiResponseParser.readString(map, const ['title']) ?? 'Report';

    return SpecialistReportListItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      title: standardizedReportTitle(
        isAiReport: false,
        reportType: reportType,
        rawTitle: rawTitle,
      ),
      isAiReport: false,
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      patientProfileImageUrl: ApiResponseParser.readString(map, const [
        'patient_profile_image_url',
        'patientProfileImageUrl',
        'profile_image_url',
        'profileImageUrl',
      ]),
      reportType: reportType,
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      summary: SpecialistReportSummary.normalize(map['summary']),
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      specialistName: ApiResponseParser.readString(map, const [
        'generated_by_name',
        'generatedByName',
        'specialist_name',
      ]),
      language: 'en',
    );
  }

  factory SpecialistReportListItem.fromAiMap(Map<String, dynamic> map) {
    final reportType =
        ApiResponseParser.readString(map, const ['type', 'report_type']);
    final rawTitle = ApiResponseParser.readString(map, const ['title']);
    final summary = SpecialistReportSummary.normalize(map['summary']);

    return SpecialistReportListItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      title: standardizedReportTitle(
        isAiReport: true,
        reportType: reportType,
        rawTitle: rawTitle,
      ),
      isAiReport: true,
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      patientProfileImageUrl: ApiResponseParser.readString(map, const [
        'patient_profile_image_url',
        'patientProfileImageUrl',
        'profile_image_url',
        'profileImageUrl',
      ]),
      reportType: reportType,
      createdAt: ApiResponseParser.readDate(
        map['generated_at'] ?? map['created_at'] ?? map['createdAt'],
      ),
      summary: summary,
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      specialistName: ApiResponseParser.readString(map, const [
        'generated_by_name',
        'generatedByName',
        'specialist_name',
      ]),
      language: resolveAiReportLanguage(map),
    );
  }

  static String _formatReportType(String? value) {
    final text = value?.trim();
    if (text == null || text.isEmpty) {
      return 'Report';
    }
    final normalized = text.replaceAll('_', ' ');
    return normalized
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .map((part) => '${part[0].toUpperCase()}${part.substring(1).toLowerCase()}')
        .join(' ');
  }
}

String standardizedReportTitle({
  required bool isAiReport,
  String? reportType,
  String? rawTitle,
}) {
  final type = (reportType ?? '').trim().toLowerCase().replaceAll(' ', '_');

  if (isAiReport) {
    return switch (type) {
      'weekly' => 'AI Weekly Summary',
      'monthly' => 'AI Monthly Summary',
      'clinical' || 'clinical_summary' || 'summary' => 'AI Clinical Summary',
      'assessment' => 'AI Assessment Summary',
      '' => 'AI Clinical Summary',
      _ => 'AI ${SpecialistReportListItem._formatReportType(type)} Summary',
    };
  }

  return switch (type) {
    'weekly' => 'Weekly Progress Report',
    'monthly' => 'Monthly Progress Report',
    'assessment' => 'Assessment Report',
    '' => _cleanEmbeddedPatientTitle(rawTitle) ?? 'Progress Report',
    _ => _cleanEmbeddedPatientTitle(rawTitle) ??
        '${SpecialistReportListItem._formatReportType(type)} Report',
  };
}

String? _cleanEmbeddedPatientTitle(String? rawTitle) {
  final trimmed = rawTitle?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return null;
  }

  // Strip patterns like "Weekly - Omar" / "Monthly - Patient".
  final parts = trimmed.split(RegExp(r'\s+-\s+'));
  if (parts.length >= 2) {
    final left = parts.first.trim();
    if (left.isNotEmpty) {
      final normalized = left.toLowerCase();
      if (normalized.contains('weekly')) {
        return 'Weekly Progress Report';
      }
      if (normalized.contains('monthly')) {
        return 'Monthly Progress Report';
      }
      if (normalized.contains('assessment')) {
        return 'Assessment Report';
      }
      if (normalized.startsWith('ai ')) {
        return left;
      }
      return left;
    }
  }

  return trimmed;
}

class SpecialistReportDetail {
  const SpecialistReportDetail({
    required this.id,
    required this.patientId,
    required this.title,
    required this.isAiReport,
    this.patientName,
    this.specialistName,
    this.reportType,
    this.createdAt,
    this.summary,
    this.rawSummary,
    this.pdfUrl,
    this.periodStart,
    this.periodEnd,
    this.language = 'en',
  });

  final String id;
  final String patientId;
  final String title;
  final bool isAiReport;
  final String? patientName;
  final String? specialistName;
  final String? reportType;
  final DateTime? createdAt;
  final String? summary;
  /// Original API summary (string/JSON) used for structured edit/PDF draft updates.
  final dynamic rawSummary;
  final String? pdfUrl;
  final DateTime? periodStart;
  final DateTime? periodEnd;
  final String language;

  bool get hasPdf {
    final url = pdfUrl;
    return url != null && url.trim().isNotEmpty;
  }

  /// AI report with no PDF yet — awaiting specialist review.
  bool get isAwaitingReview => isAiReport && !hasPdf;

  String get statusLabel => hasPdf ? 'PDF Ready' : 'Awaiting Review';

  SpecialistAiReportStructuredSummary get aiStructuredSummary =>
      SpecialistAiReportStructuredSummary.parse(rawSummary ?? summary);

  String get typeLabel {
    if (isAiReport) {
      final type = reportType?.trim();
      if (type == null || type.isEmpty) {
        return 'AI Report';
      }
      return 'AI ${SpecialistReportListItem._formatReportType(type)}';
    }
    return SpecialistReportListItem._formatReportType(reportType);
  }

  String get displayTitle => standardizedReportTitle(
        isAiReport: isAiReport,
        reportType: reportType,
        rawTitle: title,
      );

  String get displaySummary => SpecialistReportSummary.normalize(summary) ?? '';

  List<SpecialistReportSection> get sections {
    final structured = aiStructuredSummary;
    if (isAiReport && structured.isStructured) {
      final sections = <SpecialistReportSection>[];
      for (final narrative in structured.narrativeSections) {
        sections.add(
          SpecialistReportSection(
            title: narrative.id,
            content: narrative.content,
            fieldId: narrative.id,
          ),
        );
      }
      for (final list in structured.listSections) {
        sections.add(
          SpecialistReportSection(
            title: list.id,
            content: list.items.map((item) => '• $item').join('\n'),
            fieldId: list.id,
            items: list.items,
          ),
        );
      }
      return sections;
    }

    final text = displaySummary;
    if (text.isEmpty) {
      return const [];
    }

    return [
      SpecialistReportSection(
        title: isAiReport ? 'AI Summary' : 'Summary',
        content: text,
      ),
    ];
  }

  bool get hasAttachment => hasPdf;

  factory SpecialistReportDetail.fromRegularMap(Map<String, dynamic> map) {
    return SpecialistReportDetail(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      title: ApiResponseParser.readString(map, const ['title']) ?? 'Report',
      isAiReport: false,
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      specialistName: ApiResponseParser.readString(map, const [
        'generated_by_name',
        'generatedByName',
      ]),
      reportType: ApiResponseParser.readString(map, const [
        'report_type',
        'reportType',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      summary: SpecialistReportSummary.normalize(map['summary']),
      rawSummary: map['summary'],
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      language: 'en',
    );
  }

  factory SpecialistReportDetail.fromAiMap(Map<String, dynamic> map) {
    final reportType =
        ApiResponseParser.readString(map, const ['type', 'report_type']);
    final rawTitle = ApiResponseParser.readString(map, const ['title']);
    final summary = SpecialistReportSummary.normalize(map['summary']);

    return SpecialistReportDetail(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      title: standardizedReportTitle(
        isAiReport: true,
        reportType: reportType,
        rawTitle: rawTitle,
      ),
      isAiReport: true,
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      specialistName: ApiResponseParser.readString(map, const [
        'generated_by_name',
        'generatedByName',
        'specialist_name',
      ]),
      reportType: reportType,
      createdAt: ApiResponseParser.readDate(
        map['generated_at'] ?? map['created_at'],
      ),
      summary: summary,
      rawSummary: map['summary'],
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      periodStart: ApiResponseParser.readDate(
        map['period_start'] ?? map['periodStart'],
      ),
      periodEnd: ApiResponseParser.readDate(
        map['period_end'] ?? map['periodEnd'],
      ),
      language: resolveAiReportLanguage(map),
    );
  }
}

class SpecialistReportSection {
  const SpecialistReportSection({
    required this.title,
    required this.content,
    this.fieldId,
    this.items,
  });

  final String title;
  final String content;
  final String? fieldId;
  final List<String>? items;
}
