import '../models/parent_dashboard_models.dart';
import '../models/specialist_feature_models.dart';

bool isNewMessageNotificationType(String? type) {
  return type?.trim().toLowerCase() == 'new_message';
}

bool matchesUnreadConversationMessageNotification({
  required String conversationId,
  required String? type,
  required String? relatedEntityType,
  required String? relatedEntityId,
  required bool isRead,
}) {
  if (isRead) {
    return false;
  }
  if (!isNewMessageNotificationType(type)) {
    return false;
  }
  if (relatedEntityType?.trim().toLowerCase() != 'conversation') {
    return false;
  }

  final entityId = relatedEntityId?.trim();
  if (entityId == null || entityId.isEmpty) {
    return false;
  }

  return entityId == conversationId.trim();
}

int countUnreadParentMessageNotifications(List<ParentNotificationItem> items) {
  return items
      .where((item) => !item.isRead && isNewMessageNotificationType(item.type))
      .length;
}

int countUnreadSpecialistMessageNotifications(
  List<SpecialistNotificationItem> items,
) {
  return items
      .where((item) => !item.isRead && isNewMessageNotificationType(item.type))
      .length;
}
