import '../../../../l10n/app_localizations.dart';
import '../../models/parent_dashboard_models.dart';

String mapParentProfileError(AppLocalizations l10n, String message) {
  if (message == 'Not signed in') {
    return l10n.parentProfileNotSignedIn;
  }
  if (message == 'Full name is required') {
    return l10n.parentProfileFullNameRequired;
  }
  if (message.startsWith('Failed to load profile:')) {
    return l10n.parentProfileLoadFailed(
      message.substring('Failed to load profile:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to save profile:')) {
    return l10n.parentProfileSaveFailed(
      message.substring('Failed to save profile:'.length).trim(),
    );
  }
  if (message.startsWith(
    'Profile details were saved, but the image upload failed:',
  )) {
    return l10n.parentProfileImageUploadFailed(
      message
          .substring(
            'Profile details were saved, but the image upload failed:'.length,
          )
          .trim(),
    );
  }
  if (message.startsWith('Profile saved, but refresh failed:')) {
    return l10n.parentProfileRefreshAfterSaveFailed(
      message.substring('Profile saved, but refresh failed:'.length).trim(),
    );
  }
  if (message == 'Failed to upload profile image.') {
    return l10n.parentProfileImageUploadError;
  }
  return message;
}

String mapParentNotificationsError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to view notifications.') {
    return l10n.parentNotificationsSignInRequired;
  }
  if (message.startsWith('Failed to load notifications:')) {
    return l10n.parentNotificationsLoadFailed(
      message.substring('Failed to load notifications:'.length).trim(),
    );
  }
  return message;
}

String mapParentDashboardError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in to view the parent dashboard.') {
    return l10n.parentDashboardSignInRequired;
  }
  if (message.startsWith('Failed to load dashboard:')) {
    return l10n.parentDashboardLoadFailed(
      message.substring('Failed to load dashboard:'.length).trim(),
    );
  }
  if (message.startsWith('Failed to load child data:')) {
    return l10n.parentDashboardChildDataLoadFailed(
      message.substring('Failed to load child data:'.length).trim(),
    );
  }
  return message;
}

String mapParentExercisesError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load exercises:')) {
    return l10n.parentExercisesLoadFailed(
      message.substring('Failed to load exercises:'.length).trim(),
    );
  }
  return message;
}

String localizedChildGender(AppLocalizations l10n, String gender) {
  final normalized = gender.trim().toLowerCase();
  switch (normalized) {
    case 'male':
    case 'm':
      return l10n.fieldGenderMale;
    case 'female':
    case 'f':
      return l10n.fieldGenderFemale;
    default:
      return gender;
  }
}

String localizedReportType(AppLocalizations l10n, String reportType) {
  final normalized = reportType.trim().toLowerCase().replaceAll('_', ' ');
  switch (normalized) {
    case 'weekly':
      return l10n.reportTypeWeekly;
    case 'monthly':
      return l10n.reportTypeMonthly;
    case 'daily':
      return l10n.reportTypeDaily;
    case 'progress':
      return l10n.reportTypeProgress;
    default:
      return reportType;
  }
}

String localizedExerciseFrequency(AppLocalizations l10n, String frequency) {
  final normalized = frequency.trim().toLowerCase().replaceAll('_', ' ');
  switch (normalized) {
    case 'daily':
      return l10n.exerciseFrequencyDaily;
    case 'weekly':
      return l10n.exerciseFrequencyWeekly;
    case 'monthly':
      return l10n.exerciseFrequencyMonthly;
    default:
      return frequency;
  }
}

String localizedExerciseStatus(AppLocalizations l10n, String status) {
  final normalized = status.trim().toLowerCase().replaceAll('_', ' ');
  switch (normalized) {
    case 'completed':
      return l10n.statusCompleted;
    case 'pending':
      return l10n.statusPending;
    case 'in progress':
    case 'inprogress':
      return l10n.statusInProgress;
    default:
      return status;
  }
}

int normalizeProgressPercent(double progress) {
  return progress <= 1 ? (progress * 100).round() : progress.round();
}

List<String> buildChildMetaParts({
  required AppLocalizations l10n,
  required ParentChild child,
  required String Function(DateTime? date) formatDate,
}) {
  final parts = <String>[];
  if (child.age != null) {
    parts.add(l10n.parentChildrenAgeYears(child.age!));
  }
  if (child.dateOfBirth != null) {
    parts.add(formatDate(child.dateOfBirth));
  }
  if (child.gender != null && child.gender!.isNotEmpty) {
    parts.add(localizedChildGender(l10n, child.gender!));
  }
  return parts;
}
