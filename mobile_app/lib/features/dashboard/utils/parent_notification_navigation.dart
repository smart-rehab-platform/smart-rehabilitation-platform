import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/notifications/push_notification_navigation.dart';
import '../../../core/routes/app_routes.dart';
import '../../case_intake/models/case_intake_request_model.dart';
import '../../case_intake/providers/parent_case_intake_provider.dart';
import '../models/parent_dashboard_models.dart';
import '../providers/parent_dashboard_provider.dart';

int countActiveParentCaseRequests(List<CaseIntakeRequest> requests) {
  return requests.where((request) {
    final status = request.status;
    return status != CaseIntakeStatus.convertedToPatient &&
        status != CaseIntakeStatus.rejected;
  }).length;
}

bool isCaseRequestNotification(ParentNotificationItem item) {
  final type = item.type?.trim().toLowerCase();
  if (type != null && type.startsWith('case_request_')) {
    return true;
  }

  final entityType = item.relatedEntityType?.trim().toLowerCase();
  return entityType == 'case_intake_request';
}

Future<String?> resolveParentNotificationDestination(
  WidgetRef ref,
  ParentNotificationItem item,
) async {
  final type = item.type?.trim().toLowerCase();
  final entityType = item.relatedEntityType?.trim().toLowerCase();
  final entityId = item.relatedEntityId?.trim();

  if (type == 'case_request_converted' &&
      entityType == 'patient' &&
      entityId != null &&
      entityId.isNotEmpty) {
    await ref.read(parentCaseIntakeProvider.notifier).refreshRequests();
    for (final request in ref.read(parentCaseIntakeProvider).requests) {
      if (request.patientId?.trim() == entityId) {
        return AppRoutes.parentCaseRequestDetail(request.id);
      }
    }

    await ref.read(parentDashboardProvider.notifier).refresh();
    return AppRoutes.parentChildDetail.replaceFirst(':childId', entityId);
  }

  return PushNotificationNavigation.resolveSpecificLocation(
    data: PushNotificationNavigation.dataFromFields(
      type: item.type,
      relatedEntityType: item.relatedEntityType,
      relatedEntityId: item.relatedEntityId,
    ),
    role: 'parent',
  );
}

Future<void> refreshParentDataAfterCaseNotification(WidgetRef ref) async {
  await Future.wait([
    ref.read(parentDashboardProvider.notifier).refresh(),
    ref.read(parentCaseIntakeProvider.notifier).refreshRequests(),
  ]);
}
