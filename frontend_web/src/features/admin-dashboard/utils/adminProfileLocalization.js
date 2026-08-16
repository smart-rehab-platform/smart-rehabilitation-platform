import { formatAppDate } from "../../../i18n/formatters.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";

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

export function getAdminProfileRoleLabel(role, t = null) {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "admin";
  const key = normalized ? `roles.${normalized}` : "roles.admin";
  const fallbacks = {
    admin: "Admin",
    specialist: "Specialist",
    parent: "Parent",
    user: "User",
  };

  return translateKey(t, key, fallbacks[normalized] ?? (typeof role === "string" && role.trim() ? role.trim() : "Admin"));
}

export function getAdminProfilePageLabels(t = null) {
  return {
    title: translateKey(t, "admin.profile.title", "Profile"),
    subtitle: translateKey(
      t,
      "admin.profile.subtitle",
      "Manage your account information.",
    ),
    editTitle: translateKey(t, "admin.profile.editTitle", "Edit Profile"),
    editSubtitle: translateKey(
      t,
      "admin.profile.editSubtitle",
      "Update your contact details and profile photo.",
    ),
    backToProfile: translateKey(t, "admin.profile.backToProfile", "Back to profile"),
    loading: translateKey(t, "admin.profile.loading", "Loading profile..."),
    unavailable: translateKey(t, "admin.profile.unavailable", "Profile unavailable."),
    updatedSuccess: translateKey(
      t,
      "admin.profile.updatedSuccess",
      "Profile updated successfully",
    ),
    editProfile: translateKey(t, "admin.profile.editProfile", "Edit Profile"),
    personalInfo: translateKey(t, "admin.profile.personalInfo", "Personal Information"),
    accountInfo: translateKey(t, "admin.profile.accountInfo", "Account Information"),
    profilePhoto: translateKey(t, "admin.profile.profilePhoto", "Profile Photo"),
    changePhoto: translateKey(t, "admin.profile.changePhoto", "Change photo"),
    photoHint: translateKey(
      t,
      "admin.profile.photoHint",
      "JPG or PNG image files are supported.",
    ),
    fullName: translateKey(t, "admin.profile.fullName", "Full Name"),
    phone: translateKey(t, "admin.profile.phone", "Phone"),
    phoneNumber: translateKey(t, "admin.profile.phoneNumber", "Phone number"),
    email: translateKey(t, "admin.profile.email", "Email"),
    role: translateKey(t, "admin.profile.role", "Role"),
    emailStatus: translateKey(t, "admin.profile.emailStatus", "Email Status"),
    verified: translateKey(t, "admin.profile.verified", "Verified"),
    notVerified: translateKey(t, "admin.profile.notVerified", "Not verified"),
    saveChanges: translateKey(t, "admin.profile.saveChanges", "Save Changes"),
    saving: translateKey(t, "admin.profile.saving", "Saving..."),
    cancel: translateKey(t, "common.cancel", "Cancel"),
    retry: translateKey(t, "common.retry", "Retry"),
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
    profilePhotoAlt: (name) => translateKey(
      t,
      "profile.photoAlt",
      "{name} profile photo",
      { name },
    ),
  };
}

export function getAdminProfileValidationMessages(t = null) {
  return {
    fullNameRequired: translateKey(
      t,
      "admin.profile.validation.fullNameRequired",
      "Full name is required.",
    ),
    imageRequired: translateKey(
      t,
      "admin.profile.validation.imageRequired",
      "Please choose an image file.",
    ),
  };
}

export function getAdminProfileErrorMessages(t = null) {
  return {
    loadError: translateKey(
      t,
      "admin.profile.errors.loadError",
      "We couldn't load your profile right now.",
    ),
    loadFailed: translateKey(t, "admin.profile.errors.loadFailed", "Failed to load profile."),
    saveFailed: translateKey(t, "admin.profile.errors.saveFailed", "Failed to save profile."),
    imageNoUrl: translateKey(
      t,
      "admin.profile.errors.imageNoUrl",
      "Profile image upload succeeded but no image URL was returned.",
    ),
    sessionRefreshFailed: translateKey(
      t,
      "admin.profile.errors.sessionRefreshFailed",
      "Profile saved but the session could not be refreshed. Please reload the page.",
    ),
    sessionImageRefreshFailed: translateKey(
      t,
      "admin.profile.errors.sessionImageRefreshFailed",
      "Session refresh did not return the updated profile image.",
    ),
  };
}

export function formatAdminProfileCreatedDate(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);

  if (!value) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return formatAppDate(date, locale)
    ?? translateKey(t, "parent.common.emptyDisplay", "—");
}

export function applyAdminProfileLocalization(profile, context = {}) {
  if (!profile) {
    return profile;
  }

  const { t } = resolveAdminMapperContext(context);

  return {
    ...profile,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    roleLabel: getAdminProfileRoleLabel(profile.role, t),
    createdAtLabel: profile.createdAt
      ? formatAdminProfileCreatedDate(profile.createdAt, context)
      : null,
  };
}

export function localizeProfileValidationErrors(errors, t = null) {
  const messages = getAdminProfileValidationMessages(t);
  const localized = {};

  for (const [field, message] of Object.entries(errors || {})) {
    if (message === "Full name is required.") {
      localized[field] = messages.fullNameRequired;
    } else if (message === "Please choose an image file.") {
      localized[field] = messages.imageRequired;
    } else {
      localized[field] = message;
    }
  }

  return localized;
}

export function localizeProfileErrorMessage(message, t = null) {
  const errors = getAdminProfileErrorMessages(t);

  if (message === "Failed to load profile.") {
    return errors.loadFailed;
  }
  if (message === "We couldn't load your profile right now.") {
    return errors.loadError;
  }
  if (message === "Failed to save profile.") {
    return errors.saveFailed;
  }
  if (message === "Profile image upload succeeded but no image URL was returned.") {
    return errors.imageNoUrl;
  }
  if (message === "Profile saved but the session could not be refreshed. Please reload the page.") {
    return errors.sessionRefreshFailed;
  }
  if (message === "Session refresh did not return the updated profile image.") {
    return errors.sessionImageRefreshFailed;
  }

  return message;
}
