import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/dashboard/providers/parent_features_provider.dart';
import '../../features/dashboard/providers/specialist_features_provider.dart';
import '../routes/app_router.dart';
import '../routes/app_routes.dart';
import '../routes/role_routing.dart';
import 'device_token_repository.dart';
import 'local_notification_payload.dart';
import 'local_notification_service.dart';
import 'notification_permission_sheet.dart';
import 'notification_prompt_storage.dart';
import 'push_notification_navigation.dart';
import 'push_notification_service.dart';

final pushNotificationServiceProvider = Provider<PushNotificationService>((
  ref,
) {
  return PushNotificationService();
});

final localNotificationServiceProvider = Provider<LocalNotificationService>((
  ref,
) {
  return LocalNotificationService();
});

final notificationPromptStorageProvider = Provider<NotificationPromptStorage>((
  ref,
) {
  return const NotificationPromptStorage();
});

final pushNotificationControllerProvider = Provider<PushNotificationController>(
  (ref) {
    final controller = PushNotificationController(
      ref: ref,
      service: ref.watch(pushNotificationServiceProvider),
      localNotifications: ref.watch(localNotificationServiceProvider),
      repository: ref.watch(deviceTokenRepositoryProvider),
      storage: ref.watch(notificationPromptStorageProvider),
    );
    ref.onDispose(controller.dispose);
    return controller;
  },
);

/// Starts FCM token-refresh registration and notification-tap navigation.
final pushNotificationLifecycleProvider = Provider<void>((ref) {
  final controller = ref.watch(pushNotificationControllerProvider);
  controller.startTapHandling();

  ref.listen<AuthState>(authProvider, (previous, next) {
    unawaited(controller.handleAuthChanged(previous, next));
  });

  final auth = ref.read(authProvider);
  if (auth.isAuthenticated) {
    Future.microtask(() => controller.onAuthenticated());
  }

  Future.microtask(() => controller.flushPendingNavigation());
});

class PushNotificationController {
  PushNotificationController({
    required Ref ref,
    required PushNotificationService service,
    required LocalNotificationService localNotifications,
    required DeviceTokenRepository repository,
    required NotificationPromptStorage storage,
  }) : _ref = ref,
       _service = service,
       _localNotifications = localNotifications,
       _repository = repository,
       _storage = storage;

  final Ref _ref;
  final PushNotificationService _service;
  final LocalNotificationService _localNotifications;
  final DeviceTokenRepository _repository;
  final NotificationPromptStorage _storage;

  StreamSubscription<String>? _refreshSubscription;
  StreamSubscription<RemoteMessage>? _openedAppSubscription;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  GoRouter? _router;
  bool _promptInFlight = false;
  String? _lastRegisteredToken;
  bool _tapHandlingStarted = false;
  bool _flushScheduled = false;
  _PendingPushNavigation? _pending;
  final Set<String> _processedMessageIds = <String>{};

  void dispose() {
    unawaited(_refreshSubscription?.cancel());
    _refreshSubscription = null;
    unawaited(_openedAppSubscription?.cancel());
    _openedAppSubscription = null;
    unawaited(_foregroundSubscription?.cancel());
    _foregroundSubscription = null;
    _localNotifications.onNotificationTapped = null;
    final router = _router;
    if (router != null) {
      router.routerDelegate.removeListener(_onRouterChanged);
    }
    _router = null;
  }

  /// Registers tap listeners once for the app lifetime (not per dashboard).
  void startTapHandling() {
    if (_tapHandlingStarted) {
      return;
    }
    _tapHandlingStarted = true;

    _openedAppSubscription = _service.onMessageOpenedApp.listen(
      _handleOpenedMessage,
      onError: (Object error) {
        debugPrint('[PushNotifications] onMessageOpenedApp failed: $error');
      },
    );

    final router = _ref.read(goRouterProvider);
    _router = router;
    router.routerDelegate.addListener(_onRouterChanged);

    unawaited(_consumeInitialMessage());
    unawaited(_startForegroundHandling());
  }

  Future<void> _startForegroundHandling() async {
    try {
      _localNotifications.onNotificationTapped = _handleLocalNotificationTap;
      await _localNotifications.initialize();
    } catch (error, stackTrace) {
      debugPrint('[PushNotifications] local notifications init failed: $error');
      debugPrint('$stackTrace');
    }

    if (_foregroundSubscription != null) {
      return;
    }
    _foregroundSubscription = _service.onMessage.listen(
      _handleForegroundMessage,
      onError: (Object error) {
        debugPrint('[PushNotifications] onMessage failed: $error');
      },
    );
  }

  void _handleForegroundMessage(RemoteMessage message) {
    unawaited(_localNotifications.showRemoteMessage(message));
  }

  void _handleLocalNotificationTap(Map<String, String> data) {
    _handleOpenedData(
      data,
      messageId: LocalNotificationPayload.messageIdFrom(data),
    );
  }

  Future<void> handleAuthChanged(AuthState? previous, AuthState next) async {
    if (next.isAuthenticated) {
      await onAuthenticated();
      await flushPendingNavigation();
      return;
    }

    if (previous?.isAuthenticated == true) {
      await _refreshSubscription?.cancel();
      _refreshSubscription = null;
      _lastRegisteredToken = null;
    }

    _pending = null;
  }

  Future<void> onAuthenticated() async {
    _startTokenRefreshListener();
    await registerCurrentTokenIfAuthorized();
  }

  void schedulePrompt(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!context.mounted) {
        return;
      }
      unawaited(maybeShowPrompt(context));
    });
  }

  Future<void> maybeShowPrompt(BuildContext context) async {
    if (_promptInFlight) {
      return;
    }

    final auth = _ref.read(authProvider);
    final userId = auth.user?.id?.trim();
    if (!auth.isAuthenticated || userId == null || userId.isEmpty) {
      return;
    }

    _promptInFlight = true;
    try {
      await onAuthenticated();

      if (await _service.isAuthorized()) {
        return;
      }

      if (await _storage.hasPromptBeenShown(userId)) {
        return;
      }

      await Future<void>.delayed(const Duration(milliseconds: 400));
      if (!context.mounted) {
        return;
      }

      final enabled = await showNotificationPermissionSheet(context);
      await _storage.markPromptShown(userId);

      if (enabled != true) {
        return;
      }

      final status = await _service.requestPermission();
      if (PushNotificationService.isGranted(status)) {
        await registerCurrentTokenIfAuthorized();
      }
    } catch (error, stackTrace) {
      debugPrint('[PushNotifications] prompt failed: $error');
      debugPrint('$stackTrace');
    } finally {
      _promptInFlight = false;
    }
  }

  Future<void> registerCurrentTokenIfAuthorized() async {
    try {
      if (!_ref.read(authProvider).isAuthenticated) {
        return;
      }
      if (!await _service.isAuthorized()) {
        return;
      }

      final token = await _service.getToken();
      await _registerToken(token);
    } catch (error) {
      debugPrint('[PushNotifications] token registration failed: $error');
    }
  }

  void _startTokenRefreshListener() {
    if (_refreshSubscription != null) {
      return;
    }

    _refreshSubscription = _service.onTokenRefresh.listen(
      (token) {
        unawaited(_registerToken(token));
      },
      onError: (Object error) {
        debugPrint('[PushNotifications] token refresh failed: $error');
      },
    );
  }

  Future<void> _registerToken(String? token) async {
    final trimmed = token?.trim();
    if (trimmed == null || trimmed.isEmpty) {
      return;
    }
    if (trimmed == _lastRegisteredToken) {
      return;
    }

    final auth = _ref.read(authProvider);
    if (!auth.isAuthenticated) {
      return;
    }

    final authToken = auth.token;
    if (authToken != null && authToken.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(authToken);
    }

    try {
      await _repository.registerDeviceToken(deviceToken: trimmed);
      _lastRegisteredToken = trimmed;
    } catch (error) {
      debugPrint('[PushNotifications] backend register failed: $error');
    }
  }

  Future<void> _consumeInitialMessage() async {
    try {
      final message = await _service.getInitialMessage();
      if (message == null) {
        return;
      }
      _handleOpenedMessage(message);
    } catch (error, stackTrace) {
      debugPrint('[PushNotifications] getInitialMessage failed: $error');
      debugPrint('$stackTrace');
    }
  }

  void _handleOpenedMessage(RemoteMessage message) {
    _handleOpenedData(
      PushNotificationNavigation.stringifyData(message.data),
      messageId: message.messageId,
      sentTime: message.sentTime,
    );
  }

  void _handleOpenedData(
    Map<String, String> data, {
    String? messageId,
    DateTime? sentTime,
  }) {
    final resolvedId = PushNotificationNavigation.messageKey(
      messageId: messageId,
      data: data,
      sentTime: sentTime,
    );

    if (_processedMessageIds.contains(resolvedId)) {
      return;
    }
    if (_pending?.messageId == resolvedId) {
      return;
    }

    final auth = _ref.read(authProvider);
    if (!auth.isInitializing && !auth.isAuthenticated) {
      _markProcessed(resolvedId);
      return;
    }

    _pending = _PendingPushNavigation(messageId: resolvedId, data: data);
    unawaited(flushPendingNavigation());
  }

  void _onRouterChanged() {
    unawaited(flushPendingNavigation());
  }

  Future<void> flushPendingNavigation() async {
    final pending = _pending;
    if (pending == null || _flushScheduled) {
      return;
    }

    final auth = _ref.read(authProvider);
    if (auth.isInitializing) {
      return;
    }

    if (!auth.isAuthenticated) {
      _markProcessed(pending.messageId);
      _pending = null;
      return;
    }

    _flushScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _flushScheduled = false;
      _tryNavigatePending();
    });
  }

  void _tryNavigatePending() {
    final pending = _pending;
    if (pending == null) {
      return;
    }

    final auth = _ref.read(authProvider);
    if (auth.isInitializing) {
      return;
    }

    if (!auth.isAuthenticated) {
      _markProcessed(pending.messageId);
      _pending = null;
      return;
    }

    final router = _ref.read(goRouterProvider);
    if (!_isRouterReadyForProtectedNavigation(router)) {
      return;
    }

    if (_processedMessageIds.contains(pending.messageId)) {
      _pending = null;
      return;
    }

    final role = auth.user?.role;
    final location = PushNotificationNavigation.resolveLocation(
      data: pending.data,
      role: role,
    );
    _markProcessed(pending.messageId);
    _pending = null;
    unawaited(_markOpenedNotificationRead(pending.data, role));

    if (location == null || location.isEmpty) {
      return;
    }

    final currentPath = _currentPath(router);
    final destinationPath = Uri.tryParse(location)?.path ?? location;
    if (currentPath == destinationPath) {
      return;
    }

    router.push(location);
  }

  Future<void> _markOpenedNotificationRead(
    Map<String, String> data,
    String? role,
  ) async {
    final type = PushNotificationNavigation.readData(data, const [
      'type',
    ]).toLowerCase();
    if (type == 'new_message') {
      return;
    }

    final notificationId = PushNotificationNavigation.readData(data, const [
      'notificationId',
      'notification_id',
    ]);
    if (notificationId.isEmpty) {
      return;
    }

    try {
      final normalizedRole = role?.trim().toLowerCase();
      if (normalizedRole == 'parent') {
        await _ref
            .read(parentNotificationsProvider.notifier)
            .markAsRead(notificationId);
        return;
      }
      if (normalizedRole == 'specialist' || normalizedRole == 'admin') {
        await _ref
            .read(specialistNotificationsProvider.notifier)
            .markAsRead(notificationId);
      }
    } catch (error) {
      debugPrint('[PushNotifications] mark-as-read failed: $error');
    }
  }

  bool _isRouterReadyForProtectedNavigation(GoRouter router) {
    final path = _currentPath(router);
    if (path.isEmpty ||
        path == AppRoutes.splash ||
        path == AppRoutes.login ||
        path == AppRoutes.signup ||
        path == AppRoutes.forgotPassword ||
        path == AppRoutes.resetPassword ||
        path == AppRoutes.verifyEmail) {
      return false;
    }

    return path == AppRoutes.dashboard ||
        RoleRouting.isProtectedDashboardRoute(path);
  }

  String _currentPath(GoRouter router) {
    return router.routerDelegate.currentConfiguration.uri.path;
  }

  void _markProcessed(String messageId) {
    _processedMessageIds.remove(messageId);
    _processedMessageIds.add(messageId);
    if (_processedMessageIds.length <= 32) {
      return;
    }
    _processedMessageIds.remove(_processedMessageIds.first);
  }
}

class _PendingPushNavigation {
  const _PendingPushNavigation({
    required this.messageId,
    required this.data,
  });

  final String messageId;
  final Map<String, String> data;
}
