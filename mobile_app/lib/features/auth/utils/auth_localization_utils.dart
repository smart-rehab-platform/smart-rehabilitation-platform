import '../../../l10n/app_localizations.dart';
import '../models/signup_wizard_models.dart';

String localizedAuthStrongPasswordMessage(AppLocalizations l10n) {
  return l10n.authPasswordRequirementsDescription;
}

String mapAuthProviderError(AppLocalizations l10n, String message) {
  return switch (message.trim()) {
    'Unable to sign in right now. Please try again.' =>
      l10n.loginUnableToSignIn,
    'Login failed. Please try again.' => l10n.loginFailed,
    'Unable to create your account right now. Please try again.' =>
      l10n.authRegisterUnableToCreate,
    'Unable to send the reset link right now. Please try again.' =>
      l10n.authSendResetLinkUnable,
    'Unable to reset your password right now. Please try again.' =>
      l10n.authResetPasswordUnable,
    'Unable to verify your email right now. Please try again later.' =>
      l10n.authVerifyEmailUnable,
    'Unable to send the verification email right now. Please try again.' =>
      l10n.authVerifyEmailResendUnable,
    'Unable to upload your profile photo right now.' =>
      l10n.authUploadProfileFailed,
    'Unable to upload your profile photo. Please try again.' =>
      l10n.authUploadProfileRetry,
    'Registration failed. Please try again.' => l10n.authRegistrationFailed,
    'Failed to send reset link.' => l10n.forgotPasswordFailedSend,
    'Failed to reset password.' => l10n.resetPasswordFailed,
    _ => message,
  };
}

String mapSignupValidationMessage(AppLocalizations l10n, String? message) {
  if (message == null || message.isEmpty) {
    return message ?? '';
  }
  return switch (message) {
    'Specialization is required.' =>
      l10n.signupValidationSpecializationRequired,
    'Specialization must not exceed 150 characters.' =>
      l10n.signupValidationSpecializationMax,
    'License number is required.' => l10n.signupValidationLicenseRequired,
    'License number must not exceed 100 characters.' =>
      l10n.signupValidationLicenseMax,
    'Years of experience is required.' =>
      l10n.signupValidationExperienceRequired,
    'Years of experience must be at least 0.' =>
      l10n.signupValidationExperienceMin,
    'Bio must not exceed 500 characters.' => l10n.signupValidationBioMax,
    _ => message,
  };
}

String localizedSignupRoleLabel(AppLocalizations l10n, SignupRole? role) {
  return switch (role) {
    SignupRole.parent => l10n.roleParent,
    SignupRole.specialist => l10n.roleSpecialist,
    null => '—',
  };
}

String localizedSignupExperience(AppLocalizations l10n, String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return '—';
  }
  final years = int.tryParse(trimmed);
  if (years == null) {
    return trimmed;
  }
  if (years == 1) {
    return l10n.signupExperienceOneYear;
  }
  return l10n.signupExperienceYears(years);
}

String localizedSignupStepSubtitle(AppLocalizations l10n, int step) {
  return switch (step) {
    1 => l10n.signupStepSubtitleRole,
    2 => l10n.signupStepSubtitlePersonal,
    3 => l10n.signupStepSubtitleProfessional,
    4 => l10n.signupStepSubtitleSecurity,
    5 => l10n.signupStepSubtitleReview,
    _ => '',
  };
}

String localizedSignupPhotoPickerError(
  AppLocalizations l10n,
  String code,
  String message, {
  required bool fromCamera,
}) {
  final normalizedCode = code.toLowerCase();
  final normalizedMessage = message.toLowerCase();

  if (fromCamera) {
    if (normalizedCode.contains('camera_access_denied') ||
        normalizedCode.contains('permission') ||
        normalizedMessage.contains('permission') ||
        normalizedMessage.contains('denied')) {
      return l10n.signupCameraPermissionDenied;
    }
    if (normalizedCode.contains('camera') &&
        normalizedMessage.contains('unavailable')) {
      return l10n.signupCameraUnavailable;
    }
    return l10n.signupCameraOpenFailed;
  }

  if (normalizedCode.contains('photo_access_denied') ||
      normalizedCode.contains('permission') ||
      normalizedMessage.contains('permission') ||
      normalizedMessage.contains('denied')) {
    return l10n.signupGalleryPermissionDenied;
  }

  return l10n.signupGalleryOpenFailed;
}
