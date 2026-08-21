import 'dart:convert';

import 'push_notification_navigation.dart';

/// Serializes FCM data into a local-notification payload the existing
/// [PushNotificationNavigation] resolver can consume on tap.
class LocalNotificationPayload {
  LocalNotificationPayload._();

  static Map<String, String> navigationDataFromFcmData(
    Map<String, dynamic> data,
  ) {
    final stringData = PushNotificationNavigation.stringifyData(data);
    return PushNotificationNavigation.dataFromFields(
      notificationId:
          stringData['notificationId'] ?? stringData['notification_id'],
      type: stringData['type'],
      relatedEntityType:
          stringData['relatedEntityType'] ?? stringData['related_entity_type'],
      relatedEntityId:
          stringData['relatedEntityId'] ?? stringData['related_entity_id'],
    );
  }

  static String encode({
    required Map<String, String> navigationData,
    String? messageId,
  }) {
    final map = <String, String>{...navigationData};
    final id = messageId?.trim();
    if (id != null && id.isNotEmpty) {
      map['messageId'] = id;
    }
    return jsonEncode(map);
  }

  static Map<String, String> decode(String? payload) {
    if (payload == null || payload.trim().isEmpty) {
      return const {};
    }

    try {
      final decoded = jsonDecode(payload);
      if (decoded is! Map) {
        return const {};
      }
      return PushNotificationNavigation.stringifyData(
        decoded.map((key, value) => MapEntry(key.toString(), value)),
      );
    } catch (_) {
      return const {};
    }
  }

  static String? messageIdFrom(Map<String, String> data) {
    final id = PushNotificationNavigation.readData(data, const [
      'messageId',
      'message_id',
    ]);
    return id.isEmpty ? null : id;
  }

  /// Returns null when there is no title or body to show.
  static ({String? title, String? body})? displayContent({
    String? notificationTitle,
    String? notificationBody,
    Map<String, String> data = const {},
  }) {
    final title = _firstNonEmpty([
      notificationTitle,
      data['title'],
      data['notificationTitle'],
    ]);
    final body = _firstNonEmpty([
      notificationBody,
      data['body'],
      data['notificationBody'],
    ]);
    if (title == null && body == null) {
      return null;
    }
    return (title: title, body: body);
  }

  static String? _firstNonEmpty(List<String?> values) {
    for (final value in values) {
      final trimmed = value?.trim();
      if (trimmed != null && trimmed.isNotEmpty) {
        return trimmed;
      }
    }
    return null;
  }
}

/// Prevents the same Firebase message from being shown twice in the foreground.
class ForegroundDisplayGuard {
  ForegroundDisplayGuard({this.maxSize = 32});

  final int maxSize;
  final Set<String> _ids = <String>{};

  bool claim(String messageKey) {
    final key = messageKey.trim();
    if (key.isEmpty || _ids.contains(key)) {
      return false;
    }
    _ids.add(key);
    if (_ids.length > maxSize) {
      _ids.remove(_ids.first);
    }
    return true;
  }
}
