import { readNumber, readString, resolveReportFileUrl } from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  buildChildMetaLine as buildLocalizedChildMetaLine,
  CHILD_NOT_FOUND_MESSAGE,
  CHILDREN_EMPTY_MESSAGE,
  formatChildDate,
  getChildNotFoundMessage,
  getChildrenEmptyMessage,
  getDefaultChildLabel,
  getDefaultExerciseLabel,
} from "./parentChildrenLocalization";

export {
  CHILD_NOT_FOUND_MESSAGE,
  CHILDREN_EMPTY_MESSAGE,
  formatChildDate,
  getChildNotFoundMessage,
  getChildrenEmptyMessage,
};

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

export function mapChildListItem(row, progressPercent = null, options = {}) {
  const { t } = resolveMapperContext(options);
  const id = readString(row, ["id", "_id"]);
  const fullName = readString(row, ["full_name", "fullName", "name"]) || getDefaultChildLabel(t);
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

export function buildChildMetaLine(child, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  return buildLocalizedChildMetaLine(child, locale, t);
}

export function mapAssignedExerciseRow(row, options = {}) {
  const { t } = resolveMapperContext(options);

  return {
    id: readString(row, ["id", "_id"]),
    title: readString(row, ["title", "exercise_title", "exerciseTitle", "name"]) || getDefaultExerciseLabel(t),
    frequency: readString(row, ["frequency"]),
    status: readString(row, ["status"]),
  };
}
