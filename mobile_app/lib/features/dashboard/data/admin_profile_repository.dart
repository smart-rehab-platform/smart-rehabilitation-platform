import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_profile_models.dart';

/// Admin profile API access.
///
/// Endpoints:
/// - GET /auth/me
/// - PUT /users/profile/me
class AdminProfileRepository {
  AdminProfileRepository(this._dio);

  final Dio _dio;

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

  Future<AdminProfileBundle> fetchProfileBundle(String userId) async {
    final meMap = await _getMap('/auth/me');
    if (meMap == null) {
      throw Exception('Unable to load profile');
    }

    return AdminProfileBundle(
      userId: userId,
      fullName:
          ApiResponseParser.readString(meMap, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          '',
      email: ApiResponseParser.readString(meMap, const ['email']) ?? '',
      phone: ApiResponseParser.readString(meMap, const [
        'phone',
        'phoneNumber',
        'mobile',
      ]),
      profileImageUrl: ApiResponseParser.readString(meMap, const [
        'profile_image_url',
        'profileImageUrl',
        'profile_image',
        'profileImage',
        'avatar',
        'avatarUrl',
      ]),
    );
  }

  Future<void> updateMyUserProfile(UpdateUserProfileInput input) async {
    await _dio.put('/users/profile/me', data: input.toJson());
  }
}

class AdminProfileBundle {
  const AdminProfileBundle({
    required this.userId,
    required this.fullName,
    required this.email,
    this.phone,
    this.profileImageUrl,
  });

  final String userId;
  final String fullName;
  final String email;
  final String? phone;
  final String? profileImageUrl;
}
