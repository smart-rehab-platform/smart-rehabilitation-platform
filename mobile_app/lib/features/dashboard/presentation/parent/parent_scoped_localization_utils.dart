import '../../../../l10n/app_localizations.dart';

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
