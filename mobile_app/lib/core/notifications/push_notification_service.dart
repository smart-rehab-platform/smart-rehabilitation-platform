import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotificationService {
  PushNotificationService({FirebaseMessaging? messaging})
    : _messaging = messaging ?? FirebaseMessaging.instance;

  final FirebaseMessaging _messaging;

  Future<AuthorizationStatus> currentStatus() async {
    final settings = await _messaging.getNotificationSettings();
    return settings.authorizationStatus;
  }

  Future<bool> isAuthorized() async {
    final status = await currentStatus();
    return isGranted(status);
  }

  Future<AuthorizationStatus> requestPermission() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    return settings.authorizationStatus;
  }

  Future<String?> getToken() async {
    final token = await _messaging.getToken();
    if (token == null) {
      return null;
    }
    final trimmed = token.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  Stream<String> get onTokenRefresh => _messaging.onTokenRefresh;

  /// App was in the background and the user opened it by tapping a notification.
  Stream<RemoteMessage> get onMessageOpenedApp =>
      FirebaseMessaging.onMessageOpenedApp;

  /// App is in the foreground and an FCM message arrives.
  Stream<RemoteMessage> get onMessage => FirebaseMessaging.onMessage;

  /// App was terminated and launched by tapping a notification.
  Future<RemoteMessage?> getInitialMessage() {
    return _messaging.getInitialMessage();
  }

  static bool isGranted(AuthorizationStatus status) {
    return status == AuthorizationStatus.authorized ||
        status == AuthorizationStatus.provisional;
  }
}
