import { getPasswordStrength, resolveUploadedImageUrl } from "../../components/auth/authHelpers";
import {
  getDuplicateEmailMessages,
  validateBio,
  validateLicenseNumber,
  validateSpecialization,
  validateWizardForSubmission,
  validateYearsOfExperience,
} from "../../components/auth/authLocalization";

export {
  validateBio,
  validateLicenseNumber,
  validateSpecialization,
  validateWizardForSubmission,
  validateYearsOfExperience,
};

export const EMPTY_SPECIALIST_PROFILE = {
  specialization: "",
  license_number: "",
  years_of_experience: null,
  bio: "",
};

export function revokeWizardProfileImagePreview(preview) {
  if (typeof preview === "string" && preview.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
}

export function getDisplayProfileImage(wizardData) {
  if (wizardData?.profile_image_url) {
    return resolveUploadedImageUrl(wizardData.profile_image_url);
  }

  if (wizardData?.profileImagePreview) {
    return wizardData.profileImagePreview;
  }

  return null;
}

export function getClearWizardProfileImagePatch() {
  return {
    profileImageFile: null,
    profileImagePreview: null,
    profile_image_url: null,
  };
}
export function getStepAfterPersonalInfo(role) {
  return role === "specialist" ? 3 : 4;
}

export function getStepBeforeSecurity(role) {
  return role === "specialist" ? 3 : 2;
}

export function getReviewStep() {
  return 5;
}

export function getSecurityStep() {
  return 4;
}

export const DUPLICATE_EMAIL_TOAST_MESSAGE = "This email is already registered.";
export const DUPLICATE_EMAIL_INLINE_MESSAGE =
  "This email is already registered. Please use a different email or sign in.";

export function getDuplicateEmailCopy(t) {
  return getDuplicateEmailMessages(t);
}

export function isDuplicateEmailError(message) {
  if (typeof message !== "string") {
    return false;
  }

  return /email already exists|already registered/i.test(message);
}

export function isPasswordValid(password) {
  return getPasswordStrength(password).isStrong;
}

export function passwordsMatch(password, confirmPassword) {
  return confirmPassword.length > 0 && password === confirmPassword;
}

export function buildRegistrationPayload(wizardData) {
  const payload = {
    full_name: wizardData.full_name.trim(),
    email: wizardData.email.trim(),
    password: wizardData.password,
    phone: wizardData.phone.trim(),
    role: wizardData.role,
    profile_image_url: wizardData.profile_image_url || null,
  };

  if (wizardData.role === "specialist" && wizardData.specialist_profile) {
    payload.specialist_profile = {
      specialization: wizardData.specialist_profile.specialization.trim(),
      license_number: wizardData.specialist_profile.license_number.trim(),
      years_of_experience: Number(wizardData.specialist_profile.years_of_experience),
      bio: wizardData.specialist_profile.bio?.trim() || null,
    };
  }

  return payload;
}
