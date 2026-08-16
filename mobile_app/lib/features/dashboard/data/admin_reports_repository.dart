import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_reports_models.dart';

/// Admin reports API access.
///
/// Matches Web Admin Reports:
/// - GET /reports
/// - GET /ai/reports
class AdminReportsRepository {
  AdminReportsRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
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
}
