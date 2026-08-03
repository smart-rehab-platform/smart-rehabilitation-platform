import '../../../../l10n/app_localizations.dart';
import '../../models/session_requests_models.dart';
import '../../models/specialist_feature_models.dart';
import 'specialist_scoped_localization_utils.dart';

String mapSpecialistSessionDetailError(AppLocalizations l10n, String message) {
  if (message == 'Session details returned no data' ||
      message == 'Session details returned an invalid session' ||
      message == 'Session was not found.') {
    return l10n.specialistSessionNotFound;
  }
  if (message == 'Failed to load session details.') {
    return l10n.specialistSessionLoadFailed;
  }
  if (message == 'Please sign in to continue.') {
    return l10n.messageSignInRequired;
  }
  if (message == 'You do not have permission to manage this session.') {
    return l10n.specialistSessionPermissionDenied;
  }
  if (message ==
      'This session cannot be updated. Check the details and try again.') {
    return l10n.specialistSessionUpdateBlocked;
  }
  return message;
}

String mapSpecialistSessionActionError(AppLocalizations l10n, String message) {
  if (message == 'Failed to mark session completed.') {
    return l10n.specialistSessionCompleteFailed;
  }
  if (message == 'Failed to cancel session.') {
    return l10n.specialistSessionCancelFailed;
  }
  if (message == 'Failed to mark session as no show.') {
    return l10n.specialistSessionNoShowFailed;
  }
  if (message == 'Failed to update session.') {
    return l10n.specialistSessionUpdateFailed;
  }
  if (message == 'Failed to create session.') {
    return l10n.specialistSessionCreateFailed;
  }
  return mapSpecialistSessionDetailError(l10n, message);
}

String mapSpecialistSessionRequestActionError(
  AppLocalizations l10n,
  String message,
) {
  if (message.startsWith('Failed to approve session request:')) {
    return l10n.specialistSessionRequestApproveFailed(
      message.substring('Failed to approve session request:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to reject session request:')) {
    return l10n.specialistSessionRequestRejectFailed(
      message.substring('Failed to reject session request:'.length).trim(),
    );
  }
  return message;
}

String localizedPreferredTimePeriod(
  AppLocalizations l10n,
  PreferredTimePeriod? period,
) {
  if (period == null) {
    return '—';
  }
  return switch (period) {
    PreferredTimePeriod.morning =>
      l10n.specialistSessionRequestPreferredTimeMorning,
    PreferredTimePeriod.afternoon =>
      l10n.specialistSessionRequestPreferredTimeAfternoon,
    PreferredTimePeriod.evening =>
      l10n.specialistSessionRequestPreferredTimeEvening,
    PreferredTimePeriod.flexible =>
      l10n.specialistSessionRequestPreferredTimeFlexible,
  };
}

String localizedSessionStatusValue(AppLocalizations l10n, String status) {
  return switch (status.trim().toLowerCase()) {
    'scheduled' => l10n.statusScheduled,
    'completed' => l10n.statusCompleted,
    'cancelled' => l10n.statusCancelled,
    'canceled' => l10n.statusCancelled,
    'no_show' => l10n.statusNoShow,
    'no show' => l10n.statusNoShow,
    'missed' => l10n.statusNoShow,
    'in_progress' => l10n.statusInProgress,
    'in progress' => l10n.statusInProgress,
    _ => status,
  };
}

String localizedSessionTypeLabel(AppLocalizations l10n, String sessionType) {
  return switch (sessionType.trim().toLowerCase()) {
    'online' => l10n.clinicalSessionOnline,
    'in person' => l10n.clinicalSessionInPerson,
    'in_person' => l10n.clinicalSessionInPerson,
    'consultation' => l10n.specialistSessionRequestConsultation,
    'follow_up' => l10n.specialistSessionRequestRegularFollowUp,
    'follow-up' => l10n.specialistSessionRequestRegularFollowUp,
    'evaluation' => l10n.clinicalAssessment,
    _ => sessionType,
  };
}

String localizedSessionLockedMessage(
  AppLocalizations l10n,
  SessionDisplayStatus status,
) {
  return l10n.specialistSessionLockedCannotEdit(
    localizedSessionDisplayStatus(l10n, status),
  );
}

String formatSessionDurationLabel(AppLocalizations l10n, int minutes) {
  return l10n.specialistSessionDurationMinutes(minutes);
}

String formatSessionDurationValue(AppLocalizations l10n, int minutes) {
  return l10n.specialistSessionMinutesValue(minutes);
}
