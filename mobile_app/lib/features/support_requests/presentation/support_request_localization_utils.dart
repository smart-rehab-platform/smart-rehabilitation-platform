import '../../../l10n/app_localizations.dart';
import '../models/support_request_models.dart';

String localizedSupportRequestCategoryLabel(
  AppLocalizations l10n,
  SupportRequestCategory category,
) {
  return switch (category) {
    SupportRequestCategory.technicalIssue =>
      l10n.supportRequestCategoryTechnicalIssue,
    SupportRequestCategory.patientCaseIssue =>
      l10n.supportRequestCategoryPatientCaseIssue,
    SupportRequestCategory.sessionSchedulingIssue =>
      l10n.supportRequestCategorySessionSchedulingIssue,
    SupportRequestCategory.accountProfileIssue =>
      l10n.supportRequestCategoryAccountProfileIssue,
    SupportRequestCategory.exerciseContentIssue =>
      l10n.supportRequestCategoryExerciseContentIssue,
    SupportRequestCategory.other => l10n.supportRequestCategoryOther,
  };
}

String localizedSupportRequestStatusLabel(
  AppLocalizations l10n,
  SupportRequestStatus status,
) {
  return switch (status) {
    SupportRequestStatus.pending => l10n.supportRequestStatusPending,
    SupportRequestStatus.inProgress => l10n.supportRequestStatusInProgress,
    SupportRequestStatus.resolved => l10n.supportRequestStatusResolved,
  };
}

String mapSupportRequestError(AppLocalizations l10n, String message) {
  final normalized = message.toLowerCase();
  if (normalized.contains('request_resolved') ||
      normalized.contains('resolved support request')) {
    return l10n.supportRequestErrorResolved;
  }
  if (normalized.contains('not found')) {
    return l10n.supportRequestErrorNotFound;
  }
  if (normalized.contains('not authorized') || normalized.contains('403')) {
    return l10n.supportRequestErrorForbidden;
  }
  if (normalized.contains('attachment')) {
    return l10n.supportRequestAttachmentUploadFailed;
  }
  return message;
}

String? validateSupportRequestAttachment({
  required AppLocalizations l10n,
  required String filename,
  required int byteLength,
}) {
  final lower = filename.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  final hasAllowedExtension = allowedExtensions.any(lower.endsWith);
  if (!hasAllowedExtension) {
    return l10n.supportRequestAttachmentInvalidType;
  }
  if (byteLength > supportRequestAttachmentMaxBytes) {
    return l10n.supportRequestAttachmentTooLarge;
  }
  return null;
}
