import '../../../l10n/app_localizations.dart';
import '../../dashboard/models/session_requests_models.dart';
import '../../dashboard/presentation/specialist/specialist_sessions_localization_utils.dart';
import '../models/case_intake_request_model.dart';
import '../models/case_request_attachment_model.dart';

String mapParentCaseIntakeProviderError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to view case requests.') {
    return l10n.parentCaseRequestsSignInRequired;
  }
  if (message.startsWith('Failed to load case requests:')) {
    return l10n.parentCaseRequestsLoadFailed(
      message.substring('Failed to load case requests:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to refresh case requests:')) {
    return l10n.parentCaseRequestsRefreshFailed(
      message.substring('Failed to refresh case requests:'.length).trim(),
    );
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
  if (message.startsWith('Failed to upload child image:')) {
    return l10n.parentCaseRequestDetailsUploadChildImageFailed(
      message.substring('Failed to upload child image:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to submit case request:')) {
    return l10n.parentCaseRequestDetailsSubmitFailed(
      message.substring('Failed to submit case request:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to update case request:')) {
    return l10n.parentCaseRequestDetailsUpdateFailed(
      message.substring('Failed to update case request:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to upload attachment:')) {
    return l10n.parentCaseRequestDetailsUploadAttachmentFailed(
      message.substring('Failed to upload attachment:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to delete attachment:')) {
    return l10n.parentCaseRequestDetailsDeleteAttachmentFailed(
      message.substring('Failed to delete attachment:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to load categories:')) {
    return l10n.parentCaseRequestFormCategoriesLoadFailed(
      message.substring('Failed to load categories:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to refresh categories:')) {
    return l10n.parentCaseRequestFormCategoriesRefreshFailed(
      message.substring('Failed to refresh categories:'.length).trim(),
    );
  }
  return message;
}

String mapParentCaseIntakeFormLoadError(AppLocalizations l10n, String message) {
  if (message == 'Failed to load request for editing.') {
    return l10n.parentCaseRequestFormLoadFailed;
  }
  if (message == 'Only pending requests can be edited.') {
    return l10n.parentCaseRequestFormOnlyPendingEditable;
  }
  return mapParentCaseIntakeProviderError(l10n, message);
}

String mapParentCaseIntakeValidationMessage(
  AppLocalizations l10n,
  String message, {
  required int childNameMax,
  required int textMax,
}) {
  if (message == 'Child name is required.') {
    return l10n.parentCaseRequestFormValidationChildNameRequired;
  }
  if (message == 'Child name must not exceed $childNameMax characters.') {
    return l10n.parentCaseRequestFormValidationChildNameMax(childNameMax);
  }
  if (message == 'Date of birth is required.') {
    return l10n.parentCaseRequestFormValidationDobRequired;
  }
  if (message == 'Date of birth cannot be in the future.') {
    return l10n.parentCaseRequestFormValidationDobFuture;
  }
  if (message == 'Gender is required.') {
    return l10n.parentCaseRequestFormValidationGenderRequired;
  }
  if (message == 'Please select a case category.') {
    return l10n.parentCaseRequestFormValidationCategoryRequired;
  }
  if (message == 'Case description is required.') {
    return l10n.parentCaseRequestFormValidationDescriptionRequired;
  }
  if (message == 'Case description must not exceed $textMax characters.') {
    return l10n.parentCaseRequestFormValidationDescriptionMax(textMax);
  }
  if (message == 'Observed difficulties must not exceed $textMax characters.') {
    return l10n.parentCaseRequestFormValidationObservedMax(textMax);
  }
  if (message ==
      'Previous diagnosis details must not exceed $textMax characters.') {
    return l10n.parentCaseRequestFormValidationPreviousDiagnosisMax(textMax);
  }
  if (message ==
      'Current treatment details must not exceed $textMax characters.') {
    return l10n.parentCaseRequestFormValidationCurrentTreatmentMax(textMax);
  }
  if (message == 'Please choose a preferred contact period.') {
    return l10n.parentCaseRequestFormValidationContactPeriodRequired;
  }
  return message;
}

String localizedCaseIntakeStatusLabel(
  AppLocalizations l10n,
  CaseIntakeStatus? status,
) {
  if (status == null) {
    return l10n.caseIntakeStatusPending;
  }
  return switch (status) {
    CaseIntakeStatus.pending => l10n.caseIntakeStatusPending,
    CaseIntakeStatus.assigned => l10n.caseIntakeStatusAssigned,
    CaseIntakeStatus.underAssessment => l10n.caseIntakeStatusUnderAssessment,
    CaseIntakeStatus.accepted => l10n.caseIntakeStatusAccepted,
    CaseIntakeStatus.rejected => l10n.caseIntakeStatusRejected,
    CaseIntakeStatus.convertedToPatient =>
      l10n.caseIntakeStatusConvertedToPatient,
  };
}

String localizedCaseIntakeStatusSubtitle(
  AppLocalizations l10n,
  CaseIntakeStatus status,
) {
  return switch (status) {
    CaseIntakeStatus.pending => l10n.caseIntakeStatusPendingSubtitle,
    CaseIntakeStatus.assigned => l10n.caseIntakeStatusAssignedSubtitle,
    CaseIntakeStatus.underAssessment =>
      l10n.caseIntakeStatusUnderAssessmentSubtitle,
    CaseIntakeStatus.accepted => l10n.caseIntakeStatusAcceptedSubtitle,
    CaseIntakeStatus.rejected => l10n.caseIntakeStatusRejectedSubtitle,
    CaseIntakeStatus.convertedToPatient =>
      l10n.caseIntakeStatusConvertedToPatientSubtitle,
  };
}

String localizedCaseIntakeGender(
  AppLocalizations l10n,
  CaseIntakeGender? gender,
) {
  if (gender == null) {
    return l10n.parentCaseRequestFormNotSpecified;
  }
  return switch (gender) {
    CaseIntakeGender.male => l10n.fieldGenderMale,
    CaseIntakeGender.female => l10n.fieldGenderFemale,
  };
}

String localizedCaseIntakeGenderFromApi(AppLocalizations l10n, String? gender) {
  final parsed = CaseIntakeGender.fromApi(gender);
  if (parsed != null) {
    return localizedCaseIntakeGender(l10n, parsed);
  }
  if (gender?.trim().isNotEmpty == true) {
    return gender!.trim();
  }
  return l10n.specialistSessionNotProvided;
}

String localizedCaseIntakePreferredContactPeriod(
  AppLocalizations l10n,
  PreferredTimePeriod? period,
) {
  if (period == null) {
    return l10n.parentCaseRequestFormNotSelected;
  }
  return localizedPreferredTimePeriod(l10n, period);
}

String localizedBooleanYesNo(AppLocalizations l10n, bool value) {
  return value ? l10n.commonYes : l10n.commonNo;
}

List<String> parentCaseRequestFormStepLabels(AppLocalizations l10n) {
  return [
    l10n.parentCaseRequestFormStepChild,
    l10n.parentCaseRequestFormStepCategory,
    l10n.parentCaseRequestFormStepDescription,
    l10n.parentCaseRequestFormStepHistory,
    l10n.parentCaseRequestFormStepContact,
    l10n.parentCaseRequestFormStepReview,
  ];
}

List<String> parentCaseRequestProgressStepLabels(AppLocalizations l10n) {
  return [
    l10n.parentCaseRequestDetailsProgressStepSubmitted,
    l10n.parentCaseRequestDetailsProgressStepAdminReview,
    l10n.parentCaseRequestDetailsProgressStepSpecialistAssigned,
    l10n.parentCaseRequestDetailsProgressStepAssessment,
    l10n.parentCaseRequestDetailsProgressStepAccepted,
    l10n.parentCaseRequestDetailsProgressStepPatientProfileCreated,
  ];
}

String localizedCaseIntakeAttachmentTypeLabel(
  AppLocalizations l10n,
  CaseRequestAttachment attachment,
) {
  if (attachment.isImage) {
    return l10n.communicationAttachmentTypeImage;
  }
  if (attachment.isAudio) {
    return l10n.communicationAttachmentTypeAudio;
  }
  if (attachment.isVideo) {
    return l10n.communicationAttachmentTypeVideo;
  }
  if (attachment.isPdf) {
    return l10n.caseIntakeAttachmentPdf;
  }
  return attachment.fileType ?? l10n.communicationAttachmentTypeFile;
}
