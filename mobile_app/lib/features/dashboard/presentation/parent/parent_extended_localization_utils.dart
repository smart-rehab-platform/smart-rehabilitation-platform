import '../../../../l10n/app_localizations.dart';

export 'parent_scoped_localization_utils.dart'
    show localizedChildGender, localizedExerciseFrequency;
export 'parent_sessions_localization_utils.dart'
    show localizedParentSessionStatusLabel;

String mapParentChildDetailError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load child details:')) {
    return l10n.parentExerciseChildDetailsLoadFailed(
      message.substring('Failed to load child details:'.length).trim(),
    );
  }
  return message;
}

String mapParentExerciseSubmitError(AppLocalizations l10n, String message) {
  return switch (message) {
    'Failed to submit exercise. Please try again.' =>
      l10n.parentExerciseSubmitFailed,
    'You do not have permission to upload this file.' =>
      l10n.parentExerciseUploadPermissionDenied,
    'This file type is not supported.' =>
      l10n.parentExerciseUploadUnsupportedType,
    'The selected file is too large.' => l10n.parentExerciseUploadFileTooLarge,
    'Failed to upload media. Please try again.' =>
      l10n.parentExerciseUploadFailed,
    'Please sign in to upload this file.' =>
      l10n.parentExerciseUploadSignInRequired,
    _ => message,
  };
}

String localizedExerciseSubmissionStatus(
  AppLocalizations l10n,
  String? status,
) {
  return switch (status?.trim().toLowerCase()) {
    'pending' => l10n.statusPending,
    'reviewed' => l10n.statusReviewed,
    'needs_retry' => l10n.statusNeedsRetry,
    'completed' => l10n.statusCompleted,
    _ => status ?? l10n.statusPending,
  };
}

String localizedExerciseMediaTypeLabel(
  AppLocalizations l10n,
  String mediaType,
) {
  return switch (mediaType.trim().toLowerCase()) {
    'video' => l10n.communicationAttachmentTypeVideo,
    'audio' => l10n.communicationAttachmentTypeAudio,
    'image' => l10n.communicationAttachmentTypeImage,
    'file' => l10n.communicationAttachmentTypeFile,
    _ => l10n.parentMediaPhoto,
  };
}

String localizedTreatmentPlanStatus(AppLocalizations l10n, String? status) {
  return switch (status?.trim().toLowerCase()) {
    'completed' => l10n.statusCompleted,
    'archived' => l10n.parentFeedbackPlanStatusArchived,
    'active' => l10n.parentFeedbackPlanStatusActive,
    _ => l10n.parentFeedbackPlanStatusActive,
  };
}

String formatParentExerciseMediaAttachedLabel(
  AppLocalizations l10n,
  String mediaType,
) {
  return l10n.parentMediaAttached(
    localizedExerciseMediaTypeLabel(l10n, mediaType),
  );
}

List<String> localizedParentAiQuickPrompts(AppLocalizations l10n) {
  return [
    l10n.parentAiAssistantPromptExplainExercise,
    l10n.parentAiAssistantPromptSummarizeProgress,
    l10n.parentAiAssistantPromptFocusToday,
    l10n.parentAiAssistantPromptExplainReport,
  ];
}
