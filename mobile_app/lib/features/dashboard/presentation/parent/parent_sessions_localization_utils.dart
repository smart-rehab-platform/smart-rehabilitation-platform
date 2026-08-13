import '../../../../l10n/app_localizations.dart';
import '../../models/parent_dashboard_models.dart';
import '../../models/session_requests_models.dart';

export '../specialist/specialist_scoped_localization_utils.dart'
    show localizedSessionRequestReason, localizedSessionRequestStatus;
export '../specialist/specialist_sessions_localization_utils.dart'
    show formatSessionDurationValue, localizedPreferredTimePeriod;

String mapParentSessionsError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to view sessions.') {
    return l10n.parentSessionsSignInRequired;
  }
  if (message.startsWith('Failed to load sessions:')) {
    return l10n.parentSessionsLoadFailed(
      message.substring('Failed to load sessions:'.length).trim(),
    );
  }
  return message;
}

String mapParentSessionRequestsError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to view session requests.') {
    return l10n.parentSessionRequestSignInRequired;
  }
  if (message.startsWith('Failed to load session requests:')) {
    return l10n.parentSessionRequestLoadFailed(
      message.substring('Failed to load session requests:'.length).trim(),
    );
  }
  return message;
}

String mapParentSessionRequestLoadChildrenError(
  AppLocalizations l10n,
  String message,
) {
  if (message.startsWith('Failed to load children:')) {
    return l10n.parentSessionRequestLoadChildrenFailed(
      message.substring('Failed to load children:'.length).trim(),
    );
  }
  return message;
}

String mapParentSessionRequestSubmitError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'A submission is already in progress.') {
    return l10n.parentSessionRequestSubmitInProgress;
  }
  if (message.startsWith('Failed to submit session request:')) {
    return l10n.parentSessionRequestSubmitFailed(
      message.substring('Failed to submit session request:'.length).trim(),
    );
  }
  return mapParentSessionRequestsError(l10n, message);
}

String? mapParentSessionRequestValidationError(
  AppLocalizations l10n,
  String message,
) {
  return switch (message) {
    'Please select a child.' => l10n.parentSessionRequestSelectChild,
    'No specialist is assigned to this child.' =>
      l10n.parentSessionRequestNoSpecialistForSubmit,
    'Please select a reason.' => l10n.parentSessionRequestSelectReason,
    'Please enter the other reason.' =>
      l10n.parentSessionRequestEnterOtherReason,
    'Please select a preferred date.' =>
      l10n.parentSessionRequestSelectPreferredDate,
    'Please select a preferred time.' =>
      l10n.parentSessionRequestSelectPreferredTime,
    _ => null,
  };
}

String localizedParentSessionRequestValidationError(
  AppLocalizations l10n,
  String message,
) {
  return mapParentSessionRequestValidationError(l10n, message) ?? message;
}

String localizedParentSessionStatusLabel(
  AppLocalizations l10n,
  String? status,
) {
  return switch (status?.toLowerCase().trim()) {
    'completed' => l10n.statusCompleted,
    'cancelled' => l10n.statusCancelled,
    'canceled' => l10n.statusCancelled,
    'no_show' => l10n.statusMissed,
    'in_progress' => l10n.statusInProgress,
    'scheduled' => l10n.statusScheduled,
    _ => l10n.statusScheduled,
  };
}

String localizedParentSessionLocationLabel(
  AppLocalizations l10n,
  ParentSessionItem session,
) {
  final location = session.locationOrLink?.trim();
  if (location == null || location.isEmpty) {
    return l10n.parentSessionsLocationPending;
  }
  final lower = location.toLowerCase();
  if (lower.contains('meet') ||
      lower.contains('online') ||
      lower.contains('zoom') ||
      lower.contains('http') ||
      lower.contains('teams') ||
      lower.contains('link')) {
    if (lower.contains('meet')) {
      return l10n.parentSessionsOnlineGoogleMeet;
    }
    return l10n.parentSessionsOnlineVideoSession;
  }
  return location;
}

bool parentSessionIsOnline(ParentSessionItem session) {
  final location = session.locationOrLink?.toLowerCase().trim() ?? '';
  if (location.isEmpty) {
    return false;
  }
  return location.contains('meet') ||
      location.contains('online') ||
      location.contains('zoom') ||
      location.contains('http') ||
      location.contains('teams') ||
      location.contains('link');
}

String localizedSessionRequestReasonValue(
  AppLocalizations l10n,
  SessionRequestReason reason,
) {
  return switch (reason) {
    SessionRequestReason.regularFollowUp =>
      l10n.specialistSessionRequestRegularFollowUp,
    SessionRequestReason.replacementCancelled =>
      l10n.specialistSessionRequestReplacementCancelled,
    SessionRequestReason.replacementMissed =>
      l10n.specialistSessionRequestReplacementMissed,
    SessionRequestReason.additionalSession =>
      l10n.specialistSessionRequestAdditionalSession,
    SessionRequestReason.consultation =>
      l10n.specialistSessionRequestConsultation,
    SessionRequestReason.other => l10n.specialistSessionRequestOther,
  };
}
