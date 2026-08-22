import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';

class AdminUserRecord {
  const AdminUserRecord({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.isActive,
    this.phone,
    this.createdAt,
    this.profileImageUrl,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final bool isActive;
  final String? phone;
  final DateTime? createdAt;
  final String? profileImageUrl;

  factory AdminUserRecord.fromMap(Map<String, dynamic> map) {
    return AdminUserRecord(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name: ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'User',
      email: ApiResponseParser.readString(map, const ['email']) ?? '',
      role: ApiResponseParser.readString(map, const ['role']) ?? 'user',
      isActive: map['is_active'] == true || map['isActive'] == true,
      phone: ApiResponseParser.readString(map, const ['phone']),
      createdAt: ApiResponseParser.readDate(map['created_at'] ?? map['createdAt']),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
        'profile_image',
        'profileImage',
        'avatarUrl',
        'avatar',
      ]),
    );
  }
}

class AdminUsersRepository {
  AdminUsersRepository(this._dio);

  final Dio _dio;

  Future<List<AdminUserRecord>> fetchUsers() async {
    final response = await _dio.get('/users');
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .map(AdminUserRecord.fromMap)
        .toList();
  }

  Future<AdminUserRecord> createUser({
    required String fullName,
    required String email,
    required String password,
    required String role,
    String? phone,
  }) async {
    final response = await _dio.post(
      '/auth/register',
      data: {
        'full_name': fullName,
        'email': email,
        'password': password,
        'role': role,
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      },
    );

    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final userMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminUserRecord.fromMap(userMap);
  }

  Future<AdminUserRecord> updateUser({
    required String id,
    String? fullName,
    String? phone,
    String? role,
    bool? isActive,
  }) async {
    final response = await _dio.put(
      '/users/$id',
      data: {
        if (fullName != null) 'full_name': fullName,
        if (phone != null) 'phone': phone,
        if (role != null) 'role': role,
        if (isActive != null) 'is_active': isActive,
      },
    );

    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final userMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminUserRecord.fromMap(userMap);
  }

  Future<AdminUserRecord> updateStatus({
    required String id,
    required bool isActive,
  }) async {
    final response = await _dio.patch(
      '/users/$id/status',
      data: {'is_active': isActive},
    );

    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final userMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminUserRecord.fromMap(userMap);
  }

  Future<void> deleteUser(String id) async {
    await _dio.delete('/users/$id');
  }

  String readErrorMessage(DioException error) {
    final data = error.response?.data;
    if (data is Map) {
      final normalized = data.map((key, value) => MapEntry(key.toString(), value));
      final message = ApiResponseParser.readString(normalized, const ['message', 'error']);
      if (message != null) {
        return message;
      }
    }
    return error.message ?? 'Request failed.';
  }
}
