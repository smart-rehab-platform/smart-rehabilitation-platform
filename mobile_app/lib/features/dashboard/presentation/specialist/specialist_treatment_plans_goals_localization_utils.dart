import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_edit_treatment_plan_models.dart';
import '../../models/specialist_goals_models.dart';
import 'specialist_patient_details_localization_utils.dart';

String mapSpecialistCreateTreatmentPlanError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Failed to create treatment plan. Please try again.') {
    return l10n.specialistTreatmentPlanCreateFailed;
  }
  return mapSpecialistTreatmentPlanValidation(l10n, message);
}

String mapSpecialistEditTreatmentPlanLoadError(
  AppLocalizations l10n,
  String message,
) {
  if (message.startsWith('Failed to load treatment plan:')) {
    return l10n.specialistTreatmentPlanLoadFailed(
      message.substring('Failed to load treatment plan:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistEditTreatmentPlanSaveError(
  AppLocalizations l10n,
  String message,
) {
  if (message == 'Failed to save treatment plan. Please try again.') {
    return l10n.specialistTreatmentPlanSaveFailed;
  }
  return mapSpecialistTreatmentPlanValidation(l10n, message);
}

String mapSpecialistGoalsLoadError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load goals:')) {
    return l10n.specialistGoalsLoadFailed(
      message.substring('Failed to load goals:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to refresh goals:')) {
    return l10n.specialistGoalsRefreshFailed(
      message.substring('Failed to refresh goals:'.length).trim(),
    );
  }
  return message;
}

String mapSpecialistGoalsActionError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to create goal:')) {
    return l10n.specialistGoalsCreateFailed(
      message.substring('Failed to create goal:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to update goal:')) {
    return l10n.specialistGoalsUpdateFailed(
      message.substring('Failed to update goal:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to update progress:')) {
    return l10n.specialistGoalsProgressUpdateFailed(
      message.substring('Failed to update progress:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to archive goal:')) {
    return l10n.specialistGoalsArchiveFailed(
      message.substring('Failed to archive goal:'.length).trim(),
    );
  }
  return mapSpecialistGoalsValidation(l10n, message);
}

String mapSpecialistTreatmentPlanValidation(
  AppLocalizations l10n,
  String message,
) {
  return switch (message) {
    'Patient is required' => l10n.specialistTreatmentPlanPatientRequired,
    'Plan title is required' => l10n.specialistTreatmentPlanTitleRequired,
    'Start date is required' => l10n.specialistTreatmentPlanStartDateRequired,
    'End date cannot be before start date' =>
      l10n.specialistTreatmentPlanEndDateBeforeStart,
    'Please wait…' => l10n.commonPleaseWait,
    _ => message,
  };
}

String mapSpecialistGoalsValidation(AppLocalizations l10n, String message) {
  return switch (message) {
    'No active treatment plan found' => l10n.specialistGoalsNoActivePlan,
    'No active treatment plan found for this patient.' =>
      l10n.specialistGoalsNoActivePlanForPatient,
    'Goal title is required' => l10n.specialistGoalsTitleRequired,
    'Target value must be a number' =>
      l10n.specialistGoalsTargetValueMustBeNumber,
    'Enter a progress value between 0 and 100' =>
      l10n.specialistGoalsProgressRangeValidation,
    'Progress must be between 0 and 100' =>
      l10n.specialistGoalsProgressRangeProvider,
    _ => message,
  };
}

String localizedTreatmentPlanStatusEnum(
  AppLocalizations l10n,
  TreatmentPlanStatus status,
) {
  return localizedTreatmentPlanStatus(l10n, status.apiValue);
}

String localizedGoalTermEnum(AppLocalizations l10n, GoalTerm term) {
  return localizedGoalTerm(l10n, term.apiValue);
}
