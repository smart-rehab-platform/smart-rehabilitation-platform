import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/parent_profile_models.dart';
import '../models/specialist_profile_models.dart';

/// Parent profile API access.
///
/// Endpoints:
/// - GET /auth/me
/// - GET /parents (filtered strictly by authenticated user_id)
/// - PUT /users/profile/me
/// - PUT /parents/:profileId/profile
/// - POST /parents/profile
class ParentProfileRepository {
  ParentProfileRepository(this._dio);

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

  Future<Map<String, dynamic>?> _findParentProfileRowForUser(
    String userId,
  ) async {
    final rows = await _getList('/parents');
    Map<String, dynamic>? match;

    for (final row in rows) {
      final rowUserId = ApiResponseParser.readString(row, const [
        'user_id',
        'userId',
      ]);
      if (rowUserId != userId) {
        continue;
      }
      if (match != null) {
        throw Exception(
          'Multiple parent profile records found for the current user.',
        );
      }
      match = row;
    }

    return match;
  }

  Future<ParentProfileBundle> fetchProfileBundle(String userId) async {
    final meMap = await _getMap('/auth/me');
    if (meMap == null) {
      throw Exception('Unable to load profile');
    }

    final fullName = ApiResponseParser.readString(meMap, const [
          'full_name',
          'fullName',
          'name',
        ]) ??
        '';
    final email = ApiResponseParser.readString(meMap, const ['email']) ?? '';
    final phone = ApiResponseParser.readString(meMap, const [
      'phone',
      'phoneNumber',
      'mobile',
    ]);
    final profileImageUrl = ApiResponseParser.readString(meMap, const [
      'profile_image_url',
      'profileImageUrl',
      'profile_image',
      'profileImage',
      'avatar',
      'avatarUrl',
    ]);

    final parentRow = await _findParentProfileRowForUser(userId);
    final parentProfile = parentRow == null
        ? null
        : ParentProfileRecord.fromMap(parentRow);

    return ParentProfileBundle(
      userId: userId,
      fullName: fullName,
      email: email,
      phone: phone,
      profileImageUrl: profileImageUrl,
      profileId: parentProfile?.profileId,
      address: parentProfile?.address,
      relationshipNotes: parentProfile?.relationshipNotes,
    );
  }

  Future<void> updateMyUserProfile(UpdateUserProfileInput input) async {
    await _dio.put('/users/profile/me', data: input.toJson());
  }

  Future<ParentProfileRecord> updateParentProfile(
    String profileId,
    UpdateParentProfileInput input,
  ) async {
    final response = await _dio.put(
      '/parents/$profileId/profile',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid parent profile response');
    }
    return ParentProfileRecord.fromMap(map);
  }

  Future<ParentProfileRecord> createParentProfile(
    UpdateParentProfileInput input,
  ) async {
    final response = await _dio.post(
      '/parents/profile',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid parent profile response');
    }
    return ParentProfileRecord.fromMap(map);
  }
}
