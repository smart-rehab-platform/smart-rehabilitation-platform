import '../../../core/routes/app_routes.dart';
import '../../dashboard/models/specialist_feature_models.dart';

bool isSupportRequestNotification(SpecialistNotificationItem item) {
  return item.relatedEntityType?.trim().toLowerCase() == 'support_request';
}

String? resolveSupportRequestNotificationDestination(
  SpecialistNotificationItem item, {
  required bool isAdmin,
}) {
  if (!isSupportRequestNotification(item)) {
    return null;
  }

  final entityId = item.relatedEntityId?.trim();
  if (entityId == null || entityId.isEmpty) {
    return null;
  }

  return isAdmin
      ? AppRoutes.adminSupportRequestDetail(entityId)
      : AppRoutes.specialistSupportRequestDetail(entityId);
}
