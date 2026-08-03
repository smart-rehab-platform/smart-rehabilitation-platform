import '../../../l10n/app_localizations.dart';
import 'specialist_case_intake_localization_utils.dart';

export 'specialist_case_intake_localization_utils.dart'
    show
        formatSpecialistCaseIntakeAge,
        localizedBooleanYesNo,
        localizedCaseIntakeAttachmentTypeLabel,
        localizedCaseIntakeGenderFromApi,
        localizedCaseIntakePreferredContactPeriod,
        localizedCaseIntakeStatusLabel,
        localizedSpecialistCaseAttachmentCountLabel,
        mapSpecialistCaseRequestDetailError;

String mapAdminCaseInboxError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load case requests:')) {
    return l10n.parentCaseRequestsLoadFailed(
      message.substring('Failed to load case requests:'.length).trim(),
    );
  }
  return message;
}

String mapAdminCaseRequestDetailError(AppLocalizations l10n, String message) {
  return mapSpecialistCaseRequestDetailError(l10n, message);
}

String mapAdminMatchingSpecialistsError(AppLocalizations l10n, String message) {
  if (message == 'Case request not found.') {
    return l10n.parentCaseRequestDetailsNotFound;
  }
  if (message.startsWith('Failed to load matching specialists:')) {
    return l10n.adminCaseAssignmentLoadFailed(
      message.substring('Failed to load matching specialists:'.length).trim(),
    );
  }
  return message;
}

String mapAdminMatchingSpecialistsAssignError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Assignment already in progress.') {
    return l10n.adminCaseAssignmentInProgress;
  }
  if (message == 'Select a specialist to continue.') {
    return l10n.adminCaseAssignmentSelectSpecialist;
  }
  if (message == 'Failed to assign specialist. Please try again.') {
    return l10n.adminCaseAssignmentFailed;
  }
  if (message.trim().toLowerCase() ==
      'only pending case requests can be assigned') {
    return l10n.adminCaseAssignmentOnlyPending;
  }
  return mapAdminMatchingSpecialistsError(l10n, message);
}

String adminCaseTimelineStepLabel(AppLocalizations l10n, String step) {
  return switch (step) {
    'submitted' => l10n.parentCaseRequestDetailsProgressStepSubmitted,
    'assigned' => l10n.specialistCaseRequestDetailsTimelineAssigned,
    'underAssessment' =>
      l10n.specialistCaseRequestDetailsTimelineUnderAssessment,
    'accepted' => l10n.specialistCaseRequestDetailsTimelineAccepted,
    'converted' => l10n.specialistCaseRequestDetailsTimelineConverted,
    _ => step,
  };
}

String formatAdminMatchingSpecialistYears(AppLocalizations l10n, int? years) {
  if (years == null) {
    return l10n.adminMatchingSpecialistsYearsUnknown;
  }
  if (years == 1) {
    return l10n.adminMatchingSpecialistsOneYear;
  }
  return l10n.adminMatchingSpecialistsYears(years);
}

String formatAdminMatchingSpecialistActivePatients(
  AppLocalizations l10n,
  int count,
) {
  if (count == 1) {
    return l10n.adminMatchingSpecialistsOneActivePatient;
  }
  return l10n.adminMatchingSpecialistsActivePatients(count);
}

String formatAdminMatchingSpecialistCurrentRequests(
  AppLocalizations l10n,
  int count,
) {
  if (count == 1) {
    return l10n.adminMatchingSpecialistsOneCurrentRequest;
  }
  return l10n.adminMatchingSpecialistsCurrentRequests(count);
}
