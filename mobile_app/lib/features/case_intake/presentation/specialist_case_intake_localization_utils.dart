import '../../../l10n/app_localizations.dart';
import '../models/case_intake_request_model.dart';
import 'parent_case_intake_localization_utils.dart';

export 'parent_case_intake_localization_utils.dart'
    show
        localizedBooleanYesNo,
        localizedCaseIntakeAttachmentTypeLabel,
        localizedCaseIntakeGender,
        localizedCaseIntakeGenderFromApi,
        localizedCaseIntakePreferredContactPeriod,
        localizedCaseIntakeStatusLabel,
        localizedCaseIntakeStatusSubtitle;

String mapSpecialistAssignedCasesError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load assigned case requests:')) {
    return l10n.specialistCaseRequestsLoadFailed(
      message.substring('Failed to load assigned case requests:'.length).trim(),
    );
  }
  return mapSpecialistCaseRequestDetailError(l10n, message);
}

String mapSpecialistCaseRequestDetailError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Case request not found.') {
    return l10n.parentCaseRequestDetailsNotFound;
  }
  if (message.startsWith('Failed to load case request:')) {
    return l10n.parentCaseRequestDetailsLoadFailed(
      message.substring('Failed to load case request:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to refresh case request:')) {
    return l10n.parentCaseRequestDetailsRefreshFailed(
      message.substring('Failed to refresh case request:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistCaseRequestActionError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Only assigned case requests can start assessment') {
    return l10n.specialistCaseAssessmentOnlyAssignedCanStart;
  }
  if (message == 'Only case requests under assessment can be accepted') {
    return l10n.specialistCaseAssessmentOnlyUnderAssessmentCanAccept;
  }
  if (message == 'Only assigned or under-assessment requests can be rejected') {
    return l10n.specialistCaseAssessmentOnlyAssignedOrUnderAssessmentCanReject;
  }
  if (message == 'This case request can no longer be rejected') {
    return l10n.specialistCaseAssessmentCannotRejectAnymore;
  }
  if (message == 'Failed to start assessment. Please try again.') {
    return l10n.specialistCaseAssessmentStartFailed;
  }
  if (message == 'Failed to update assessment notes. Please try again.') {
    return l10n.specialistCaseAssessmentSaveNotesFailed;
  }
  if (message == 'Failed to accept case request. Please try again.') {
    return l10n.specialistCaseAssessmentAcceptFailed;
  }
  if (message == 'Failed to reject case request. Please try again.') {
    return l10n.specialistCaseAssessmentRejectFailed;
  }
  return mapSpecialistCaseRequestDetailError(l10n, message);
}

String mapSpecialistCaseAssessmentNotesValidation(
  AppLocalizations l10n,
  String message, {
  required int maxLength,
}) {
  if (message == 'Assessment notes are required.') {
    return l10n.specialistCaseAssessmentNotesRequired;
  }
  if (message == 'Assessment notes must not exceed $maxLength characters.') {
    return l10n.specialistCaseAssessmentNotesMaxLength(maxLength);
  }
  return message;
}

String mapSpecialistCaseRejectReasonValidation(
  AppLocalizations l10n,
  String message, {
  required int minLength,
  required int maxLength,
}) {
  if (message == 'Reason for rejection is required.') {
    return l10n.specialistCaseAssessmentRejectReasonRequired;
  }
  if (message == 'Reason must be at least $minLength characters.') {
    return l10n.specialistCaseAssessmentRejectReasonMinLength(minLength);
  }
  if (message == 'Reason must not exceed $maxLength characters.') {
    return l10n.specialistCaseAssessmentRejectReasonMaxLength(maxLength);
  }
  return message;
}

String localizedSpecialistCaseIntakeStatusFilterLabel(
  AppLocalizations l10n,
  CaseIntakeStatus? status,
) {
  if (status == null) {
    return l10n.adminCaseRequestsAllStatuses;
  }
  if (status == CaseIntakeStatus.convertedToPatient) {
    return l10n.adminCaseRequestsConvertedToPatient;
  }
  return localizedCaseIntakeStatusLabel(l10n, status);
}

String localizedSpecialistCaseAttachmentCountLabel(
  AppLocalizations l10n,
  int count,
) {
  if (count == 1) {
    return l10n.specialistCaseRequestsOneAttachment;
  }
  return l10n.specialistCaseRequestsAttachmentCount(count);
}

String formatSpecialistCaseIntakeAge(
  AppLocalizations l10n,
  DateTime? dateOfBirth,
) {
  if (dateOfBirth == null) {
    return l10n.specialistCaseRequestDetailsAgeUnavailable;
  }
  final now = DateTime.now();
  final dob = DateTime(dateOfBirth.year, dateOfBirth.month, dateOfBirth.day);
  final today = DateTime(now.year, now.month, now.day);
  if (dob.isAfter(today)) {
    return l10n.specialistCaseRequestDetailsAgeUnavailable;
  }

  var years = today.year - dob.year;
  var months = today.month - dob.month;
  var days = today.day - dob.day;
  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) {
    return l10n.specialistCaseRequestDetailsAgeUnavailable;
  }
  if (years == 0) {
    if (months <= 0) {
      return l10n.specialistCaseRequestDetailsAgeUnderOneMonth;
    }
    if (months == 1) {
      return l10n.specialistCaseRequestDetailsAgeOneMonth;
    }
    return l10n.specialistCaseRequestDetailsAgeMonths(months);
  }
  if (years == 1) {
    return l10n.specialistCaseRequestDetailsAgeOneYear;
  }
  return l10n.specialistCaseRequestDetailsAgeYears(years);
}

String specialistCaseTimelineStepLabel(AppLocalizations l10n, String step) {
  return switch (step) {
    'assigned' => l10n.specialistCaseRequestDetailsTimelineAssigned,
    'underAssessment' =>
      l10n.specialistCaseRequestDetailsTimelineUnderAssessment,
    'accepted' => l10n.specialistCaseRequestDetailsTimelineAccepted,
    'converted' => l10n.specialistCaseRequestDetailsTimelineConverted,
    _ => step,
  };
}
