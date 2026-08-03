import 'auth_user.dart';

class AuthResponse {
  const AuthResponse({
    this.token,
    this.user,
    this.message,
    this.rawData = const {},
  });

  final String? token;
  final AuthUser? user;
  final String? message;
  final Map<String, dynamic> rawData;

  bool get hasToken => token != null && token!.isNotEmpty;

  factory AuthResponse.fromMap(Map<String, dynamic> map) {
    return AuthResponse(
      token: _extractToken(map),
      user: _extractUser(map),
      message: _extractMessage(map),
      rawData: Map<String, dynamic>.unmodifiable(map),
    );
  }

  static String? _extractToken(dynamic source, [int depth = 0]) {
    if (depth > 5) {
      return null;
    }

    final map = AuthUser.normalizeMap(source);
    if (map == null) {
      return null;
    }

    const tokenKeys = <String>['token', 'accessToken', 'access_token', 'jwt'];

    for (final key in tokenKeys) {
      final value = map[key];
      if (value is String && value.trim().isNotEmpty) {
        return value.trim();
      }
    }

    for (final key in const ['data', 'result', 'payload', 'response']) {
      final nestedToken = _extractToken(map[key], depth + 1);
      if (nestedToken != null) {
        return nestedToken;
      }
    }

    for (final value in map.values) {
      if (value is Map || value is List) {
        final nestedToken = _extractToken(value, depth + 1);
        if (nestedToken != null) {
          return nestedToken;
        }
      }
    }

    return null;
  }

  static AuthUser? _extractUser(dynamic source, [int depth = 0]) {
    if (depth > 5) {
      return null;
    }

    if (source is List) {
      for (final item in source) {
        final nestedUser = _extractUser(item, depth + 1);
        if (nestedUser != null) {
          return nestedUser;
        }
      }
      return null;
    }

    final map = AuthUser.normalizeMap(source);
    if (map == null) {
      return null;
    }

    final directUser = AuthUser.fromDynamic(map);
    if (directUser != null &&
        (directUser.email.isNotEmpty || directUser.fullName.isNotEmpty)) {
      return directUser;
    }

    for (final key in const ['user', 'data', 'profile', 'account', 'payload']) {
      final nestedUser = _extractUser(map[key], depth + 1);
      if (nestedUser != null) {
        return nestedUser;
      }
    }

    for (final value in map.values) {
      if (value is Map || value is List) {
        final nestedUser = _extractUser(value, depth + 1);
        if (nestedUser != null) {
          return nestedUser;
        }
      }
    }

    return null;
  }

  static String? _extractMessage(dynamic source, [int depth = 0]) {
    if (depth > 3) {
      return null;
    }

    final map = AuthUser.normalizeMap(source);
    if (map == null) {
      return null;
    }

    for (final key in const ['message', 'error', 'detail']) {
      final value = map[key];
      if (value is String && value.trim().isNotEmpty) {
        return value.trim();
      }
    }

    for (final key in const ['data', 'result', 'payload']) {
      final nestedMessage = _extractMessage(map[key], depth + 1);
      if (nestedMessage != null) {
        return nestedMessage;
      }
    }

    return null;
  }
}
