import '../models/signup_wizard_models.dart';
import '../utils/password_strength.dart';

const int signupWizardTotalSteps = 5;
const int signupSecurityStep = 4;
const int signupReviewStep = 5;

const emptySpecialistProfile = SpecialistProfileData();

int getStepAfterPersonalInfo(SignupRole? role) {
  return role == SignupRole.specialist ? 3 : signupSecurityStep;
}

int getStepBeforeSecurity(SignupRole? role) {
  return role == SignupRole.specialist ? 3 : 2;
}

bool isEmailValid(String email) {
  return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email.trim());
}

bool isFullNameValid(String fullName) {
  return fullName.trim().length >= 2;
}

bool isPhoneValid(String phone) {
  final digitsOnly = phone.replaceAll(RegExp(r'\D'), '');
  return digitsOnly.length >= 7;
}

bool isPasswordValid(String password) {
  return evaluateAuthPasswordStrength(password).isStrong;
}

bool passwordsMatch(String password, String confirmPassword) {
  return confirmPassword.isNotEmpty && password == confirmPassword;
}

SpecialistValidationResult validateSpecialization(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'Specialization is required.',
    );
  }
  if (trimmed.length > 150) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'Specialization must not exceed 150 characters.',
    );
  }
  return SpecialistValidationResult(valid: true, value: trimmed);
}

SpecialistValidationResult validateLicenseNumber(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'License number is required.',
    );
  }
  if (trimmed.length > 100) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'License number must not exceed 100 characters.',
    );
  }
  return SpecialistValidationResult(valid: true, value: trimmed);
}

SpecialistValidationResult validateYearsOfExperience(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'Years of experience is required.',
    );
  }

  final numericValue = int.tryParse(trimmed);
  if (numericValue == null) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'Years of experience is required.',
    );
  }
  if (numericValue < 0) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'Years of experience must be at least 0.',
    );
  }
  return SpecialistValidationResult(valid: true, value: trimmed);
}

SpecialistValidationResult validateBio(String value) {
  if (value.length > 500) {
    return const SpecialistValidationResult(
      valid: false,
      message: 'Bio must not exceed 500 characters.',
    );
  }
  return SpecialistValidationResult(valid: true, value: value);
}

Map<String, dynamic> buildRegistrationPayload({
  required SignupRole role,
  required String fullName,
  required String email,
  required String password,
  required String phone,
  String? profileImageUrl,
  SpecialistProfileData? specialistProfile,
}) {
  final payload = <String, dynamic>{
    'full_name': fullName.trim(),
    'email': email.trim(),
    'password': password,
    'phone': phone.trim(),
    'role': role == SignupRole.parent ? 'parent' : 'specialist',
    if (profileImageUrl != null && profileImageUrl.trim().isNotEmpty)
      'profile_image_url': profileImageUrl.trim(),
  };

  if (role == SignupRole.specialist && specialistProfile != null) {
    payload['specialist_profile'] = specialistProfile.toApiMap();
  }

  return payload;
}

String formatRoleLabel(SignupRole? role) {
  return switch (role) {
    SignupRole.parent => 'Parent',
    SignupRole.specialist => 'Specialist',
    null => '—',
  };
}

String formatExperience(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return '—';
  }
  final years = int.tryParse(trimmed);
  if (years == null) {
    return trimmed;
  }
  return '$years year${years == 1 ? '' : 's'}';
}

bool isDuplicateEmailError(String? message) {
  if (message == null || message.isEmpty) {
    return false;
  }
  return RegExp(
    r'email already exists|already registered',
    caseSensitive: false,
  ).hasMatch(message);
}

class SpecialistValidationResult {
  const SpecialistValidationResult({
    required this.valid,
    this.message,
    this.value,
  });

  final bool valid;
  final String? message;
  final String? value;
}
