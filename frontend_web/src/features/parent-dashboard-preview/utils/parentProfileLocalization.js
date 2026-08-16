import {
  formatEmptyDisplay,
  formatParentLongDate,
  translateKey,
} from "./parentLocalizationCore.js";

export function getProfileRoleLabel(t) {
  return translateKey(t, "roles.parent", "Parent");
}

export function getProfileEmptyMessages(t) {
  return {
    loadError: translateKey(t, "parent.profile.empty.loadError", "We couldn't load your profile right now."),
  };
}

export function formatOptionalProfileValue(value, t = null) {
  if (value == null || value === "") {
    return formatEmptyDisplay(t);
  }
  return String(value);
}

export function formatProfileMemberSince(value, locale = "en", t = null) {
  return formatParentLongDate(value, locale, t);
}

export function getDefaultParentName(t) {
  return translateKey(t, "roles.parent", "Parent");
}

export function getProfileValidationMessages(t) {
  return {
    fullNameRequired: translateKey(t, "parent.profile.validation.fullNameRequired", "Full name is required."),
    imageRequired: translateKey(t, "parent.profile.validation.imageRequired", "Please choose an image file."),
  };
}

/** @deprecated Use getProfileRoleLabel(t) */
export const PROFILE_ROLE_LABEL = getProfileRoleLabel(null);

/** @deprecated Use getProfileEmptyMessages(t) */
export const PROFILE_EMPTY_MESSAGES = getProfileEmptyMessages(null);

/** @deprecated Use formatEmptyDisplay(t) */
export const EMPTY_VALUE = formatEmptyDisplay(null);
