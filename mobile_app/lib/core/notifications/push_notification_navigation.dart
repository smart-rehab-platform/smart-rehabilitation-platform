import '../routes/app_routes.dart';

/// Maps notification payloads to existing GoRouter locations.
///
/// Used by FCM tap handling and in-app notification taps so both share one map.
class PushNotificationNavigation {
  PushNotificationNavigation._();

  static String messageKey({
    required String? messageId,
    required Map<String, String> data,
    DateTime? sentTime,
  }) {
    final id = messageId?.trim();
    if (id != null && id.isNotEmpty) {
      return id;
    }

    final type = readData(data, const ['type']);
    final entityId = readData(data, const [
      'relatedEntityId',
      'related_entity_id',
    ]);
    final sent = sentTime?.millisecondsSinceEpoch.toString() ?? '';
    return '$type|$entityId|$sent';
  }

  static Map<String, String> stringifyData(Map<String, dynamic> data) {
    final result = <String, String>{};
    data.forEach((key, value) {
      if (value == null) {
        return;
      }
      final asString = value.toString().trim();
      if (asString.isEmpty) {
        return;
      }
      result[key] = asString;
    });
    return result;
  }

  static Map<String, String> dataFromFields({
    String? type,
    String? relatedEntityType,
    String? relatedEntityId,
    String? notificationId,
  }) {
    return stringifyData({
      'type': type,
      'relatedEntityType': relatedEntityType,
      'relatedEntityId': relatedEntityId,
      'notificationId': notificationId,
    });
  }

  /// Specific deep link only. Returns null when the role has no safe destination.
  static String? resolveSpecificLocation({
    required Map<String, String> data,
    required String? role,
  }) {
    final normalizedRole = role?.trim().toLowerCase();
    if (normalizedRole == null || normalizedRole.isEmpty) {
      return null;
    }

    final type = readData(data, const ['type']).toLowerCase();
    final entityType = readData(data, const [
      'relatedEntityType',
      'related_entity_type',
    ]).toLowerCase();
    final entityId = readData(data, const [
      'relatedEntityId',
      'related_entity_id',
    ]);

    if (type == 'new_message') {
      return _newMessageLocation(role: normalizedRole, entityType: entityType, entityId: entityId);
    }

    if (_isSupportRequest(type: type, entityType: entityType)) {
      return _supportRequestLocation(role: normalizedRole, entityId: entityId);
    }

    if (type == 'case_request_converted' && entityType == 'patient') {
      return _patientLocation(role: normalizedRole, entityId: entityId);
    }

    if (_isCaseIntakeRequest(type: type, entityType: entityType)) {
      return _caseRequestLocation(role: normalizedRole, entityId: entityId);
    }

    if (_isComplaint(type: type, entityType: entityType)) {
      return _complaintLocation(role: normalizedRole, entityId: entityId);
    }

    if (entityType == 'patient') {
      return _patientLocation(role: normalizedRole, entityId: entityId);
    }

    if (entityType == 'report' || type == 'report_ready') {
      return _reportLocation(normalizedRole);
    }

    if (entityType == 'session' || type == 'session_reminder') {
      return _sessionLocation(role: normalizedRole, entityId: entityId);
    }

    if (entityType == 'exercise_review' || type == 'feedback_received') {
      return _feedbackLocation(normalizedRole);
    }

    return null;
  }

  /// Deep link, or the role's Notifications screen when no specific route exists.
  ///
  /// Returns null only when the role is unknown.
  static String? resolveLocation({
    required Map<String, String> data,
    required String? role,
  }) {
    return resolveSpecificLocation(data: data, role: role) ??
        notificationsFallback(role);
  }

  static String? notificationsFallback(String? role) {
    switch (role?.trim().toLowerCase()) {
      case 'parent':
        return AppRoutes.parentNotifications;
      case 'specialist':
        return AppRoutes.specialistNotifications;
      case 'admin':
        return AppRoutes.adminNotifications;
      default:
        return null;
    }
  }

  static String readData(Map<String, String> data, List<String> keys) {
    for (final key in keys) {
      final value = data[key]?.trim();
      if (value != null && value.isNotEmpty) {
        return value;
      }
    }
    return '';
  }

  static bool _isSupportRequest({
    required String type,
    required String entityType,
  }) {
    return entityType == 'support_request' ||
        type == 'support_request_submitted' ||
        type == 'support_request_reply' ||
        type == 'support_request_status_changed';
  }

  static bool _isCaseIntakeRequest({
    required String type,
    required String entityType,
  }) {
    return entityType == 'case_intake_request' ||
        type.startsWith('case_request_');
  }

  static bool _isComplaint({
    required String type,
    required String entityType,
  }) {
    return entityType == 'complaint' ||
        type == 'complaint_submitted' ||
        type == 'complaint_reviewed';
  }

  static String? _newMessageLocation({
    required String role,
    required String entityType,
    required String entityId,
  }) {
    final canOpenChat =
        entityId.isNotEmpty &&
        (entityType.isEmpty || entityType == 'conversation');
    if (!canOpenChat) {
      return null;
    }

    switch (role) {
      case 'parent':
        return AppRoutes.parentChat(entityId);
      case 'specialist':
        return AppRoutes.specialistChat(entityId);
      default:
        return null;
    }
  }

  static String? _supportRequestLocation({
    required String role,
    required String entityId,
  }) {
    if (entityId.isEmpty) {
      return null;
    }

    switch (role) {
      case 'specialist':
        return AppRoutes.specialistSupportRequestDetail(entityId);
      case 'admin':
        return AppRoutes.adminSupportRequestDetail(entityId);
      default:
        return null;
    }
  }

  static String? _caseRequestLocation({
    required String role,
    required String entityId,
  }) {
    if (entityId.isEmpty) {
      return null;
    }

    switch (role) {
      case 'parent':
        return AppRoutes.parentCaseRequestDetail(entityId);
      case 'specialist':
        return AppRoutes.specialistCaseRequestDetail(entityId);
      case 'admin':
        return AppRoutes.adminCaseRequestDetail(entityId);
      default:
        return null;
    }
  }

  static String? _patientLocation({
    required String role,
    required String entityId,
  }) {
    if (entityId.isEmpty) {
      return null;
    }

    switch (role) {
      case 'parent':
        return AppRoutes.parentChildDetail.replaceFirst(':childId', entityId);
      case 'specialist':
        return AppRoutes.specialistPatientDetails(entityId);
      case 'admin':
        return AppRoutes.adminPatientDetails(entityId);
      default:
        return null;
    }
  }

  static String? _complaintLocation({
    required String role,
    required String entityId,
  }) {
    if (entityId.isEmpty) {
      return null;
    }

    switch (role) {
      case 'parent':
        return AppRoutes.parentComplaintDetail(entityId);
      case 'admin':
        return AppRoutes.adminComplaintDetail(entityId);
      default:
        return null;
    }
  }

  static String? _reportLocation(String role) {
    switch (role) {
      case 'parent':
        return AppRoutes.parentReports;
      case 'specialist':
        return AppRoutes.specialistReports;
      case 'admin':
        return AppRoutes.adminReports;
      default:
        return null;
    }
  }

  static String? _sessionLocation({
    required String role,
    required String entityId,
  }) {
    switch (role) {
      case 'parent':
        return AppRoutes.parentSessions;
      case 'specialist':
        if (entityId.isEmpty) {
          return AppRoutes.specialistSessions;
        }
        return AppRoutes.specialistSessionDetails(entityId);
      case 'admin':
        return AppRoutes.adminSessions;
      default:
        return null;
    }
  }

  static String? _feedbackLocation(String role) {
    if (role == 'parent') {
      return AppRoutes.parentFeedback;
    }
    return null;
  }
}
