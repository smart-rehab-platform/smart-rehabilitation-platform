import '../../../../l10n/app_localizations.dart';
import '../../models/session_requests_models.dart';
import '../../models/specialist_feature_models.dart';
import '../../models/specialist_reports_models.dart';
import '../../providers/specialist_session_requests_provider.dart';
import 'treatment_plans_list_widgets.dart';

String mapSpecialistListError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to continue.') {
    return l10n.messageSignInRequired;
  }
  if (message.startsWith('Failed to load data:')) {
    return l10n.specialistLoadFailed(
      message.substring('Failed to load data:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistProgressError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to continue.') {
    return l10n.messageSignInRequired;
  }
  if (message.startsWith('Failed to load progress:')) {
    return l10n.specialistProgressLoadFailed(
      message.substring('Failed to load progress:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistExercisesError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load exercises:')) {
    return l10n.parentExercisesLoadFailed(
      message.substring('Failed to load exercises:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistNotificationsError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to view notifications.') {
    return l10n.parentNotificationsSignInRequired;
  }
  if (message.startsWith('Failed to load notifications:')) {
    return l10n.parentNotificationsLoadFailed(
      message.substring('Failed to load notifications:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistProfileError(AppLocalizations l10n, String message) {
  if (message == 'Not signed in') {
    return l10n.parentProfileNotSignedIn;
  }
  if (message.startsWith('Failed to load profile:')) {
    return l10n.parentProfileLoadFailed(
      message.substring('Failed to load profile:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistReportsError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load reports:')) {
    return l10n.specialistReportsLoadFailed(
      message.substring('Failed to load reports:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistAiReportGenerationError(
  AppLocalizations l10n,
  String message,
) {
  return switch (message) {
    'Patient is required.' => l10n.specialistAiReportPatientRequired,
    'Report type must be weekly or monthly.' => l10n.specialistAiReportTypeRequired,
    'Start date is required.' => l10n.specialistAiReportStartRequired,
    'End date is required.' => l10n.specialistAiReportEndRequired,
    'period_start cannot be after period_end' =>
      l10n.specialistAiReportStartAfterEnd,
    'Cannot generate report for a period that has not ended yet' =>
      l10n.specialistAiReportPeriodNotEnded,
    _ => message,
  };
}

String mapSpecialistRegularReportCreationError(
  AppLocalizations l10n,
  String message,
) {
  return switch (message) {
    'Patient is required.' => l10n.specialistAiReportPatientRequired,
    'report_type must be weekly, monthly, assessment, or progress' =>
      l10n.specialistRegularReportTypeRequired,
    'title must be 200 characters or fewer' =>
      l10n.specialistCreateReportTitleMaxLength,
    _ => message,
  };
}

String mapSpecialistSessionsError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to continue.') {
    return l10n.messageSignInRequired;
  }
  if (message.startsWith('Failed to load sessions:')) {
    return l10n.specialistSessionsLoadFailed(
      message.substring('Failed to load sessions:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistSessionRequestsError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Please sign in to view session requests.') {
    return l10n.specialistSessionRequestsSignInRequired;
  }
  if (message.startsWith('Failed to load session requests:')) {
    return l10n.specialistSessionRequestsLoadFailed(
      message.substring('Failed to load session requests:'.length).trim(),
    );
  }
  return message;
}

String localizedTreatmentPlanFilter(
  AppLocalizations l10n,
  TreatmentPlanListFilter filter,
) {
  return switch (filter) {
    TreatmentPlanListFilter.all => l10n.filterAll,
    TreatmentPlanListFilter.active => l10n.filterActive,
    TreatmentPlanListFilter.completed => l10n.statusCompleted,
    TreatmentPlanListFilter.archived => l10n.statusArchived,
  };
}

String localizedReportFilter(
  AppLocalizations l10n,
  SpecialistReportFilter filter,
) {
  return switch (filter) {
    SpecialistReportFilter.all => l10n.filterAll,
    SpecialistReportFilter.weekly => l10n.reportTypeWeekly,
    SpecialistReportFilter.monthly => l10n.reportTypeMonthly,
    SpecialistReportFilter.assessment => l10n.clinicalAssessment,
    SpecialistReportFilter.aiReports => l10n.reportTypeAiReports,
    SpecialistReportFilter.recent => l10n.filterRecent,
  };
}

String localizedSessionListFilter(
  AppLocalizations l10n,
  SessionListFilter filter,
) {
  return switch (filter) {
    SessionListFilter.all => l10n.filterAll,
    SessionListFilter.today => l10n.dateToday,
    SessionListFilter.upcoming => l10n.filterUpcoming,
    SessionListFilter.past => l10n.filterPast,
  };
}

String localizedSessionDisplayStatus(
  AppLocalizations l10n,
  SessionDisplayStatus status,
) {
  return switch (status) {
    SessionDisplayStatus.scheduled => l10n.statusScheduled,
    SessionDisplayStatus.completed => l10n.statusCompleted,
    SessionDisplayStatus.cancelled => l10n.statusCancelled,
    SessionDisplayStatus.noShow => l10n.statusNoShow,
  };
}

String localizedSessionRequestInboxFilter(
  AppLocalizations l10n,
  SessionRequestInboxFilter filter,
) {
  return switch (filter) {
    SessionRequestInboxFilter.all => l10n.filterAll,
    SessionRequestInboxFilter.pending => l10n.statusPending,
    SessionRequestInboxFilter.approved => l10n.statusApproved,
    SessionRequestInboxFilter.rejected => l10n.statusRejected,
  };
}

String localizedSessionRequestReason(
  AppLocalizations l10n,
  SessionRequestItem request,
) {
  if (request.reason == SessionRequestReason.other &&
      request.reasonOtherText != null &&
      request.reasonOtherText!.trim().isNotEmpty) {
    return request.reasonOtherText!.trim();
  }

  return switch (request.reason) {
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
    null => l10n.specialistSessionRequestDefault,
  };
}

String localizedSessionRequestStatus(
  AppLocalizations l10n,
  SessionRequestStatus? status,
) {
  return switch (status) {
    SessionRequestStatus.approved => l10n.statusApproved,
    SessionRequestStatus.rejected => l10n.statusRejected,
    SessionRequestStatus.pending => l10n.statusPending,
    null => l10n.statusPending,
  };
}

String localizedExerciseCategory(AppLocalizations l10n, String category) {
  if (category == 'All') {
    return l10n.filterAll;
  }
  return category;
}

String localizedCalendarSessionMode(
  AppLocalizations l10n,
  SpecialistSessionDetail session,
) {
  if (session.hasOnlineMeetingLink) {
    return l10n.clinicalSessionOnline;
  }

  final location = session.location?.trim();
  if (location != null && location.isNotEmpty) {
    return location;
  }

  return l10n.clinicalSessionInPerson;
}
