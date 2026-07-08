import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_reports_models.dart';

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

  Future<List<SpecialistReportListItem>> fetchReports() async {
    final regularRows = await _getList('/reports');
    final regular = regularRows
        .map(SpecialistReportListItem.fromRegularMap)
        .where((item) => item.id.isNotEmpty);

    List<SpecialistReportListItem> ai = const [];
    try {
      final aiRows = await _getList('/ai/reports');
      ai = aiRows
          .map(SpecialistReportListItem.fromAiMap)
          .where((item) => item.id.isNotEmpty)
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

  Future<SpecialistReportDetail> fetchReportDetail({
    required String reportId,
    required bool isAiReport,
  }) async {
    final path = isAiReport ? '/ai/reports/$reportId' : '/reports/$reportId';
    final map = await _getMap(path);
    if (map == null) {
      throw Exception('Report not found');
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
