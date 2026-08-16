import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { getRoleLabel } from "../../../routes/roleRouting";

export const PROFILE_ROLE_LABEL = "Admin";

export const PROFILE_EMPTY_MESSAGES = {
  loadError: "We couldn't load your profile right now.",
};

export const EMPTY_VALUE = "—";

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "AD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function resolveProfileImageUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return resolveUploadedAssetUrl(trimmed) ?? trimmed;
  }

  return resolveUploadedAssetUrl(trimmed);
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

export function formatOptionalProfileValue(value) {
  if (value == null || value === "") {
    return EMPTY_VALUE;
  }
  return String(value);
}

export function mapAdminProfileFromUser(userRow) {
  const userId = readString(userRow, ["id", "_id"]);
  const fullName = readString(userRow, ["full_name", "fullName"])
    || readString(userRow, ["email"])
    || "Admin";
  const profileImageUrl = resolveProfileImageUrl(
    readString(userRow, ["profile_image_url", "profileImageUrl"]),
  );
  const createdAtRaw = readString(userRow, ["created_at", "createdAt"]);

  return {
    userId,
    fullName,
    email: readString(userRow, ["email"]) || "",
    phone: readString(userRow, ["phone"]) || "",
    role: readString(userRow, ["role"]) || "admin",
    roleLabel: getRoleLabel(userRow?.role) || PROFILE_ROLE_LABEL,
    isEmailVerified: Boolean(userRow?.is_email_verified ?? userRow?.isEmailVerified),
    profileImageUrl,
    createdAt: createdAtRaw || null,
    initials: getInitials(fullName),
  };
}

export function mapProfileToFormValues(profile) {
  return {
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
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

export function validateProfileForm(formValues) {
  const errors = {};
  const fullName = normalizeOptionalText(formValues.fullName);

  if (!fullName) {
    errors.fullName = "Full name is required.";
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
  };

  const normalizedPersisted = {
    fullName: normalizeOptionalText(persistedProfile.fullName),
    phone: normalizeOptionalText(persistedProfile.phone ?? ""),
  };

  return Object.keys(normalizedForm).some(
    (key) => normalizedForm[key] !== normalizedPersisted[key],
  );
}

export function hasUserFieldChanges(formValues, persistedProfile) {
  return normalizeOptionalText(formValues.fullName) !== normalizeOptionalText(persistedProfile?.fullName)
    || nullableTrim(formValues.phone) !== nullableTrim(persistedProfile?.phone ?? "");
}

export function validateProfileImageFile(file) {
  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    return "Please choose an image file.";
  }

  return null;
}
