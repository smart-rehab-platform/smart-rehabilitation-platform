import '../../../../l10n/app_localizations.dart';

String mapSpecialistPatientDetailsError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load patient details:')) {
    return l10n.specialistPatientDetailsLoadFailed(
      message.substring('Failed to load patient details:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistPatientDetailsSaveNoteError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Failed to save note') {
    return l10n.specialistPatientDetailsSaveNoteFailedGeneric;
  }
  if (message.startsWith('Failed to save note:')) {
    return l10n.specialistPatientDetailsSaveNoteFailed(
      message.substring('Failed to save note:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistPatientDetailsSaveDiagnosisError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Diagnosis title is required') {
    return l10n.specialistPatientDetailsDiagnosisTitleRequired;
  }
  if (message == 'Failed to save diagnosis') {
    return l10n.specialistPatientDetailsSaveDiagnosisFailedGeneric;
  }
  if (message.startsWith('Failed to save diagnosis:')) {
    return l10n.specialistPatientDetailsSaveDiagnosisFailed(
      message.substring('Failed to save diagnosis:'.length).trim(),
    );
  }
  return message;
}

String localizedTreatmentPlanStatus(AppLocalizations l10n, String status) {
  final normalized = status.trim().toLowerCase();
  return switch (normalized) {
    'active' => l10n.statusActive,
    'completed' => l10n.statusCompleted,
    'archived' => l10n.statusArchived,
    'inactive' => l10n.statusInactive,
    'pending' => l10n.statusPending,
    '' => status,
    _ => status[0].toUpperCase() + status.substring(1),
  };
}

String localizedExerciseStatusLabel(AppLocalizations l10n, String statusLabel) {
  final normalized = statusLabel.trim().toLowerCase();
  return switch (normalized) {
    'active' => l10n.statusActive,
    'inactive' => l10n.statusInactive,
    _ => statusLabel,
  };
}

String localizedReviewStatus(AppLocalizations l10n, String reviewStatus) {
  final normalized = reviewStatus.trim().toLowerCase();
  return switch (normalized) {
    'reviewed' => l10n.statusReviewed,
    'needs retry' => l10n.statusNeedsRetry,
    'needs_retry' => l10n.statusNeedsRetry,
    'pending' => l10n.statusPending,
    _ => reviewStatus,
  };
}

String localizedMediaTypeLabel(AppLocalizations l10n, String mediaTypeLabel) {
  if (mediaTypeLabel == '—') {
    return mediaTypeLabel;
  }
  return switch (mediaTypeLabel.trim().toLowerCase()) {
    'audio' => l10n.mediaTypeAudio,
    'video' => l10n.mediaTypeVideo,
    'image' => l10n.mediaTypeImage,
    _ => mediaTypeLabel,
  };
}

String localizedGoalTerm(AppLocalizations l10n, String term) {
  return switch (term.trim().toLowerCase()) {
    'short_term' => l10n.goalTermShortTerm,
    'long_term' => l10n.goalTermLongTerm,
    _ => term,
  };
}

String localizedFamilyPatternEvidenceLabel(
  AppLocalizations l10n,
  String level,
) {
  return switch (level.trim().toUpperCase()) {
    'HIGH' => l10n.specialistFamilyPatternEvidenceHigh,
    'MODERATE' => l10n.specialistFamilyPatternEvidenceModerate,
    'LOW' => l10n.specialistFamilyPatternEvidenceLow,
    _ => l10n.specialistFamilyPatternEvidenceLow,
  };
}

String localizedFamilyPatternEvidenceSemanticLabel(
  AppLocalizations l10n,
  String level,
) {
  return switch (level.trim().toUpperCase()) {
    'HIGH' => l10n.specialistFamilyPatternEvidenceSemanticHigh,
    'MODERATE' => l10n.specialistFamilyPatternEvidenceSemanticModerate,
    'LOW' => l10n.specialistFamilyPatternEvidenceSemanticLow,
    _ => l10n.specialistFamilyPatternEvidenceSemanticLow,
  };
}

String localizedFamilyPatternScoreCaption(AppLocalizations l10n, String level) {
  return switch (level.trim().toUpperCase()) {
    'HIGH' => l10n.specialistFamilyPatternScoreCaptionHigh,
    'MODERATE' => l10n.specialistFamilyPatternScoreCaptionModerate,
    'LOW' => l10n.specialistFamilyPatternScoreCaptionLow,
    _ => l10n.specialistFamilyPatternScoreCaptionLow,
  };
}

String localizedFamilyPatternType(AppLocalizations l10n, String type) {
  return switch (type) {
    'shared_diagnosis' => l10n.specialistFamilyPatternSharedDiagnosis,
    'shared_case_category' => l10n.specialistFamilyPatternSharedCaseCategory,
    'shared_difficulties' => l10n.specialistFamilyPatternObservedDifficulties,
    'previous_diagnosis_similarity' =>
      l10n.specialistFamilyPatternPreviousDiagnosis,
    'family_history_similarity' => l10n.specialistFamilyPatternFamilyHistory,
    _ => l10n.specialistFamilyPatternRepeatedCharacteristic,
  };
}

String localizedFamilyPatternMatchedChildrenLabel(
  AppLocalizations l10n,
  int count,
) {
  if (count == 1) {
    return l10n.specialistFamilyPatternMatchedChildrenOne(count);
  }
  return l10n.specialistFamilyPatternMatchedChildrenMany(count);
}

String localizedFamilyPatternHiddenMatchesNotice(
  AppLocalizations l10n,
  int count,
) {
  if (count == 1) {
    return l10n.specialistFamilyPatternHiddenMatchesOne;
  }
  return l10n.specialistFamilyPatternHiddenMatchesMany(count);
}
