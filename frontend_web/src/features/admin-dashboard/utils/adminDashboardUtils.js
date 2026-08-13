import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { getRoleLabel } from "../../../routes/roleRouting";

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

/**
 * @param {Record<string, unknown>|null|undefined} user
 */
export function mapAdminFromAuth(user) {
  const fullName =
    readString(user, ["full_name", "fullName"])
    || (typeof user?.email === "string" ? user.email : "Admin");

  return {
    fullName,
    role: getRoleLabel(user?.role) || "Admin",
    initials: getInitials(fullName),
    profileImageUrl: resolveProfileImageUrl(
      readString(user, ["profile_image_url", "profileImageUrl"]),
    ),
  };
}
