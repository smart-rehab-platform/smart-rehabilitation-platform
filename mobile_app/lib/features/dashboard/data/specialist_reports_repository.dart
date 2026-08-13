import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_reports_models.dart';

/// Raised when a patient-scoped reports request targets an unassigned patient.
class SpecialistReportScopeException implements Exception {
  const SpecialistReportScopeException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// Specialist reports API access.
///
/// Endpoints:
/// - GET /reports
/// - GET /reports/:id
/// - POST /reports/:id/export-pdf
/// - POST /ai/reports/:id/export-pdf
/// - GET /ai/reports
/// - GET /ai/reports/:id
class SpecialistReportsRepository {
  SpecialistReportsRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
  }

  Future<Map<String, dynamic>?> _getMap(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractMap(response.data);
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  Future<Set<String>> _loadAssignedPatientIds(String specialistUserId) async {
    final rows = await _getList('/specialists/$specialistUserId/patients');
    return rows
        .map(
          (row) =>
              ApiResponseParser.readString(row, const [
                'id',
                '_id',
                'patient_id',
                'patientId',
              ]) ??
              '',
        )
        .where((id) => id.isNotEmpty)
        .toSet();
  }

  bool _isAssignedPatient(Set<String> assignedPatientIds, String patientId) {
    return assignedPatientIds.contains(patientId.trim());
  }

  Future<List<SpecialistReportListItem>> fetchReports({
    required String specialistUserId,
    String? patientId,
  }) async {
    final scopedPatientId = patientId?.trim();
    final assignedPatientIds = await _loadAssignedPatientIds(specialistUserId);

    if (scopedPatientId != null && scopedPatientId.isNotEmpty) {
      if (!_isAssignedPatient(assignedPatientIds, scopedPatientId)) {
        throw const SpecialistReportScopeException(
          'Patient not found or not assigned to you.',
        );
      }
      return _fetchPatientReports(scopedPatientId);
    }

    if (assignedPatientIds.isEmpty) {
      return const [];
    }

    final regularRows = await _getList('/reports');
    final regular = regularRows
        .map(SpecialistReportListItem.fromRegularMap)
        .where(
          (item) =>
              item.id.isNotEmpty &&
              _isAssignedPatient(assignedPatientIds, item.patientId),
        );

    List<SpecialistReportListItem> ai = const [];
    try {
      final aiRows = await _getList('/ai/reports');
      ai = aiRows
          .map(SpecialistReportListItem.fromAiMap)
          .where(
            (item) =>
                item.id.isNotEmpty &&
                _isAssignedPatient(assignedPatientIds, item.patientId),
          )
          .toList();
    } on DioException {
      ai = const [];
    }

    final combined = [...regular, ...ai].toList()
      ..sort((a, b) {
        final aDate = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return bDate.compareTo(aDate);
      });

    return combined;
  }

  Future<List<SpecialistReportListItem>> _fetchPatientReports(
    String patientId,
  ) async {
    final regularRows = await _getList('/patients/$patientId/reports');
    final regular = regularRows
        .map(SpecialistReportListItem.fromRegularMap)
        .where((item) => item.id.isNotEmpty);

    List<SpecialistReportListItem> ai = const [];
    try {
      final aiRows = await _getList('/patients/$patientId/ai-reports');
      ai = aiRows
          .map(SpecialistReportListItem.fromAiMap)
          .where((item) => item.id.isNotEmpty)
          .toList();
    } on DioException {
      // Fallback: load all AI reports and filter client-side.
      try {
        final aiRows = await _getList('/ai/reports');
        ai = aiRows
            .map(SpecialistReportListItem.fromAiMap)
            .where(
              (item) =>
                  item.id.isNotEmpty &&
                  item.patientId.trim() == patientId,
            )
            .toList();
      } on DioException {
        ai = const [];
      }
    }

    final combined = [...regular, ...ai].toList()
      ..sort((a, b) {
        final aDate = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return bDate.compareTo(aDate);
      });

    return combined;
  }

  Future<SpecialistReportDetail> fetchReportDetail({
    required String reportId,
    required bool isAiReport,
  }) async {
    final path = isAiReport ? '/ai/reports/$reportId' : '/reports/$reportId';
    final map = await _getMap(path);
    if (map == null) {
      throw ReportNotFoundException(
        reportId: reportId,
        isAiReport: isAiReport,
      );
    }

    return isAiReport
        ? SpecialistReportDetail.fromAiMap(map)
        : SpecialistReportDetail.fromRegularMap(map);
  }

  Future<SpecialistReportDetail> generateReportPdf({
    required String reportId,
    required bool isAiReport,
  }) async {
    final path = isAiReport
        ? '/ai/reports/$reportId/export-pdf'
        : '/reports/$reportId/export-pdf';
    final response = await _dio.post(path);
    final envelope = ApiResponseParser.asMap(response.data);
    final data =
        envelope != null ? ApiResponseParser.asMap(envelope['data']) : null;

    final reportMap = data != null
        ? ApiResponseParser.asMap(data['report'])
        : null;

    if (reportMap != null) {
      return isAiReport
          ? SpecialistReportDetail.fromAiMap(reportMap)
          : SpecialistReportDetail.fromRegularMap(reportMap);
    }

    return fetchReportDetail(reportId: reportId, isAiReport: isAiReport);
  }
}

/// Raised when GET /reports/:id or GET /ai/reports/:id returns 404.
class ReportNotFoundException implements Exception {
  const ReportNotFoundException({
    required this.reportId,
    required this.isAiReport,
  });

  final String reportId;
  final bool isAiReport;

  @override
  String toString() =>
      isAiReport ? 'AI report not found.' : 'Report not found.';
}
