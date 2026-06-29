import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/presence_status.dart';

class PresenceRepository {
  PresenceRepository(this._dio);

  final Dio _dio;

  Future<List<PresenceStatus>> fetchAllUsers() async {
    final response = await _dio.get('/presence/users');
    return _parseList(response.data);
  }

  Future<PresenceStatus?> fetchUser(String userId) async {
    final response = await _dio.get('/presence/users/$userId');
    final map = ApiResponseParser.extractMap(response.data);
    final userMap = ApiResponseParser.extractMap(map?['data']) ?? map;
    if (userMap == null) {
      return null;
    }
    return PresenceStatus.fromMap(userMap);
  }

  Future<List<PresenceStatus>> fetchBulk(List<String> userIds) async {
    if (userIds.isEmpty) {
      return const [];
    }

    final response = await _dio.post(
      '/presence/users/bulk',
      data: {'user_ids': userIds},
    );

    return _parseList(response.data);
  }

  List<PresenceStatus> _parseList(dynamic data) {
    return ApiResponseParser.extractList(data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .map(PresenceStatus.fromMap)
        .where((status) => status.userId.isNotEmpty)
        .toList();
  }
}
