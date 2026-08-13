import '../../../../l10n/app_localizations.dart';
import 'specialist_exercises_localization_utils.dart';

String mapSpecialistSpeechAnalysisError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to continue.') {
    return l10n.messageSignInRequired;
  }
  if (message == 'No submission selected for speech analysis.') {
    return l10n.specialistSpeechAnalysisNoSubmissionSelected;
  }
  if (message == 'Speech analysis could not be completed. Please try again.') {
    return l10n.specialistSpeechAnalysisAnalyzeFailed;
  }
  if (message == 'Failed to load speech analysis. Please try again.') {
    return l10n.specialistSpeechAnalysisLoadFailed;
  }
  if (message == 'You do not have permission to analyze this submission.') {
    return l10n.specialistSpeechAnalysisPermissionDenied;
  }
  if (message == 'No speech analysis is available for this submission yet.') {
    return l10n.specialistSpeechAnalysisNotAvailableYet;
  }
  if (message == 'The exercise submission could not be found.') {
    return l10n.specialistSpeechAnalysisSubmissionNotFound;
  }
  if (message ==
      'This submission does not contain a supported audio recording.') {
    return l10n.specialistSpeechAnalysisUnsupportedAudio;
  }
  if (message ==
      'The speech analysis service is currently unavailable. Please try again.') {
    return l10n.specialistSpeechAnalysisServiceUnavailable;
  }
  if (message ==
      'Unable to connect to the analysis service. Check your connection and try again.') {
    return l10n.specialistSpeechAnalysisConnectionFailed;
  }
  return message;
}

String mapSpecialistSpeechAnalysisSuccessMessage(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Existing speech analysis loaded.') {
    return l10n.specialistSpeechAnalysisExistingLoaded;
  }
  if (message == 'Speech analysis completed successfully.') {
    return l10n.specialistSpeechAnalysisCompletedSuccess;
  }
  return message;
}

String localizedSpeechAnalysisTrend(AppLocalizations l10n, String? trend) {
  return switch ((trend ?? '').trim().toLowerCase()) {
    'improvement' => l10n.clinicalTrendImproving,
    'regression' => l10n.specialistSpeechAnalysisTrendDeclining,
    'baseline' => l10n.specialistSpeechAnalysisTrendBaseline,
    'stable' => l10n.clinicalTrendStable,
    _ => trend ?? '—',
  };
}

String localizedSpeechAnalysisLanguage(AppLocalizations l10n, String language) {
  return localizedExerciseLanguageLabel(l10n, language);
}

String localizedSpeechAnalysisStatus(AppLocalizations l10n, String status) {
  return switch (status.trim().toLowerCase()) {
    'pending' => l10n.statusPending,
    'completed' => l10n.statusCompleted,
    'failed' => l10n.statusFailed,
    'uploaded' => l10n.specialistSpeechAnalysisSourceUploaded,
    'recorded' => l10n.specialistSpeechAnalysisSourceRecorded,
    _ => status,
  };
}
