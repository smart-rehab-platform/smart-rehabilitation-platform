class ApiConstants {
  ApiConstants._();

  /// Origin used for static files (/uploads/...).

  /// On a physical Android device with `adb reverse tcp:5000 tcp:5000`, keep 127.0.0.1.

  /// Without adb reverse, set this to your PC LAN IP, e.g. http://192.168.1.10:5000

  static const String serverOrigin = 'http://127.0.0.1:5000';

  static const String baseUrl = '$serverOrigin/api/v1';

  static String? resolveMediaUrl(String? path) {
    if (path == null || path.trim().isEmpty) {
      return null;
    }

    final trimmed = path.trim();

    final origin = Uri.parse(serverOrigin);

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      final uri = Uri.tryParse(trimmed);

      if (uri == null) {
        return trimmed;
      }

      // Rebuild using ApiConstants host/port so stored localhost URLs work on device.

      return origin
          .replace(path: uri.path, query: uri.hasQuery ? uri.query : null)
          .toString();
    }

    final normalizedPath = trimmed.startsWith('/') ? trimmed : '/$trimmed';

    return '$serverOrigin$normalizedPath';
  }

  /// Resolves profile image paths for [Image.network] / [NetworkImage].
  static String? resolveProfileImageUrl(String? path, {int? cacheBustMs}) {
    final resolved = resolveMediaUrl(path);
    if (resolved == null) {
      return null;
    }

    if (cacheBustMs == null) {
      return resolved;
    }

    final uri = Uri.parse(resolved);
    return uri
        .replace(queryParameters: {...uri.queryParameters, 'v': '$cacheBustMs'})
        .toString();
  }
}
