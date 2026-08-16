import { getInitials, resolveReportFileUrl } from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  buildCaseRequestGenderOptions,
  CASE_REQUEST_CHILD_IMAGE_HINT,
  CASE_REQUEST_GENDER_OPTIONS,
  formatCaseRequestGenderLabel,
  getCaseRequestChildImageHint,
  getCaseRequestImageValidationMessages,
  getDefaultChildNameForInitials,
} from "./parentCaseRequestImageLocalization";

export {
  buildCaseRequestGenderOptions,
  CASE_REQUEST_CHILD_IMAGE_HINT,
  CASE_REQUEST_GENDER_OPTIONS,
  formatCaseRequestGenderLabel,
  getCaseRequestChildImageHint,
};

export const CASE_REQUEST_CHILD_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export function resolveCaseRequestChildImageUrl(fileUrl) {
  return resolveReportFileUrl(fileUrl);
}

export function getCaseRequestChildInitials(childName, options = {}) {
  const { t } = resolveMapperContext(options);
  return getInitials(childName || getDefaultChildNameForInitials(t));
}

export function validateCaseRequestChildImageFile(file, options = {}) {
  const { t } = resolveMapperContext(options);
  const messages = getCaseRequestImageValidationMessages(t);

  if (!(file instanceof File)) {
    return messages.selectImage;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return messages.invalidType;
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return messages.tooLarge;
  }

  return null;
}
