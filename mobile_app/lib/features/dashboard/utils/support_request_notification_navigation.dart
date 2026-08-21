import '../../../core/notifications/push_notification_navigation.dart';
import '../../dashboard/models/specialist_feature_models.dart';

bool isSupportRequestNotification(SpecialistNotificationItem item) {
  return item.relatedEntityType?.trim().toLowerCase() == 'support_request';
}

String? resolveSupportRequestNotificationDestination(
  SpecialistNotificationItem item, {
  required bool isAdmin,
}) {
  return PushNotificationNavigation.resolveSpecificLocation(
    data: PushNotificationNavigation.dataFromFields(
      type: item.type,
      relatedEntityType: item.relatedEntityType,
      relatedEntityId: item.relatedEntityId,
    ),
    role: isAdmin ? 'admin' : 'specialist',
  );
}
