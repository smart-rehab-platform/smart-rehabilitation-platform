import { formatParentDate, translateKey } from "./parentLocalizationCore.js";

export const CASE_REQUEST_STATUS_VALUES = [
  "pending",
  "assigned",
  "under_assessment",
  "accepted",
  "rejected",
  "converted_to_patient",
];

export const CASE_REQUEST_SORT_VALUES = ["newest", "oldest", "alphabetical"];
export const PREFERRED_CONTACT_PERIOD_VALUES = ["morning", "afternoon", "evening", "flexible"];
export const CASE_REQUEST_GENDER_VALUES = ["male", "female"];

const STATUS_LABEL_KEY_BY_VALUE = {
  pending: "parent.caseRequests.status.pending",
  assigned: "parent.caseRequests.status.assigned",
  under_assessment: "parent.caseRequests.status.under_assessment",
  accepted: "parent.caseRequests.status.accepted",
  rejected: "parent.caseRequests.status.rejected",
  converted_to_patient: "parent.caseRequests.status.converted_to_patient",
};

const STATUS_SUBTITLE_KEY_BY_VALUE = {
  pending: "parent.caseRequests.statusSubtitle.pending",
  assigned: "parent.caseRequests.statusSubtitle.assigned",
  under_assessment: "parent.caseRequests.statusSubtitle.under_assessment",
  accepted: "parent.caseRequests.statusSubtitle.accepted",
  rejected: "parent.caseRequests.statusSubtitle.rejected",
  converted_to_patient: "parent.caseRequests.statusSubtitle.converted_to_patient",
};

const CASE_REQUEST_CATEGORY_KEY_BY_NAME = {
  "speech and language therapy": "parent.caseRequests.categories.speechAndLanguageTherapy",
  "speech therapy": "parent.caseRequests.categories.speechAndLanguageTherapy",
  "behavioral therapy": "parent.caseRequests.categories.behavioralTherapy",
  "occupational therapy": "parent.caseRequests.categories.occupationalTherapy",
  "learning difficulties": "parent.caseRequests.categories.learningDifficulties",
  "autism support": "parent.caseRequests.categories.autismSupport",
  "developmental delay": "parent.caseRequests.categories.developmentalDelay",
  "motor rehabilitation": "parent.caseRequests.categories.motorRehabilitation",
};

const EN_CASE_REQUEST_CATEGORY_LABEL = {
  "speech and language therapy": "Speech and Language Therapy",
  "speech therapy": "Speech and Language Therapy",
  "behavioral therapy": "Behavioral Therapy",
  "occupational therapy": "Occupational Therapy",
  "learning difficulties": "Learning Difficulties",
  "autism support": "Autism Support",
  "developmental delay": "Developmental Delay",
  "motor rehabilitation": "Motor Rehabilitation",
};

function normalizeCaseRequestCategoryName(name) {
  return typeof name === "string" ? name.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

const EN_STATUS_LABEL = {
  pending: "Pending Review",
  assigned: "Specialist Assigned",
  under_assessment: "Under Assessment",
  accepted: "Accepted",
  rejected: "Rejected",
  converted_to_patient: "Profile Created",
};

const EN_STATUS_SUBTITLE = {
  pending: "Waiting for admin review.",
  assigned: "Specialist assigned; review starting.",
  under_assessment: "Specialist is assessing the case.",
  accepted: "Case accepted; profile may be created soon.",
  rejected: "Request not accepted. See reason below.",
  converted_to_patient: "The case was accepted and the patient profile was created.",
};

export function getCaseRequestCategoryLabel(name, t = null) {
  const rawName = typeof name === "string" ? name.trim() : "";
  if (!rawName) {
    return getDefaultCategoryLabel(t);
  }

  const normalized = normalizeCaseRequestCategoryName(rawName);
  const key = CASE_REQUEST_CATEGORY_KEY_BY_NAME[normalized];
  if (key) {
    return translateKey(t, key, EN_CASE_REQUEST_CATEGORY_LABEL[normalized] || rawName);
  }

  return rawName;
}

export function getCaseRequestStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = STATUS_LABEL_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_STATUS_LABEL[normalized]);
  }
  return normalized || translateKey(t, "parent.caseRequests.status.pending", "Pending Review");
}

export function getCaseRequestStatusSubtitle(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = STATUS_SUBTITLE_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_STATUS_SUBTITLE[normalized]);
  }
  return "";
}

export function buildCaseRequestStatusFilterOptions(t) {
  return [
    { id: "all", label: translateKey(t, "parent.common.filters.allStatuses", "All statuses") },
    ...CASE_REQUEST_STATUS_VALUES.map((id) => ({
      id,
      label: getCaseRequestStatusLabel(id, t),
    })),
  ];
}

export function buildCaseRequestSortOptions(t) {
  return [
    { id: "newest", label: translateKey(t, "parent.common.sort.newest", "Newest first") },
    { id: "oldest", label: translateKey(t, "parent.common.sort.oldest", "Oldest first") },
    { id: "alphabetical", label: translateKey(t, "parent.common.sort.alphabetical", "Alphabetical") },
  ];
}

export function buildPreferredContactPeriodOptions(t) {
  return PREFERRED_CONTACT_PERIOD_VALUES.map((value) => ({
    value,
    label: translateKey(t, `parent.caseRequests.contactPeriod.${value}`, value.charAt(0).toUpperCase() + value.slice(1)),
  }));
}

export function buildCaseRequestGenderOptions(t) {
  return CASE_REQUEST_GENDER_VALUES.map((value) => ({
    value,
    label: translateKey(t, `parent.caseRequests.gender.${value}`, value === "male" ? "Male" : "Female"),
  }));
}

export function formatCaseRequestSubmittedDate(value, locale = "en", t = null) {
  return formatParentDate(value, locale, t);
}

export function getCaseRequestsEmptyMessage(t) {
  return translateKey(t, "parent.caseRequests.empty.none", "You have not submitted any case requests yet.");
}

export function getCaseRequestsFilteredEmptyMessage(t) {
  return translateKey(t, "parent.caseRequests.empty.filtered", "No case requests match your search or filters.");
}

export function getDefaultChildLabel(t) {
  return translateKey(t, "parent.common.child", "Child");
}

export function getDefaultCategoryLabel(t) {
  return translateKey(t, "parent.caseRequests.categoryField", "Category");
}

/** @deprecated Use buildCaseRequestStatusFilterOptions(t) */
export const CASE_REQUEST_STATUS_FILTER_OPTIONS = buildCaseRequestStatusFilterOptions(null);

/** @deprecated Use buildCaseRequestSortOptions(t) */
export const CASE_REQUEST_SORT_OPTIONS = buildCaseRequestSortOptions(null);

/** @deprecated Use buildPreferredContactPeriodOptions(t) */
export const PREFERRED_CONTACT_PERIODS = buildPreferredContactPeriodOptions(null);

/** @deprecated Use buildCaseRequestGenderOptions(t) */
export const CASE_REQUEST_GENDER_OPTIONS = buildCaseRequestGenderOptions(null);

/** @deprecated Use getCaseRequestsEmptyMessage(t) */
export const CASE_REQUESTS_EMPTY_MESSAGE = getCaseRequestsEmptyMessage(null);

/** @deprecated Use getCaseRequestsFilteredEmptyMessage(t) */
export const CASE_REQUESTS_FILTERED_EMPTY_MESSAGE = getCaseRequestsFilteredEmptyMessage(null);
