class ApiResponseParser {
  ApiResponseParser._();

  static Map<String, dynamic>? asMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }
    if (value is Map) {
      return value.map((key, val) => MapEntry(key.toString(), val));
    }
    return null;
  }

  static List<dynamic> extractList(dynamic responseData) {
    final map = asMap(responseData);
    if (map == null) {
      return const [];
    }

    final data = map['data'];
    if (data is List) {
      return data;
    }

    if (data is Map) {
      final nested = data['items'] ?? data['results'] ?? data['records'];
      if (nested is List) {
        return nested;
      }
    }

    for (final key in const [
      'notifications',
      'children',
      'patients',
      'tasks',
      'parents',
      'users',
    ]) {
      final value = map[key];
      if (value is List) {
        return value;
      }
    }

    return const [];
  }

  static Map<String, dynamic>? extractMap(dynamic responseData) {
    final map = asMap(responseData);
    if (map == null) {
      return null;
    }

    final data = map['data'];
    if (data is Map<String, dynamic>) {
      return data;
    }
    if (data is Map) {
      return data.map((key, value) => MapEntry(key.toString(), value));
    }

    return map;
  }

  static String? readString(Map<String, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value == null) {
        continue;
      }
      final text = value.toString().trim();
      if (text.isNotEmpty) {
        return text;
      }
    }
    return null;
  }

  static double? readDouble(Map<String, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value is num) {
        return value.toDouble();
      }
      if (value != null) {
        return double.tryParse(value.toString());
      }
    }
    return null;
  }

  static int? readInt(Map<String, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value is int) {
        return value;
      }
      if (value is num) {
        return value.toInt();
      }
      if (value != null) {
        return int.tryParse(value.toString());
      }
    }
    return null;
  }

  static DateTime? readDate(dynamic value) {
    if (value == null) {
      return null;
    }
    if (value is DateTime) {
      return value;
    }
    return DateTime.tryParse(value.toString());
  }
}
