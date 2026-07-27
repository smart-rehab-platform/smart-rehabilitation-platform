import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/parent_links_models.dart';

class ParentLinksRepository {
  ParentLinksRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<PatientGuardianLink>> fetchGuardians(String patientId) async {
    final rows = await _getList('/patients/$patientId/guardians');
    return rows
        .map(PatientGuardianLink.fromMap)
        .where((guardian) => guardian.parentId.isNotEmpty)
        .toList();
  }
}
