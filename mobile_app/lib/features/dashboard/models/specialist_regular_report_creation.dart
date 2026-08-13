/// Request and validation helpers for Specialist regular report creation.
///
/// Distinct from AI report generation. No period fields. No PDF-on-create.
library;

enum SpecialistRegularReportType {
  weekly,
  monthly,
  assessment,
  progress;

  String get apiValue => name;

  static SpecialistRegularReportType? tryParse(String? value) {
    final normalized = value?.trim().toLowerCase();
    return switch (normalized) {
      'weekly' => SpecialistRegularReportType.weekly,
      'monthly' => SpecialistRegularReportType.monthly,
      'assessment' => SpecialistRegularReportType.assessment,
      'progress' => SpecialistRegularReportType.progress,
      _ => null,
    };
  }
}

class SpecialistRegularReportCreateRequest {
  const SpecialistRegularReportCreateRequest({
    required this.patientId,
    required this.reportType,
    this.title,
    this.summary,
  });

  final String patientId;
  final SpecialistRegularReportType reportType;
  final String? title;
  final String? summary;

  /// Backend create body. Omits empty optional fields and never sends
  /// generated_by, specialist_id, pdf_url, period, or status.
  Map<String, dynamic> toJson() {
    final body = <String, dynamic>{
      'patient_id': patientId.trim(),
      'report_type': reportType.apiValue,
    };

    final trimmedTitle = title?.trim();
    if (trimmedTitle != null && trimmedTitle.isNotEmpty) {
      body['title'] = trimmedTitle;
    }

    final trimmedSummary = summary?.trim();
    if (trimmedSummary != null && trimmedSummary.isNotEmpty) {
      body['summary'] = trimmedSummary;
    }

    return body;
  }
}

/// Client-side validation mirroring backend POST /reports rules.
/// Returns null when valid.
String? validateSpecialistRegularReportCreation({
  required String? patientId,
  required SpecialistRegularReportType? reportType,
  String? title,
  String? summary,
}) {
  if (patientId == null || patientId.trim().isEmpty) {
    return 'Patient is required.';
  }
  if (reportType == null) {
    return 'report_type must be weekly, monthly, assessment, or progress';
  }

  final trimmedTitle = title?.trim();
  if (trimmedTitle != null && trimmedTitle.length > 200) {
    return 'title must be 200 characters or fewer';
  }

  // Summary is optional with no max length. Trim is applied at serialization.
  final trimmedSummary = summary?.trim();
  if (trimmedSummary != null && trimmedSummary.isEmpty) {
    return null;
  }

  return null;
}
