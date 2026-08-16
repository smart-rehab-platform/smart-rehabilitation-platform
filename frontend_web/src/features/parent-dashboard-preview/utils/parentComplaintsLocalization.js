import { formatAppDateTime } from "../../../i18n/formatters.js";

export const COMPLAINT_CATEGORY_VALUES = [
  "specialist_not_responding",
  "poor_follow_up",
  "repeated_session_cancellations",
  "delayed_exercise_feedback",
  "inappropriate_communication",
  "other",
];

const COMPLAINT_CATEGORY_KEY_BY_VALUE = {
  specialist_not_responding: "parent.complaints.categoryLabels.specialist_not_responding",
  poor_follow_up: "parent.complaints.categoryLabels.poor_follow_up",
  repeated_session_cancellations: "parent.complaints.categoryLabels.repeated_session_cancellations",
  delayed_exercise_feedback: "parent.complaints.categoryLabels.delayed_exercise_feedback",
  inappropriate_communication: "parent.complaints.categoryLabels.inappropriate_communication",
  other: "parent.complaints.categoryLabels.other",
};

const COMPLAINT_STATUS_KEY_BY_VALUE = {
  pending: "parent.complaints.status.pending",
  under_review: "parent.complaints.status.under_review",
  resolved: "parent.complaints.status.resolved",
  rejected: "parent.complaints.status.rejected",
};

const COMPLAINT_STATUS_TONES = {
  pending: "warning",
  under_review: "blue",
  resolved: "success",
  rejected: "danger",
};

const EN_CATEGORY_FALLBACK = {
  specialist_not_responding: "Specialist is not responding",
  poor_follow_up: "Poor follow-up",
  repeated_session_cancellations: "Repeated session cancellations",
  delayed_exercise_feedback: "Delayed exercise feedback",
  inappropriate_communication: "Inappropriate communication",
  other: "Other",
};

const EN_STATUS_FALLBACK = {
  pending: "Pending",
  under_review: "Under Review",
  resolved: "Resolved",
  rejected: "Rejected",
};

function translateKey(t, key, fallback) {
  if (typeof t === "function") {
    const translated = t(key);
    if (translated) {
      return translated;
    }
  }

  return fallback;
}

export function getParentComplaintCategoryLabel(category, t = null) {
  const normalized = typeof category === "string" ? category.trim().toLowerCase() : "";
  const key = COMPLAINT_CATEGORY_KEY_BY_VALUE[normalized];

  if (key) {
    return translateKey(t, key, EN_CATEGORY_FALLBACK[normalized]);
  }

  return normalized || translateKey(t, "parent.complaints.categoryLabels.other", "Other");
}

export function getParentComplaintStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = COMPLAINT_STATUS_KEY_BY_VALUE[normalized];

  if (key) {
    return translateKey(t, key, EN_STATUS_FALLBACK[normalized]);
  }

  return normalized || translateKey(t, "parent.common.unknown", "Unknown");
}

export function getParentComplaintStatusTone(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return COMPLAINT_STATUS_TONES[normalized] || "neutral";
}

export function buildParentComplaintCategoryOptions(t) {
  return COMPLAINT_CATEGORY_VALUES.map((value) => ({
    value,
    label: getParentComplaintCategoryLabel(value, t),
  }));
}

export function formatParentComplaintDateTime(value, locale = "en", t = null) {
  const formatted = formatAppDateTime(value, locale);
  return formatted ?? translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function getParentComplaintValidationMessages(t) {
  return {
    selectChild: t("parent.complaints.validation.selectChild"),
    selectSpecialist: t("parent.complaints.validation.selectSpecialist"),
    selectCategory: t("parent.complaints.validation.selectCategory"),
    descriptionTooShort: t("parent.complaints.validation.descriptionTooShort"),
    descriptionTooLong: t("parent.complaints.validation.descriptionTooLong"),
    noSpecialistAssigned: t("parent.complaints.validation.noSpecialistAssigned"),
    attachmentInvalidType: t("parent.complaints.validation.attachmentInvalidType"),
    attachmentTooLarge: t("parent.complaints.validation.attachmentTooLarge"),
    attachmentPickFailed: t("parent.complaints.validation.attachmentPickFailed"),
    attachmentUploadFailed: t("parent.complaints.validation.attachmentUploadFailed"),
    submitFailed: t("parent.complaints.validation.submitFailed"),
    duplicateActive: t("parent.complaints.validation.duplicateActive"),
    specialistNotAssigned: t("parent.complaints.validation.specialistNotAssigned"),
    childNotAuthorized: t("parent.complaints.validation.childNotAuthorized"),
  };
}

export function mapParentComplaintSubmitErrorLocalized(error, t) {
  const messages = getParentComplaintValidationMessages(t);
  const status = error && typeof error === "object" ? error.status : null;
  const code = error && typeof error === "object" ? error.code : null;
  const message = error instanceof Error ? error.message : (typeof error === "string" ? error : "");

  if (
    status === 409
    || code === "duplicate_active_complaint"
    || message === "duplicate_active_complaint"
  ) {
    return messages.duplicateActive;
  }

  if (message.includes("not assigned")) {
    return messages.specialistNotAssigned;
  }

  if (message.includes("not authorized")) {
    return messages.childNotAuthorized;
  }

  if (message === "submit_failed" || !message.trim()) {
    return messages.submitFailed;
  }

  return message;
}
