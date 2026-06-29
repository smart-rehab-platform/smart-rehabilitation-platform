class ApiConstants {
  ApiConstants._();

static const String serverOrigin = 'http://127.0.0.1:5000';
static const String baseUrl = 'http://127.0.0.1:5000/api/v1';

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
