import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { getRoleLabel } from "../../../routes/roleRouting";
import {
  EMPTY_VALUE,
  findSpecialistProfileRow,
  formatOptionalProfileValue,
  mapProfileToFormValues,
  validateProfileImageFile,
  validateSpecialistProfileForm,
  buildUserUpdatePayload,
  buildProfessionalUpdatePayload,
  isProfileFormDirty,
} from "./specialistProfileFormUtils";

function readString(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readNumber(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
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

export function mapSpecialistProfessionalInfo(row) {
  if (!row) {
    return null;
  }

  const years = readNumber(row, ["years_of_experience", "yearsOfExperience"]);

  return {
    profileId: readString(row, ["id", "_id"]),
    specialization: readString(row, ["specialization"]),
    licenseNumber: readString(row, ["license_number", "licenseNumber"]),
    bio: readString(row, ["bio", "about"]),
    yearsOfExperience: years == null ? null : Math.round(years),
  };
}

export function mapSpecialistProfileBundle(userRow, specialistRow) {
  const userId = readString(userRow, ["id", "_id"]) ?? "";
  const professional = mapSpecialistProfessionalInfo(specialistRow);
  const role = readString(userRow, ["role"]) ?? "specialist";

  return {
    userId,
    profileId: professional?.profileId ?? null,
    fullName:
      readString(userRow, ["full_name", "fullName", "name"])
      || readString(specialistRow, ["full_name", "fullName"])
      || "",
    email: readString(userRow, ["email"]) ?? "",
    phone:
      readString(userRow, ["phone", "phoneNumber", "mobile"])
      ?? readString(specialistRow, ["phone"]),
    role,
    roleLabel: getRoleLabel(role) || "Specialist",
    profileImageUrl: resolveProfileImageUrl(
      readString(userRow, [
        "profile_image_url",
        "profileImageUrl",
        "profile_image",
        "profileImage",
        "avatar",
        "avatarUrl",
      ]),
    ),
    specialization: professional?.specialization ?? null,
    licenseNumber: professional?.licenseNumber ?? null,
    yearsOfExperience: professional?.yearsOfExperience ?? null,
    bio: professional?.bio ?? null,
  };
}

export {
  readString,
  EMPTY_VALUE,
  findSpecialistProfileRow,
  formatOptionalProfileValue,
  mapProfileToFormValues,
  validateProfileImageFile,
  validateSpecialistProfileForm,
  buildUserUpdatePayload,
  buildProfessionalUpdatePayload,
  isProfileFormDirty,
};
