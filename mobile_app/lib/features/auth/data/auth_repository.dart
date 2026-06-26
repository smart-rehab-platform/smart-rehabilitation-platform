import 'package:dio/dio.dart';

import '../models/auth_response.dart';
import '../models/auth_user.dart';

class AuthRepository {
  AuthRepository(this._dio);

  final Dio _dio;

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    return _parseAuthResponse(response.data);
  }

  Future<AuthResponse> register({
    required String fullName,
    required String email,
    required String password,
    required String phone,
    required String role,
    String? profileImageUrl,
  }) async {
    final payload = <String, dynamic>{
      'fullName': fullName,
      'email': email,
      'password': password,
      'phone': phone,
      'role': role,
      if (profileImageUrl != null && profileImageUrl.trim().isNotEmpty)
        'profileImageUrl': profileImageUrl.trim(),
    };

    final response = await _dio.post('/auth/register', data: payload);
    return _parseAuthResponse(response.data);
  }

  Future<AuthUser?> getMe() async {
    final response = await _dio.get('/auth/me');
    final map = _normalizeMap(response.data);
    if (map == null) {
      return null;
    }

    final authResponse = AuthResponse.fromMap(map);
    if (authResponse.user != null) {
      return authResponse.user;
    }

    final nestedData = AuthUser.normalizeMap(map['data']);
    if (nestedData != null && AuthUser.looksLikeUserMap(nestedData)) {
      return AuthUser.fromMap(nestedData);
    }

    if (AuthUser.looksLikeUserMap(map)) {
      return AuthUser.fromMap(map);
    }

    return null;
  }

  void setAuthToken(String? token) {
    if (token == null || token.trim().isEmpty) {
      _dio.options.headers.remove('Authorization');
      return;
    }

    _dio.options.headers['Authorization'] = 'Bearer ${token.trim()}';
  }

  Future<void> logout() async {
    setAuthToken(null);
  }

  AuthResponse _parseAuthResponse(dynamic data) {
    final map = _normalizeMap(data);
    if (map == null) {
      return const AuthResponse();
    }

    return AuthResponse.fromMap(map);
  }

  Map<String, dynamic>? _normalizeMap(dynamic data) {
    return AuthUser.normalizeMap(data);
  }
}