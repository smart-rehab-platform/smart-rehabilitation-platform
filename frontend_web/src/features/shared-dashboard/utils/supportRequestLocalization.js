import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";

export const SUPPORT_REQUEST_STATUS_VALUES = ["pending", "in_progress", "resolved"];

export const SUPPORT_REQUEST_STATUS_TONES = {
  pending: "warning",
  in_progress: "blue",
  resolved: "success",
};

export const SUPPORT_REQUEST_CATEGORY_VALUES = [
  "technical_issue",
  "patient_case_issue",
  "session_scheduling_issue",
  "account_profile_issue",
  "exercise_content_issue",
  "other",
];

const SUPPORT_REQUEST_STATUS_KEY_BY_VALUE = {
  pending: "supportRequests.status.pending",
  in_progress: "supportRequests.status.inProgress",
  resolved: "supportRequests.status.resolved",
};

const SUPPORT_REQUEST_CATEGORY_KEY_BY_VALUE = {
  technical_issue: "supportRequests.category.technicalIssue",
  patient_case_issue: "supportRequests.category.patientCaseIssue",
  session_scheduling_issue: "supportRequests.category.sessionSchedulingIssue",
  account_profile_issue: "supportRequests.category.accountProfileIssue",
  exercise_content_issue: "supportRequests.category.exerciseContentIssue",
  other: "supportRequests.category.other",
};

const EN_FALLBACK = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  technical_issue: "Technical Issue",
  patient_case_issue: "Patient / Case Issue",
  session_scheduling_issue: "Session / Scheduling Issue",
  account_profile_issue: "Account / Profile Issue",
  exercise_content_issue: "Exercise / Content Issue",
  other: "Other",
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

function formatUnavailableDate(t) {
  return translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function getSupportRequestStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = SUPPORT_REQUEST_STATUS_KEY_BY_VALUE[normalized];

  if (key) {
    return translateKey(t, key, EN_FALLBACK[normalized]);
  }

  return normalized || translateKey(t, "supportRequests.status.unknown", "Unknown");
}

export function getSupportRequestStatusTone(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return SUPPORT_REQUEST_STATUS_TONES[normalized] || "neutral";
}

export function getSupportRequestCategoryLabel(category, t = null) {
  const normalized = typeof category === "string" ? category.trim().toLowerCase() : "";
  const key = SUPPORT_REQUEST_CATEGORY_KEY_BY_VALUE[normalized];

  if (key) {
    return translateKey(t, key, EN_FALLBACK[normalized]);
  }

  return normalized || translateKey(t, "supportRequests.category.other", "Other");
}

export function buildSupportRequestStatusFilterOptions(t) {
  return SUPPORT_REQUEST_STATUS_VALUES.map((value) => ({
    value,
    label: getSupportRequestStatusLabel(value, t),
  }));
}

export function buildSupportRequestCategoryFilterOptions(t) {
  return SUPPORT_REQUEST_CATEGORY_VALUES.map((value) => ({
    value,
    label: getSupportRequestCategoryLabel(value, t),
  }));
}

export function buildSupportRequestCategoryFormOptions(t) {
  return buildSupportRequestCategoryFilterOptions(t);
}

export function formatSupportRequestDateTime(value, locale = "en", t = null) {
  const formatted = formatAppDateTime(value, locale);
  return formatted ?? formatUnavailableDate(t);
}

export function formatSupportRequestDate(value, locale = "en", t = null) {
  const formatted = formatAppDate(value, locale);
  return formatted ?? formatUnavailableDate(t);
}

export function translateSupportRequestKey(t, key, fallback) {
  return translateKey(t, key, fallback);
}
