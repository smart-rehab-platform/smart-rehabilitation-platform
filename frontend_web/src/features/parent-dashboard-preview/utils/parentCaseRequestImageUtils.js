import { resolveReportFileUrl, getInitials } from "./parentDashboardMappers";

export const CASE_REQUEST_CHILD_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const CASE_REQUEST_CHILD_IMAGE_HINT =
  "Optional. JPEG, PNG, or WebP up to 5 MB.";

export const CASE_REQUEST_GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const KNOWN_GENDER_LABELS = {
  male: "Male",
  female: "Female",
};

export function resolveCaseRequestChildImageUrl(fileUrl) {
  return resolveReportFileUrl(fileUrl);
}

export function formatCaseRequestGenderLabel(gender) {
  if (!gender || typeof gender !== "string") {
    return "Not specified";
  }

  const normalized = gender.trim().toLowerCase();
  return KNOWN_GENDER_LABELS[normalized] || "Not specified";
}

export function getCaseRequestChildInitials(childName) {
  return getInitials(childName || "Child");
}

export function validateCaseRequestChildImageFile(file) {
  if (!(file instanceof File)) {
    return "Please select an image file.";
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "Unsupported image type. Use JPEG, PNG, or WebP.";
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return "Image is too large. Maximum size is 5 MB.";
  }

  return null;
}
