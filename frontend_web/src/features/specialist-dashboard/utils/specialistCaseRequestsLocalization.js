import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

export const CASE_REQUEST_STATUS_ALL = "all";
export const CASE_REQUEST_CATEGORY_ALL = "all";

export const CASE_REQUEST_STATUS_VALUES = [
  "pending",
  "assigned",
  "under_assessment",
  "accepted",
  "rejected",
  "converted_to_patient",
];

export const CASE_REQUEST_STATUS_FILTER_DEFS = [
  { id: CASE_REQUEST_STATUS_ALL, apiValue: null },
  { id: "assigned", apiValue: "assigned" },
  { id: "under_assessment", apiValue: "under_assessment" },
  { id: "accepted", apiValue: "accepted" },
  { id: "converted_to_patient", apiValue: "converted_to_patient" },
  { id: "rejected", apiValue: "rejected" },
];

const STATUS_LABEL_KEY_BY_VALUE = {
  pending: "specialist.caseRequests.status.pending",
  assigned: "specialist.caseRequests.status.assigned",
  under_assessment: "specialist.caseRequests.status.under_assessment",
  accepted: "specialist.caseRequests.status.accepted",
  rejected: "specialist.caseRequests.status.rejected",
  converted_to_patient: "specialist.caseRequests.status.converted_to_patient",
};

const EN_STATUS_LABEL = {
  pending: "Pending Review",
  assigned: "Specialist Assigned",
  under_assessment: "Under Assessment",
  accepted: "Accepted",
  rejected: "Rejected",
  converted_to_patient: "Profile Created",
};

const CASE_REQUEST_CATEGORY_KEY_BY_NAME = {
  "speech and language therapy": "specialist.caseRequests.category.speechAndLanguageTherapy",
  "speech therapy": "specialist.caseRequests.category.speechAndLanguageTherapy",
  "behavioral therapy": "specialist.caseRequests.category.behavioralTherapy",
  "occupational therapy": "specialist.caseRequests.category.occupationalTherapy",
  "learning difficulties": "specialist.caseRequests.category.learningDifficulties",
  "autism support": "specialist.caseRequests.category.autismSupport",
  "developmental delay": "specialist.caseRequests.category.developmentalDelay",
  "motor rehabilitation": "specialist.caseRequests.category.motorRehabilitation",
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

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

function normalizeCaseRequestCategoryName(name) {
  return typeof name === "string" ? name.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

export function formatCaseRequestDisplayDate(value, locale = "en") {
  return formatAppDate(value, locale);
}

export function formatCaseRequestDisplayDateTime(value, locale = "en") {
  const formatted = formatAppDateTime(value, locale);
  if (!formatted) {
    return null;
  }
  return formatted.replace(", ", " · ");
}

export function getCaseRequestStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = STATUS_LABEL_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_STATUS_LABEL[normalized]);
  }
  return translateKey(t, "specialist.caseRequests.status.assigned", "Specialist Assigned");
}

export function getCaseRequestCategoryLabel(name, t = null) {
  const rawName = typeof name === "string" ? name.trim() : "";
  if (!rawName) {
    return translateKey(t, "specialist.caseRequests.category.default", "Category");
  }

  const normalized = normalizeCaseRequestCategoryName(rawName);
  const key = CASE_REQUEST_CATEGORY_KEY_BY_NAME[normalized];
  if (key) {
    return translateKey(t, key, EN_CASE_REQUEST_CATEGORY_LABEL[normalized] || rawName);
  }

  return rawName;
}

export function buildCaseRequestStatusFilters(t = null) {
  return CASE_REQUEST_STATUS_FILTER_DEFS.map((def) => ({
    ...def,
    label: def.id === CASE_REQUEST_STATUS_ALL
      ? translateKey(t, "specialist.caseRequests.filters.allStatuses", "All Statuses")
      : getCaseRequestStatusLabel(def.id, t),
  }));
}

export function formatCaseRequestAssignedDateLabel(assignedAt, submittedAt, locale = "en", t = null) {
  if (assignedAt) {
    const date = formatCaseRequestDisplayDate(assignedAt, locale);
    return translateKey(t, "specialist.caseRequests.assignedOn", "Assigned {date}", { date });
  }
  if (submittedAt) {
    const date = formatCaseRequestDisplayDate(submittedAt, locale);
    return translateKey(t, "specialist.caseRequests.submittedOn", "Submitted {date}", { date });
  }
  return translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function formatCaseRequestAttachmentCountLabel(count, t = null) {
  if (count === 1) {
    return translateKey(t, "specialist.caseRequests.oneAttachment", "1 attachment");
  }
  return translateKey(t, "specialist.caseRequests.attachmentCount", "{count} attachments", { count });
}

export function formatCaseRequestGenderLabel(gender, t = null) {
  const normalized = typeof gender === "string" ? gender.trim().toLowerCase() : "";
  if (normalized === "male") {
    return translateKey(t, "specialist.caseRequests.gender.male", "Male");
  }
  if (normalized === "female") {
    return translateKey(t, "specialist.caseRequests.gender.female", "Female");
  }
  if (normalized === "other") {
    return translateKey(t, "specialist.caseRequests.gender.other", "Other");
  }
  if (typeof gender === "string" && gender.trim()) {
    return gender.trim();
  }
  return translateKey(t, "specialist.caseRequests.notProvided", "Not provided");
}

export function formatPreferredContactPeriodLabel(value, t = null) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  switch (normalized) {
    case "morning":
      return translateKey(t, "specialist.caseRequests.contactPeriod.morning", "Morning");
    case "afternoon":
      return translateKey(t, "specialist.caseRequests.contactPeriod.afternoon", "Afternoon");
    case "evening":
      return translateKey(t, "specialist.caseRequests.contactPeriod.evening", "Evening");
    case "flexible":
      return translateKey(t, "specialist.caseRequests.contactPeriod.flexible", "Flexible");
    default:
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
      return translateKey(t, "specialist.caseRequests.notProvided", "Not provided");
  }
}

export function formatCaseRequestAgeLabel(dateOfBirth, t = null) {
  if (!dateOfBirth) {
    return translateKey(t, "specialist.caseRequests.age.unavailable", "Unavailable");
  }

  const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return translateKey(t, "specialist.caseRequests.age.unavailable", "Unavailable");
  }

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  if (age < 0) {
    return translateKey(t, "specialist.caseRequests.age.unavailable", "Unavailable");
  }
  if (age === 1) {
    return translateKey(t, "specialist.caseRequests.age.oneYear", "1 year");
  }
  return translateKey(t, "specialist.caseRequests.age.years", "{count} years", { count: age });
}

export function getCaseRequestAttachmentTypeLabel(kind, fileType, t = null) {
  if (kind === "pdf") return "PDF";
  if (kind === "image") {
    return translateKey(t, "specialist.caseRequests.attachmentType.image", "Image");
  }
  if (kind === "audio") {
    return translateKey(t, "specialist.caseRequests.attachmentType.audio", "Audio");
  }
  if (kind === "video") {
    return translateKey(t, "specialist.caseRequests.attachmentType.video", "Video");
  }
  return fileType || translateKey(t, "specialist.caseRequests.attachmentType.file", "File");
}

export function yesNoLabel(value, t = null) {
  return value
    ? translateKey(t, "specialist.caseRequests.yes", "Yes")
    : translateKey(t, "specialist.caseRequests.no", "No");
}

export function getCaseRequestListEmptyMessage({ hasItems, hasFilters }, t = null) {
  if (!hasItems && hasFilters) {
    return translateKey(
      t,
      "specialist.caseRequests.empty.filtered",
      "No case requests match the selected filters.",
    );
  }
  if (!hasItems) {
    return translateKey(
      t,
      "specialist.caseRequests.empty.none",
      "No assigned case requests yet. Assigned cases will appear here after an admin selects you for a request.",
    );
  }
  return null;
}

export function buildCaseRequestTimelineSteps(detail, context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  const status = detail?.status || "assigned";
  const assignedLabel = formatCaseRequestDisplayDateTime(detail?.assignedAt, locale);
  const acceptedLabel = formatCaseRequestDisplayDateTime(detail?.acceptedAt, locale);
  const convertedLabel = formatCaseRequestDisplayDateTime(detail?.convertedAt, locale);
  const inProgress = translateKey(
    t,
    "specialist.caseRequests.timeline.inProgress",
    "In progress",
  );

  const base = [
    {
      id: "assigned",
      title: translateKey(t, "specialist.caseRequests.timeline.assigned", "Assigned"),
    },
    {
      id: "under_assessment",
      title: translateKey(t, "specialist.caseRequests.timeline.underAssessment", "Under Assessment"),
    },
    {
      id: "accepted",
      title: translateKey(t, "specialist.caseRequests.timeline.accepted", "Accepted"),
    },
    {
      id: "converted",
      title: translateKey(t, "specialist.caseRequests.timeline.converted", "Converted"),
    },
  ];

  const withStates = (states, subtitles = {}) => base.map((step, index) => ({
    ...step,
    state: states[index] || "upcoming",
    subtitle: subtitles[step.id] || null,
  }));

  if (status === "rejected") {
    return withStates(
      ["completed", "upcoming", "upcoming", "upcoming"],
      { assigned: assignedLabel },
    );
  }
  if (status === "under_assessment") {
    return withStates(
      ["completed", "current", "upcoming", "upcoming"],
      { assigned: assignedLabel, under_assessment: inProgress },
    );
  }
  if (status === "accepted") {
    return withStates(
      ["completed", "completed", "current", "upcoming"],
      { assigned: assignedLabel, accepted: acceptedLabel },
    );
  }
  if (status === "converted_to_patient") {
    return withStates(
      ["completed", "completed", "completed", "completed"],
      {
        assigned: assignedLabel,
        accepted: acceptedLabel,
        converted: convertedLabel,
      },
    );
  }
  return withStates(
    ["current", "upcoming", "upcoming", "upcoming"],
    { assigned: assignedLabel },
  );
}

export function applyCaseRequestListItemLocalization(item, context = {}) {
  if (!item) {
    return item;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  return {
    ...item,
    statusLabel: getCaseRequestStatusLabel(item.status, t),
    categoryName: getCaseRequestCategoryLabel(item.category?.name || item.categoryName, t),
    dateLabel: formatCaseRequestAssignedDateLabel(item.assignedAt, item.submittedAt, locale, t),
    attachmentCountLabel: formatCaseRequestAttachmentCountLabel(item.attachmentCount, t),
  };
}

export function applyCaseRequestDetailLocalization(detail, context = {}) {
  if (!detail) {
    return detail;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  const categoryName = getCaseRequestCategoryLabel(detail.category?.name || detail.categoryName, t);
  const category = detail.category
    ? { ...detail.category, name: categoryName }
    : detail.category;

  const attachments = (detail.attachments || []).map((attachment) => ({
    ...attachment,
    typeLabel: getCaseRequestAttachmentTypeLabel(attachment.kind, attachment.fileType, t),
  }));

  const localized = {
    ...detail,
    statusLabel: getCaseRequestStatusLabel(detail.status, t),
    category,
    categoryName,
    headerDateLabel: formatCaseRequestAssignedDateLabel(
      detail.assignedAt,
      detail.submittedAt,
      locale,
      t,
    ),
    dateOfBirthLabel: formatCaseRequestDisplayDate(detail.dateOfBirth, locale)
      || translateKey(t, "specialist.caseRequests.notProvided", "Not provided"),
    ageLabel: formatCaseRequestAgeLabel(detail.dateOfBirth, t),
    genderLabel: formatCaseRequestGenderLabel(detail.gender, t),
    preferredContactPeriodLabel: formatPreferredContactPeriodLabel(detail.preferredContactPeriod, t),
    attachments,
  };

  localized.timelineSteps = buildCaseRequestTimelineSteps(localized, context);
  return localized;
}

/** @deprecated Use buildCaseRequestStatusFilters(t) */
export const CASE_REQUEST_STATUS_FILTERS = buildCaseRequestStatusFilters(null);
