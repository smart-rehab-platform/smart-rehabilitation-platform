class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'http://localhost:5000/api/v1';
  static const String serverOrigin = 'http://localhost:5000';

  static String? resolveMediaUrl(String? path) {
    if (path == null || path.trim().isEmpty) {
      return null;
    }

    final trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return '$serverOrigin$trimmed';
    }

    return '$serverOrigin/$trimmed';
  }
}