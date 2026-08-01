import { getPasswordStrength, resolveUploadedImageUrl } from "../../components/auth/authHelpers";

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DUPLICATE_EMAIL_TOAST_MESSAGE = "This email is already registered.";
export const DUPLICATE_EMAIL_INLINE_MESSAGE =
  "This email is already registered. Please use a different email or sign in.";

export function isDuplicateEmailError(message) {
  if (typeof message !== "string") {
    return false;
  }

  return /email already exists|already registered/i.test(message);
}

export function validateWizardForSubmission(wizardData) {
  if (!wizardData.role) {
    return { valid: false, step: 1, message: "Please select an account type." };
  }

  if (!wizardData.full_name?.trim()) {
    return { valid: false, step: 2, message: "Please enter your full name." };
  }

  if (!EMAIL_PATTERN.test(wizardData.email ?? "")) {
    return { valid: false, step: 2, message: "Invalid email address." };
  }

  if (!wizardData.phone?.trim()) {
    return { valid: false, step: 2, message: "Please enter your phone number." };
  }

  if (wizardData.role === "specialist") {
    const profile = wizardData.specialist_profile ?? EMPTY_SPECIALIST_PROFILE;

    const specializationResult = validateSpecialization(profile.specialization);
    if (!specializationResult.valid) {
      return { valid: false, step: 3, message: specializationResult.message };
    }

    const licenseResult = validateLicenseNumber(profile.license_number);
    if (!licenseResult.valid) {
      return { valid: false, step: 3, message: licenseResult.message };
    }

    const yearsResult = validateYearsOfExperience(profile.years_of_experience);
    if (!yearsResult.valid) {
      return { valid: false, step: 3, message: yearsResult.message };
    }

    const bioResult = validateBio(profile.bio);
    if (!bioResult.valid) {
      return { valid: false, step: 3, message: bioResult.message };
    }
  }

  if (!isPasswordValid(wizardData.password ?? "")) {
    return { valid: false, step: 4, message: "Please create a valid password." };
  }

  if (!passwordsMatch(wizardData.password, wizardData.confirmPassword)) {
    return { valid: false, step: 4, message: "Passwords do not match." };
  }

  if (!wizardData.acceptedTerms) {
    return {
      valid: false,
      step: 4,
      message: "You must accept the Terms of Service and Privacy Policy.",
    };
  }

  return { valid: true };
}

export function isPasswordValid(password) {
  return getPasswordStrength(password).isStrong;
}

export function passwordsMatch(password, confirmPassword) {
  return confirmPassword.length > 0 && password === confirmPassword;
}

export function validateSpecialization(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, message: "Specialization is required." };
  }

  if (trimmed.length > 150) {
    return { valid: false, message: "Specialization must not exceed 150 characters." };
  }

  return { valid: true, value: trimmed };
}

export function validateLicenseNumber(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, message: "License number is required." };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: "License number must not exceed 100 characters." };
  }

  return { valid: true, value: trimmed };
}

export function validateYearsOfExperience(value) {
  if (value === null || value === undefined || value === "") {
    return { valid: false, message: "Years of experience is required." };
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numericValue)) {
    return { valid: false, message: "Years of experience is required." };
  }

  if (numericValue < 0) {
    return { valid: false, message: "Years of experience must be at least 0." };
  }

  return { valid: true, value: numericValue };
}

export function validateBio(value) {
  if (!value) {
    return { valid: true, value: "" };
  }

  if (value.length > 500) {
    return { valid: false, message: "Bio must not exceed 500 characters." };
  }

  return { valid: true, value };
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
