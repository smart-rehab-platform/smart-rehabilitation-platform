import 'dart:convert';

import '../../../core/utils/api_response_parser.dart';

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

class SpecialistReportListItem {
  const SpecialistReportListItem({
    required this.id,
    required this.patientId,
    required this.title,
    required this.isAiReport,
    this.patientName,
    this.reportType,
    this.createdAt,
    this.summary,
    this.pdfUrl,
    this.specialistName,
  });

  final String id;
  final String patientId;
  final String title;
  final bool isAiReport;
  final String? patientName;
  final String? reportType;
  final DateTime? createdAt;
  final String? summary;
  final String? pdfUrl;
  final String? specialistName;

  bool get hasPdf {
    final url = pdfUrl;
    return url != null && url.trim().isNotEmpty;
  }

  String get statusLabel => 'PDF Ready';

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
    return SpecialistReportListItem(
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
      reportType: ApiResponseParser.readString(map, const [
        'report_type',
        'reportType',
      ]),
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
    );
  }

  factory SpecialistReportListItem.fromAiMap(Map<String, dynamic> map) {
    return SpecialistReportListItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      title: _aiTitle(map),
      isAiReport: true,
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      reportType: ApiResponseParser.readString(map, const ['type', 'report_type']),
      createdAt: ApiResponseParser.readDate(
        map['generated_at'] ?? map['created_at'] ?? map['createdAt'],
      ),
      summary: SpecialistReportSummary.normalize(map['summary']),
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      specialistName: null,
    );
  }

  static String _aiTitle(Map<String, dynamic> map) {
    final type = ApiResponseParser.readString(map, const ['type', 'report_type']);
    final patient = ApiResponseParser.readString(map, const [
      'patient_name',
      'patientName',
    ]);
    if (type != null && patient != null) {
      return '${_formatReportType(type)} — $patient';
    }
    return ApiResponseParser.readString(map, const ['title']) ?? 'AI Report';
  }

  static String _formatReportType(String? value) {
    final text = value?.trim();
    if (text == null || text.isEmpty) {
      return 'Report';
    }
    return text[0].toUpperCase() + text.substring(1);
  }
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
    this.pdfUrl,
    this.periodStart,
    this.periodEnd,
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
  final String? pdfUrl;
  final DateTime? periodStart;
  final DateTime? periodEnd;

  bool get hasPdf {
    final url = pdfUrl;
    return url != null && url.trim().isNotEmpty;
  }

  String get statusLabel => 'PDF Ready';

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

  String get displaySummary => SpecialistReportSummary.normalize(summary) ?? '';

  List<SpecialistReportSection> get sections {
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
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
    );
  }

  factory SpecialistReportDetail.fromAiMap(Map<String, dynamic> map) {
    return SpecialistReportDetail(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      title: SpecialistReportListItem._aiTitle(map),
      isAiReport: true,
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      reportType: ApiResponseParser.readString(map, const ['type', 'report_type']),
      createdAt: ApiResponseParser.readDate(
        map['generated_at'] ?? map['created_at'],
      ),
      summary: SpecialistReportSummary.normalize(map['summary']),
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      periodStart: ApiResponseParser.readDate(
        map['period_start'] ?? map['periodStart'],
      ),
      periodEnd: ApiResponseParser.readDate(
        map['period_end'] ?? map['periodEnd'],
      ),
    );
  }
}

class SpecialistReportSection {
  const SpecialistReportSection({
    required this.title,
    required this.content,
  });

  final String title;
  final String content;
}
