import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

const ROLE_FALLBACKS = {
  specialist: "Specialist",
  parent: "Parent",
  admin: "Admin",
  user: "User",
};

export function getProfileRoleLabel(role, t = null) {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "specialist";
  const key = normalized ? `roles.${normalized}` : "roles.specialist";
  return translateKey(t, key, ROLE_FALLBACKS[normalized] ?? "Specialist");
}

export function getSpecialistProfilePageLabels(t = null) {
  return {
    title: translateKey(t, "specialist.profile.title", "Profile"),
    subtitle: translateKey(
      t,
      "specialist.profile.subtitle",
      "Manage your personal and professional information.",
    ),
    editTitle: translateKey(t, "specialist.profile.editTitle", "Edit Profile"),
    editSubtitle: translateKey(
      t,
      "specialist.profile.editSubtitle",
      "Update your personal and professional details.",
    ),
    backToProfile: translateKey(t, "specialist.profile.backToProfile", "Back to profile"),
    loading: translateKey(t, "specialist.profile.loading", "Loading profile..."),
    unavailable: translateKey(t, "specialist.profile.unavailable", "Profile unavailable."),
    updatedSuccess: translateKey(
      t,
      "specialist.profile.updatedSuccess",
      "Profile updated successfully",
    ),
    editProfile: translateKey(t, "specialist.profile.editProfile", "Edit Profile"),
    personalInfo: translateKey(t, "specialist.profile.personalInfo", "Personal Information"),
    professionalInfo: translateKey(
      t,
      "specialist.profile.professionalInfo",
      "Professional Information",
    ),
    profilePhoto: translateKey(t, "specialist.profile.profilePhoto", "Profile Photo"),
    changePhoto: translateKey(t, "specialist.profile.changePhoto", "Change photo"),
    photoHint: translateKey(
      t,
      "specialist.profile.photoHint",
      "Choose a new photo. It will upload when you save changes.",
    ),
    fullName: translateKey(t, "specialist.profile.fullName", "Full Name"),
    email: translateKey(t, "specialist.profile.email", "Email"),
    phone: translateKey(t, "specialist.profile.phone", "Phone"),
    role: translateKey(t, "specialist.profile.role", "Role"),
    specialization: translateKey(t, "specialist.profile.specialization", "Specialization"),
    licenseNumber: translateKey(t, "specialist.profile.licenseNumber", "License Number"),
    yearsOfExperience: translateKey(
      t,
      "specialist.profile.yearsOfExperience",
      "Years of Experience",
    ),
    bio: translateKey(t, "specialist.profile.bio", "Bio"),
    saveChanges: translateKey(t, "specialist.profile.saveChanges", "Save Changes"),
    saving: translateKey(t, "specialist.profile.saving", "Saving..."),
    cancel: translateKey(t, "common.cancel", "Cancel"),
    retry: translateKey(t, "common.retry", "Retry"),
    profilePhotoAlt: (name) => translateKey(
      t,
      "profile.photoAlt",
      "{name} profile photo",
      { name },
    ),
  };
}

export function getSpecialistProfileValidationMessages(t = null) {
  return {
    fullNameRequired: translateKey(
      t,
      "specialist.profile.validation.fullNameRequired",
      "Full name is required",
    ),
    yearsInvalid: translateKey(
      t,
      "specialist.profile.validation.yearsInvalid",
      "Years of experience must be a valid number",
    ),
    imageRequired: translateKey(
      t,
      "specialist.profile.validation.imageRequired",
      "Please choose an image file.",
    ),
  };
}

export function getSpecialistProfileErrorMessages(t = null) {
  return {
    loadFailed: translateKey(t, "specialist.profile.errors.loadFailed", "Failed to load profile."),
    saveFailed: translateKey(t, "specialist.profile.errors.saveFailed", "Failed to save profile."),
    imageUploadPartial: (reason) => translateKey(
      t,
      "specialist.profile.errors.imageUploadPartial",
      "Profile details were saved, but the image upload failed: {reason}",
      { reason },
    ),
    imageUploadPartialGeneric: translateKey(
      t,
      "specialist.profile.errors.imageUploadPartialGeneric",
      "Profile details were saved, but the image upload failed.",
    ),
    imageNoUrl: translateKey(
      t,
      "specialist.profile.errors.imageNoUrl",
      "Profile image upload succeeded but no image URL was returned.",
    ),
    sessionRefreshFailed: translateKey(
      t,
      "specialist.profile.errors.sessionRefreshFailed",
      "Profile saved but the session could not be refreshed. Please reload the page.",
    ),
  };
}

export function applySpecialistProfileLocalization(profile, context = {}) {
  if (!profile) {
    return profile;
  }

  const { t } = resolveSpecialistMapperContext(context);

  return {
    ...profile,
    roleLabel: getProfileRoleLabel(profile.role, t),
  };
}
