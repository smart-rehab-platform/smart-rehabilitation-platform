import 'dart:io' show Platform;

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'local_notification_payload.dart';
import 'push_notification_navigation.dart';

class LocalNotificationService {
  LocalNotificationService({
    FlutterLocalNotificationsPlugin? plugin,
    ForegroundDisplayGuard? displayGuard,
  }) : _plugin = plugin ?? FlutterLocalNotificationsPlugin(),
       _displayGuard = displayGuard ?? ForegroundDisplayGuard();

  static const String androidChannelId = 'smart_rehab_notifications';
  static const String androidChannelName = 'Smart Rehabilitation Notifications';
  static const String androidChannelDescription =
      'General notifications from Smart Rehabilitation.';

  final FlutterLocalNotificationsPlugin _plugin;
  final ForegroundDisplayGuard _displayGuard;

  void Function(Map<String, String> data)? onNotificationTapped;

  bool _initialized = false;
  bool _launchPayloadConsumed = false;

  Future<void> initialize() async {
    if (_initialized) {
      return;
    }

    if (kIsWeb || !Platform.isAndroid) {
      _initialized = true;
      return;
    }

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: androidSettings);

    await _plugin.initialize(
      settings: settings,
      onDidReceiveNotificationResponse: _onNotificationResponse,
    );

    final androidPlugin = _plugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    await androidPlugin?.createNotificationChannel(
      const AndroidNotificationChannel(
        androidChannelId,
        androidChannelName,
        description: androidChannelDescription,
        importance: Importance.high,
        playSound: true,
      ),
    );

    _initialized = true;
    await _consumeLaunchPayload();
  }

  Future<void> showRemoteMessage(RemoteMessage message) async {
    if (!_initialized || kIsWeb || !Platform.isAndroid) {
      return;
    }

    final fcmData = PushNotificationNavigation.stringifyData(message.data);
    final navigationData = LocalNotificationPayload.navigationDataFromFcmData(
      message.data,
    );
    final messageKey = PushNotificationNavigation.messageKey(
      messageId: message.messageId,
      data: navigationData.isEmpty ? fcmData : navigationData,
      sentTime: message.sentTime,
    );
    if (!_displayGuard.claim(messageKey)) {
      return;
    }

    final content = LocalNotificationPayload.displayContent(
      notificationTitle: message.notification?.title,
      notificationBody: message.notification?.body,
      data: fcmData,
    );
    if (content == null) {
      return;
    }

    final payload = LocalNotificationPayload.encode(
      navigationData: navigationData,
      messageId: message.messageId ?? messageKey,
    );

    try {
      await _plugin.show(
        id: messageKey.hashCode & 0x7fffffff,
        title: content.title,
        body: content.body,
        notificationDetails: const NotificationDetails(
          android: AndroidNotificationDetails(
            androidChannelId,
            androidChannelName,
            channelDescription: androidChannelDescription,
            importance: Importance.high,
            priority: Priority.high,
            playSound: true,
          ),
        ),
        payload: payload,
      );
    } catch (error, stackTrace) {
      debugPrint('[PushNotifications] local notification failed: $error');
      debugPrint('$stackTrace');
    }
  }

  void _onNotificationResponse(NotificationResponse response) {
    _dispatchPayload(response.payload);
  }

  Future<void> _consumeLaunchPayload() async {
    if (_launchPayloadConsumed) {
      return;
    }
    _launchPayloadConsumed = true;

    try {
      final details = await _plugin.getNotificationAppLaunchDetails();
      if (details?.didNotificationLaunchApp != true) {
        return;
      }
      _dispatchPayload(details?.notificationResponse?.payload);
    } catch (error) {
      debugPrint('[PushNotifications] local launch payload failed: $error');
    }
  }

  void _dispatchPayload(String? payload) {
    final data = LocalNotificationPayload.decode(payload);
    if (data.isEmpty) {
      return;
    }
    onNotificationTapped?.call(data);
  }
}
