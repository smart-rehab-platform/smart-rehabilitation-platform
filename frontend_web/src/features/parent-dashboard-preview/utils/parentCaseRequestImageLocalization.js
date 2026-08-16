import { translateKey } from "./parentLocalizationCore.js";

export function buildCaseRequestGenderOptions(t) {
  return [
    { value: "male", label: translateKey(t, "parent.caseRequests.gender.male", "Male") },
    { value: "female", label: translateKey(t, "parent.caseRequests.gender.female", "Female") },
  ];
}

export function formatCaseRequestGenderLabel(gender, t = null) {
  if (!gender || typeof gender !== "string") {
    return translateKey(t, "parent.caseRequests.gender.notSpecified", "Not specified");
  }

  const normalized = gender.trim().toLowerCase();
  if (normalized === "male") {
    return translateKey(t, "parent.caseRequests.gender.male", "Male");
  }
  if (normalized === "female") {
    return translateKey(t, "parent.caseRequests.gender.female", "Female");
  }

  return translateKey(t, "parent.caseRequests.gender.notSpecified", "Not specified");
}

export function getCaseRequestChildImageHint(t) {
  return translateKey(t, "parent.caseRequests.imageHint", "Optional. JPEG, PNG, or WebP up to 5 MB.");
}

export function getCaseRequestImageValidationMessages(t) {
  return {
    selectImage: translateKey(t, "parent.caseRequests.validation.selectImage", "Please select an image file."),
    invalidType: translateKey(t, "parent.caseRequests.validation.invalidImageType", "Unsupported image type. Use JPEG, PNG, or WebP."),
    tooLarge: translateKey(t, "parent.caseRequests.validation.imageTooLarge", "Image is too large. Maximum size is 5 MB."),
  };
}

export function getDefaultChildNameForInitials(t) {
  return translateKey(t, "parent.common.child", "Child");
}

/** @deprecated Use buildCaseRequestGenderOptions(t) */
export const CASE_REQUEST_GENDER_OPTIONS = buildCaseRequestGenderOptions(null);

/** @deprecated Use getCaseRequestChildImageHint(t) */
export const CASE_REQUEST_CHILD_IMAGE_HINT = getCaseRequestChildImageHint(null);
