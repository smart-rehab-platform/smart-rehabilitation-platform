import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import 'parent_features_provider.dart';
import 'specialist_features_provider.dart';

Future<void> ensureRoleNotificationsLoaded(WidgetRef ref) async {
  final role = ref.read(authProvider).user?.role?.toLowerCase();
  if (role == 'parent') {
    final notifications = ref.read(parentNotificationsProvider);
    if (notifications.items.isEmpty && !notifications.isLoading) {
      await ref.read(parentNotificationsProvider.notifier).initialize();
    }
    return;
  }

  if (role == 'specialist') {
    final notifications = ref.read(specialistNotificationsProvider);
    if (notifications.items.isEmpty && !notifications.isLoading) {
      await ref.read(specialistNotificationsProvider.notifier).initialize();
    }
  }
}

Future<Set<String>> markConversationMessageNotificationsRead(
  WidgetRef ref,
  String conversationId, {
  Set<String> skipIds = const {},
}) async {
  final role = ref.read(authProvider).user?.role?.toLowerCase();
  if (role == 'parent') {
    return ref
        .read(parentNotificationsProvider.notifier)
        .markUnreadConversationMessageNotificationsRead(
          conversationId,
          skipIds: skipIds,
        );
  }

  if (role == 'specialist') {
    return ref
        .read(specialistNotificationsProvider.notifier)
        .markUnreadConversationMessageNotificationsRead(
          conversationId,
          skipIds: skipIds,
        );
  }

  return skipIds;
}

Future<void> refreshRoleNotifications(WidgetRef ref) async {
  final role = ref.read(authProvider).user?.role?.toLowerCase();
  if (role == 'parent') {
    await ref.read(parentNotificationsProvider.notifier).refresh();
    return;
  }

  if (role == 'specialist') {
    await ref.read(specialistNotificationsProvider.notifier).refresh();
  }
}
