import { readNumber, readString, resolveReportFileUrl } from "./parentDashboardMappers";

export function calculateAgeFromDob(dateOfBirth) {
  if (!dateOfBirth || typeof dateOfBirth !== "string") {
    return null;
  }

  const trimmed = dateOfBirth.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }

  const birth = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function formatChildDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function mapChildListItem(row, progressPercent = null) {
  const id = readString(row, ["id", "_id"]);
  const fullName = readString(row, ["full_name", "fullName", "name"]) || "Child";
  const dateOfBirth = readString(row, ["date_of_birth", "dateOfBirth"]);
  const gender = readString(row, ["gender"]);
  const age = calculateAgeFromDob(dateOfBirth);

  return {
    id,
    fullName,
    dateOfBirth,
    gender,
    age,
    profileImageUrl: resolveReportFileUrl(
      readString(row, ["profile_image_url", "profileImageUrl", "image_url", "avatar"]),
    ),
    progressPercent: progressPercent ?? readNumber(row, [
      "improvement_percentage",
      "improvementPercentage",
      "progressPercent",
    ]),
  };
}

export function buildChildMetaLine(child) {
  const parts = [];
  if (child?.age != null) {
    parts.push(`${child.age} yrs`);
  }
  if (child?.dateOfBirth) {
    const formatted = formatChildDate(child.dateOfBirth);
    if (formatted) {
      parts.push(formatted);
    }
  }
  if (child?.gender) {
    parts.push(child.gender);
  }
  return parts.join(" · ");
}

export function mapAssignedExerciseRow(row) {
  return {
    id: readString(row, ["id", "_id"]),
    title: readString(row, ["title", "exercise_title", "exerciseTitle", "name"]) || "Exercise",
    frequency: readString(row, ["frequency"]),
    status: readString(row, ["status"]),
  };
}

export const CHILDREN_EMPTY_MESSAGE =
  "No linked children yet. Contact your specialist to link a child profile.";

export const CHILD_NOT_FOUND_MESSAGE =
  "This child profile is not linked to your account or could not be found.";
