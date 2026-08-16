import { readString, resolveReportFileUrl } from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  EMPTY_VALUE,
  formatOptionalProfileValue,
  formatProfileMemberSince,
  getDefaultParentName,
  getProfileEmptyMessages,
  getProfileRoleLabel,
  getProfileValidationMessages,
  PROFILE_EMPTY_MESSAGES,
  PROFILE_ROLE_LABEL,
} from "./parentProfileLocalization";

export {
  EMPTY_VALUE,
  formatOptionalProfileValue,
  getProfileEmptyMessages,
  getProfileRoleLabel,
  PROFILE_EMPTY_MESSAGES,
  PROFILE_ROLE_LABEL,
};

export function resolveProfileImageUrl(fileUrl) {
  return resolveReportFileUrl(fileUrl);
}

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function nullableTrim(value) {
  const trimmed = normalizeOptionalText(value);
  return trimmed || null;
}

export function findParentProfileRow(rows, userId) {
  if (!userId || !Array.isArray(rows)) {
    return null;
  }

  return rows.find((row) => readString(row, ["user_id", "userId"]) === userId) ?? null;
}

export function mapProfileBundle(userRow, parentRow, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const userId = readString(userRow, ["id", "_id"]);
  const fullName = readString(userRow, ["full_name", "fullName"]) || getDefaultParentName(t);
  const profileImageUrl = resolveProfileImageUrl(
    readString(userRow, ["profile_image_url", "profileImageUrl"]),
  );

  const memberSinceRaw = readString(parentRow, ["created_at", "createdAt"])
    || readString(userRow, ["created_at", "createdAt"]);

  return {
    userId,
    profileId: readString(parentRow, ["id", "_id"]),
    fullName,
    email: readString(userRow, ["email"]) || "",
    phone: readString(userRow, ["phone"]) || "",
    role: readString(userRow, ["role"]) || "parent",
    roleLabel: getProfileRoleLabel(t),
    isEmailVerified: Boolean(userRow?.is_email_verified ?? userRow?.isEmailVerified),
    profileImageUrl,
    address: readString(parentRow, ["address"]) || "",
    relationshipNotes: readString(parentRow, ["relationship_notes", "relationshipNotes"]) || "",
    createdAt: memberSinceRaw,
    memberSince: formatProfileMemberSince(memberSinceRaw, locale, t),
    initials: fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "P",
  };
}

export function mapProfileToFormValues(profile) {
  return {
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    relationshipNotes: profile?.relationshipNotes ?? "",
  };
}

export function buildUserUpdatePayload(formValues, persistedProfile) {
  const fullName = normalizeOptionalText(formValues.fullName);
  const phone = nullableTrim(formValues.phone);
  const payload = { full_name: fullName };

  const persistedPhone = nullableTrim(persistedProfile?.phone ?? "");
  if (phone !== persistedPhone) {
    if (phone) {
      payload.phone = phone;
    }
  }

  return payload;
}

export function buildParentUpdatePayload(formValues) {
  return {
    address: nullableTrim(formValues.address),
    relationship_notes: nullableTrim(formValues.relationshipNotes),
  };
}

export function validateProfileForm(formValues, options = {}) {
  const { t } = resolveMapperContext(options);
  const messages = getProfileValidationMessages(t);
  const errors = {};
  const fullName = normalizeOptionalText(formValues.fullName);

  if (!fullName) {
    errors.fullName = messages.fullNameRequired;
  }

  return errors;
}

export function isProfileFormDirty(formValues, persistedProfile, pendingAvatarFile) {
  if (pendingAvatarFile) {
    return true;
  }

  if (!persistedProfile) {
    return false;
  }

  const normalizedForm = {
    fullName: normalizeOptionalText(formValues.fullName),
    phone: normalizeOptionalText(formValues.phone),
    address: normalizeOptionalText(formValues.address),
    relationshipNotes: normalizeOptionalText(formValues.relationshipNotes),
  };

  const normalizedPersisted = {
    fullName: normalizeOptionalText(persistedProfile.fullName),
    phone: normalizeOptionalText(persistedProfile.phone ?? ""),
    address: normalizeOptionalText(persistedProfile.address ?? ""),
    relationshipNotes: normalizeOptionalText(persistedProfile.relationshipNotes ?? ""),
  };

  return Object.keys(normalizedForm).some(
    (key) => normalizedForm[key] !== normalizedPersisted[key],
  );
}

export function hasUserFieldChanges(formValues, persistedProfile) {
  return normalizeOptionalText(formValues.fullName) !== normalizeOptionalText(persistedProfile?.fullName)
    || nullableTrim(formValues.phone) !== nullableTrim(persistedProfile?.phone ?? "");
}

export function hasParentFieldChanges(formValues, persistedProfile) {
  return normalizeOptionalText(formValues.address) !== normalizeOptionalText(persistedProfile?.address ?? "")
    || normalizeOptionalText(formValues.relationshipNotes) !== normalizeOptionalText(persistedProfile?.relationshipNotes ?? "");
}

export function validateProfileImageFile(file, options = {}) {
  const { t } = resolveMapperContext(options);
  const messages = getProfileValidationMessages(t);

  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    return messages.imageRequired;
  }

  return null;
}
