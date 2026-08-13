import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_exercise_review_models.dart';
import 'specialist_patient_details_localization_utils.dart';

String mapSpecialistExerciseReviewError(AppLocalizations l10n, String message) {
  if (message == 'Submission not found.' ||
      message == 'Exception: Submission not found') {
    return l10n.specialistReviewSubmissionNotFound;
  }
  if (message == 'Please sign in to submit a review.') {
    return l10n.specialistReviewSignInRequired;
  }
  if (message.startsWith('Failed to load submission:')) {
    return l10n.specialistReviewLoadFailed(
      message.substring('Failed to load submission:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to submit review:')) {
    return l10n.specialistReviewSubmitFailed(
      message.substring('Failed to submit review:'.length).trim(),
    );
  }
  return message;
}

String localizedSubmissionStatus(AppLocalizations l10n, String status) {
  return switch (status.trim().toLowerCase()) {
    'reviewed' => l10n.statusReviewed,
    'needs_retry' => l10n.statusNeedsRetry,
    'pending' => l10n.statusPending,
    _ => status,
  };
}

String localizedReviewDecision(AppLocalizations l10n, ReviewDecision decision) {
  return switch (decision) {
    ReviewDecision.approved => l10n.statusApproved,
    ReviewDecision.needsRetry => l10n.statusNeedsRetry,
  };
}

String localizedPendingReviewPriority(AppLocalizations l10n, String priority) {
  return switch (priority.trim().toLowerCase()) {
    'high' => l10n.priorityHigh,
    'medium' => l10n.priorityMedium,
    _ => priority,
  };
}

String localizedSubmissionMediaTypeLabel(
  AppLocalizations l10n,
  String mediaType,
) {
  return localizedMediaTypeLabel(l10n, mediaType);
}
