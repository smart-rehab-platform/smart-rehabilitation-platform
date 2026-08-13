import '../../../l10n/app_localizations.dart';
import '../models/complaint_models.dart';

String localizedComplaintCategoryLabel(
  AppLocalizations l10n,
  ComplaintCategory category,
) {
  return switch (category) {
    ComplaintCategory.specialistNotResponding =>
      l10n.complaintCategorySpecialistNotResponding,
    ComplaintCategory.poorFollowUp => l10n.complaintCategoryPoorFollowUp,
    ComplaintCategory.repeatedSessionCancellations =>
      l10n.complaintCategoryRepeatedSessionCancellations,
    ComplaintCategory.delayedExerciseFeedback =>
      l10n.complaintCategoryDelayedExerciseFeedback,
    ComplaintCategory.inappropriateCommunication =>
      l10n.complaintCategoryInappropriateCommunication,
    ComplaintCategory.other => l10n.complaintCategoryOther,
  };
}

String localizedComplaintStatusLabel(
  AppLocalizations l10n,
  ComplaintStatus status,
) {
  return switch (status) {
    ComplaintStatus.pending => l10n.complaintStatusPending,
    ComplaintStatus.underReview => l10n.complaintStatusUnderReview,
    ComplaintStatus.resolved => l10n.complaintStatusResolved,
    ComplaintStatus.rejected => l10n.complaintStatusRejected,
  };
}

String mapParentComplaintSubmitError(AppLocalizations l10n, String message) {
  if (message == 'duplicate_active_complaint') {
    return l10n.complaintFormDuplicateActiveError;
  }
  if (message == 'submit_failed') {
    return l10n.complaintFormSubmitFailed;
  }
  if (message.contains('not assigned')) {
    return l10n.complaintFormSpecialistNotAssigned;
  }
  if (message.contains('not authorized')) {
    return l10n.complaintFormChildNotAuthorized;
  }
  return message;
}

String mapAdminComplaintError(AppLocalizations l10n, String message) {
  if (message.contains('invalid_status_transition')) {
    return l10n.adminComplaintInvalidTransition;
  }
  if (message.contains('Complaint not found')) {
    return l10n.complaintDetailsNotFound;
  }
  return message;
}
