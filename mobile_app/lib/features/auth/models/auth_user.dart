class AuthUser {
  const AuthUser({
    this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.role,
    this.profileImageUrl,
    this.rawData = const {},
  });

  final String? id;
  final String fullName;
  final String email;
  final String? phone;
  final String? role;
  final String? profileImageUrl;
  final Map<String, dynamic> rawData;

  factory AuthUser.fromMap(Map<String, dynamic> map) {
    return AuthUser(
      id: _readString(map, const ['id', '_id', 'userId']),
      fullName:
          _readString(map, const ['fullName', 'full_name', 'name', 'username']) ??
          '',
      email: _readString(map, const ['email', 'mail']) ?? '',
      phone: _readString(map, const ['phone', 'phoneNumber', 'mobile']),
      role: _readString(map, const ['role', 'userRole']),
      profileImageUrl: _readString(
        map,
        const [
          'profileImageUrl',
          'profile_image_url',
          'profileImage',
          'profile_image',
          'avatar',
          'avatarUrl',
        ],
      ),
      rawData: Map<String, dynamic>.unmodifiable(map),
    );
  }

  static AuthUser? fromDynamic(dynamic value) {
    final map = normalizeMap(value);
    if (map == null || !looksLikeUserMap(map)) {
      return null;
    }

    return AuthUser.fromMap(map);
  }

  static Map<String, dynamic>? normalizeMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }

    if (value is Map) {
      return value.map(
        (key, val) => MapEntry(key.toString(), val),
      );
    }

    return null;
  }

  static bool looksLikeUserMap(Map<String, dynamic> map) {
    const userKeys = <String>{
      'id',
      '_id',
      'userId',
      'fullName',
      'full_name',
      'name',
      'username',
      'email',
      'mail',
      'phone',
      'phoneNumber',
      'mobile',
      'role',
      'userRole',
      'profileImageUrl',
      'profile_image_url',
      'profileImage',
      'profile_image',
      'avatar',
      'avatarUrl',
    };

    return map.keys.any(userKeys.contains);
  }

  static String? _readString(Map<String, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value is String && value.trim().isNotEmpty) {
        return value.trim();
      }

      if (value != null && value.toString().trim().isNotEmpty) {
        return value.toString().trim();
      }
    }

    return null;
  }
}
