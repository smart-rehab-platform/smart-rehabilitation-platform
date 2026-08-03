import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/auth/models/signup_wizard_models.dart';
import 'package:mobile_app/features/auth/utils/auth_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Auth localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('login and signup core labels exist in both locales', () {
      expect(en.loginTitle, 'Welcome Back');
      expect(ar.loginTitle, isNotEmpty);
      expect(en.authCommonCreateAccount, 'Create Account');
      expect(ar.signupCreateYourAccount, isNotEmpty);
      expect(en.commonContinue, 'Continue');
      expect(ar.commonBack, isNotEmpty);
    });

    test('provider errors map at display time', () {
      expect(
        mapAuthProviderError(
          en,
          'Unable to create your account right now. Please try again.',
        ),
        en.authRegisterUnableToCreate,
      );
      expect(
        mapAuthProviderError(
          en,
          'Unable to sign in right now. Please try again.',
        ),
        en.loginUnableToSignIn,
      );
      expect(
        mapAuthProviderError(en, 'Custom backend error'),
        'Custom backend error',
      );
    });

    test('signup validation messages map at display time', () {
      expect(
        mapSignupValidationMessage(en, 'Specialization is required.'),
        en.signupValidationSpecializationRequired,
      );
      expect(
        mapSignupValidationMessage(ar, 'Bio must not exceed 500 characters.'),
        ar.signupValidationBioMax,
      );
    });

    test('signup role and experience helpers localize', () {
      expect(localizedSignupRoleLabel(en, SignupRole.parent), en.roleParent);
      expect(
        localizedSignupRoleLabel(en, SignupRole.specialist),
        en.roleSpecialist,
      );
      expect(localizedSignupExperience(en, '1'), en.signupExperienceOneYear);
      expect(localizedSignupExperience(en, '5'), en.signupExperienceYears(5));
    });

    test('password and verify email labels exist in both locales', () {
      expect(
        localizedAuthStrongPasswordMessage(en),
        en.authPasswordRequirementsDescription,
      );
      expect(en.forgotPasswordTitle, 'Forgot Password');
      expect(en.resetPasswordTitle, 'Reset Password');
      expect(en.verifyEmailCheckTitle, 'Check Your Email');
      expect(ar.splashGetStarted, isNotEmpty);
    });

    test('photo picker errors localize by source', () {
      expect(
        localizedSignupPhotoPickerError(
          en,
          'camera_access_denied',
          'permission denied',
          fromCamera: true,
        ),
        en.signupCameraPermissionDenied,
      );
      expect(
        localizedSignupPhotoPickerError(
          en,
          'photo_access_denied',
          'denied',
          fromCamera: false,
        ),
        en.signupGalleryPermissionDenied,
      );
    });
  });
}
