/// Request, date, and validation helpers for Specialist AI report generation.
library;

enum SpecialistAiReportType {
  weekly,
  monthly;

  String get apiValue => name;

  /// Explicit backend path. Never inferred from title or patient.
  String get generatePath => switch (this) {
        SpecialistAiReportType.weekly => '/ai/reports/generate-weekly',
        SpecialistAiReportType.monthly => '/ai/reports/generate-monthly',
      };

  static SpecialistAiReportType? tryParse(String? value) {
    final normalized = value?.trim().toLowerCase();
    return switch (normalized) {
      'weekly' => SpecialistAiReportType.weekly,
      'monthly' => SpecialistAiReportType.monthly,
      _ => null,
    };
  }
}

class SpecialistAiReportGenerateRequest {
  const SpecialistAiReportGenerateRequest({
    required this.patientId,
    required this.type,
    required this.periodStart,
    required this.periodEnd,
    this.language = 'en',
  });

  final String patientId;
  final SpecialistAiReportType type;
  final DateTime periodStart;
  final DateTime periodEnd;
  final String language;

  /// Backend body. Does not include specialist_id.
  Map<String, dynamic> toJson() {
    return {
      'patient_id': patientId.trim(),
      'period_start': formatSpecialistAiReportDate(periodStart),
      'period_end': formatSpecialistAiReportDate(periodEnd),
      'language': normalizeAiReportLanguage(language),
    };
  }
}

String normalizeAiReportLanguage(String? value) {
  final normalized = value?.trim().toLowerCase().replaceAll('_', '-') ?? '';
  final primary = normalized.split('-').first;
  if (primary == 'ar') {
    return 'ar';
  }
  return 'en';
}

/// Calendar date only: YYYY-MM-DD from local date parts (no UTC conversion).
String formatSpecialistAiReportDate(DateTime date) {
  final year = date.year.toString().padLeft(4, '0');
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '$year-$month-$day';
}

DateTime specialistAiReportDateOnly(DateTime date) {
  return DateTime(date.year, date.month, date.day);
}

/// Weekly default: last 7 calendar days inclusive, ending today.
/// Example: 2026-08-13 → start 2026-08-07, end 2026-08-13.
({DateTime start, DateTime end}) defaultWeeklyAiReportPeriod([DateTime? now]) {
  final end = specialistAiReportDateOnly(now ?? DateTime.now());
  final start = end.subtract(const Duration(days: 6));
  return (start: start, end: end);
}

/// Monthly default: last 30 calendar days inclusive, ending today.
/// Example: 2026-08-13 → start 2026-07-15, end 2026-08-13.
///
/// This is only the initial default. Custom ranges remain allowed.
({DateTime start, DateTime end}) defaultMonthlyAiReportPeriod([DateTime? now]) {
  final end = specialistAiReportDateOnly(now ?? DateTime.now());
  final start = end.subtract(const Duration(days: 29));
  return (start: start, end: end);
}

/// Default From/To for the selected report type (used when the type changes).
({DateTime start, DateTime end}) defaultPeriodForSpecialistAiReportType(
  SpecialistAiReportType type, [
  DateTime? now,
]) {
  return switch (type) {
    SpecialistAiReportType.weekly => defaultWeeklyAiReportPeriod(now),
    SpecialistAiReportType.monthly => defaultMonthlyAiReportPeriod(now),
  };
}

/// Client-side validation mirroring backend generate-report rules.
/// Returns null when valid.
String? validateSpecialistAiReportGeneration({
  required String? patientId,
  required SpecialistAiReportType? type,
  required DateTime? periodStart,
  required DateTime? periodEnd,
  DateTime? now,
}) {
  if (patientId == null || patientId.trim().isEmpty) {
    return 'Patient is required.';
  }
  if (type == null) {
    return 'Report type must be weekly or monthly.';
  }
  if (periodStart == null) {
    return 'Start date is required.';
  }
  if (periodEnd == null) {
    return 'End date is required.';
  }

  final start = specialistAiReportDateOnly(periodStart);
  final end = specialistAiReportDateOnly(periodEnd);
  final today = specialistAiReportDateOnly(now ?? DateTime.now());

  if (start.isAfter(end)) {
    return 'period_start cannot be after period_end';
  }
  if (end.isAfter(today)) {
    return 'Cannot generate report for a period that has not ended yet';
  }

  return null;
}
