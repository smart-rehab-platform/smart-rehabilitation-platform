import { formatParentDate, translateKey } from "./parentLocalizationCore.js";

export function formatChildDate(dateValue, locale = "en", t = null) {
  return formatParentDate(dateValue, locale, t);
}

export function getDefaultChildLabel(t) {
  return translateKey(t, "parent.common.child", "Child");
}

export function getDefaultExerciseLabel(t) {
  return translateKey(t, "parent.common.exercise", "Exercise");
}

export function buildChildMetaLine(child, locale = "en", t = null) {
  const parts = [];

  if (child?.age != null) {
    parts.push(translateKey(t, "parent.children.ageYears", "{count} yrs", { count: child.age }));
  }

  if (child?.dateOfBirth) {
    const formatted = formatChildDate(child.dateOfBirth, locale, t);
    if (formatted) {
      parts.push(formatted);
    }
  }

  if (child?.gender) {
    parts.push(child.gender);
  }

  return parts.join(" · ");
}

export function getChildrenEmptyMessage(t) {
  return translateKey(
    t,
    "parent.children.empty.none",
    "No linked children yet. Contact your specialist to link a child profile.",
  );
}

export function getChildNotFoundMessage(t) {
  return translateKey(
    t,
    "parent.children.empty.notFound",
    "This child profile is not linked to your account or could not be found.",
  );
}

/** @deprecated Use getChildrenEmptyMessage(t) */
export const CHILDREN_EMPTY_MESSAGE = getChildrenEmptyMessage(null);

/** @deprecated Use getChildNotFoundMessage(t) */
export const CHILD_NOT_FOUND_MESSAGE = getChildNotFoundMessage(null);
