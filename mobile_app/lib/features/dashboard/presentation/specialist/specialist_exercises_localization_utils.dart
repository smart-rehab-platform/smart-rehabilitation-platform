import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';

String mapSpecialistExerciseDetailError(AppLocalizations l10n, String message) {
  if (message == 'Exercise not found.') {
    return l10n.specialistExerciseNotFound;
  }
  if (message == 'Failed to load exercise. Please try again.') {
    return l10n.specialistExerciseLoadFailed;
  }
  if (message == 'Failed to load exercise details.') {
    return l10n.specialistExerciseDetailsLoadFailed;
  }
  return message;
}

String mapSpecialistExerciseUpsertError(AppLocalizations l10n, String message) {
  if (message == 'Failed to save exercise. Please try again.') {
    return l10n.specialistExerciseSaveFailed;
  }
  return message;
}

String mapSpecialistExerciseUpsertCategoriesError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Failed to load categories. Please retry.') {
    return l10n.specialistExerciseCategoriesLoadFailed;
  }
  return message;
}

String mapSpecialistAssignExerciseError(AppLocalizations l10n, String message) {
  if (message == 'Failed to assign exercise. Please try again.') {
    return l10n.specialistAssignExerciseFailed;
  }
  if (message ==
      'Patient, treatment plan, and exercise are required to assign.') {
    return l10n.specialistAssignExerciseRequirementsMissing;
  }
  if (message == 'Due date cannot be before the start date.') {
    return l10n.specialistTreatmentPlanEndDateBeforeStart;
  }
  return message;
}

String mapSpecialistAssignedExerciseError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Assigned exercise not found.') {
    return l10n.specialistAssignedExerciseNotFound;
  }
  if (message == 'Failed to load assigned exercise.') {
    return l10n.specialistAssignedExerciseLoadFailed;
  }
  return message;
}

String localizedExerciseAssignmentFrequency(
  AppLocalizations l10n,
  ExerciseAssignmentFrequency frequency,
) {
  return switch (frequency) {
    ExerciseAssignmentFrequency.daily => l10n.exerciseFrequencyDaily,
    ExerciseAssignmentFrequency.weekly => l10n.exerciseFrequencyWeekly,
    ExerciseAssignmentFrequency.oneTime => l10n.exerciseFrequencyOneTime,
  };
}

String localizedExerciseAssignmentFrequencyValue(
  AppLocalizations l10n,
  String? frequency,
) {
  if (frequency == null || frequency.trim().isEmpty) {
    return frequency ?? '';
  }
  return switch (frequency.trim().toLowerCase()) {
    'daily' => l10n.exerciseFrequencyDaily,
    'weekly' => l10n.exerciseFrequencyWeekly,
    'one_time' => l10n.exerciseFrequencyOneTime,
    'monthly' => l10n.exerciseFrequencyMonthly,
    _ => frequency,
  };
}

String localizedExerciseLanguage(AppLocalizations l10n, String languageCode) {
  return switch (languageCode.trim().toLowerCase()) {
    'ar' => l10n.languageArabic,
    'en' => l10n.languageEnglish,
    _ => languageCode,
  };
}

String localizedExerciseLanguageLabel(
  AppLocalizations l10n,
  String languageLabel,
) {
  return switch (languageLabel.trim().toLowerCase()) {
    'arabic' => l10n.languageArabic,
    'english' => l10n.languageEnglish,
    _ => languageLabel,
  };
}
