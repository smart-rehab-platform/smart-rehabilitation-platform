import { resolveUploadedAssetUrl } from "../../../services/apiConfig.js";
import { getPatientInitials, resolveProfileImageUrl } from "./adminPatientsMappers.js";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const CASE_INTAKE_STATUS_VALUES = [
  "pending",
  "assigned",
  "under_assessment",
  "accepted",
  "rejected",
  "converted_to_patient",
];

export const CASE_INTAKE_STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "under_assessment", label: "Under Assessment" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "converted_to_patient", label: "Converted to Patient" },
];

export const CASE_INTAKE_STATUS_CHIP_LABELS = {
  pending: "Pending Review",
  assigned: "Specialist Assigned",
  under_assessment: "Under Assessment",
  accepted: "Accepted",
  rejected: "Rejected",
  converted_to_patient: "Profile Created",
};

export const PREFERRED_CONTACT_PERIOD_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  flexible: "Flexible",
};

const NOT_PROVIDED = "Not provided";

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readBoolean(record, keys) {
  if (!record || typeof record !== "object") {
    return false;
  }

  for (const key of keys) {
    if (record[key] === true) {
      return true;
    }
  }

  return false;
}

function readNumber(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export function extractDateOnlyParts(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = DATE_ONLY_PATTERN.exec(trimmed);
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function formatAdminDateOnlyLabel(value) {
  const parts = extractDateOnlyParts(value);
  if (!parts) {
    return null;
  }

  const date = new Date(parts.year, parts.month - 1, parts.day);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatAdminDateTimeLabel(value) {
  if (value == null || value === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatAdminDateLabel(value) {
  const dateOnly = formatAdminDateOnlyLabel(value);
  if (dateOnly) {
    return dateOnly;
  }

  return formatAdminDateTimeLabel(value);
}

export function calculateAgeFromDateOfBirth(value) {
  const parts = extractDateOnlyParts(value);
  if (!parts) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parts.year;
  const monthDiff = (today.getMonth() + 1) - parts.month;
  const dayDiff = today.getDate() - parts.day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function formatGenderLabel(value) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "male" || normalized === "m") {
    return "Male";
  }
  if (normalized === "female" || normalized === "f") {
    return "Female";
  }
  if (!normalized) {
    return NOT_PROVIDED;
  }
  return value.trim();
}

export function formatPreferredContactPeriod(value) {
  const normalized = (value || "").trim().toLowerCase();
  return PREFERRED_CONTACT_PERIOD_LABELS[normalized] || NOT_PROVIDED;
}

export function formatBooleanYesNo(value) {
  return value ? "Yes" : "No";
}

export function formatCaseIntakeStatusLabel(status) {
  return CASE_INTAKE_STATUS_CHIP_LABELS[status] || status || "Unknown";
}

export function getCaseIntakeStatusTone(status) {
  switch (status) {
    case "pending":
      return "warning";
    case "assigned":
      return "blue";
    case "under_assessment":
      return "blue";
    case "accepted":
      return "success";
    case "rejected":
      return "danger";
    case "converted_to_patient":
      return "success";
    default:
      return "muted";
  }
}

export function formatAttachmentCount(count) {
  const value = Number(count) || 0;
  return value === 1 ? "1 attachment" : `${value} attachments`;
}

export function formatShortRequestId(id) {
  const normalized = (id || "").trim();
  if (!normalized) {
    return "—";
  }
  return normalized.slice(0, 8);
}

function mapCategory(row) {
  const category = row?.category && typeof row.category === "object" ? row.category : null;
  const id = readString(category, ["id", "_id"]) || readString(row, ["category_id", "categoryId"]);
  const name = readString(category, ["name"]) || readString(row, ["category_name", "categoryName"]);

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name: name || "Category",
  };
}

function mapParentSummary(row) {
  const parent = row?.parent && typeof row.parent === "object" ? row.parent : null;
  if (!parent) {
    return null;
  }

  const fullName = readString(parent, ["full_name", "fullName", "name"]) || "Parent";
  return {
    id: readString(parent, ["id", "_id"]),
    fullName,
    email: readString(parent, ["email"]) || null,
    phone: readString(parent, ["phone"]) || null,
    profileImageUrl: resolveProfileImageUrl(
      readString(parent, ["profile_image_url", "profileImageUrl"]),
    ),
    initials: getPatientInitials(fullName),
  };
}

function mapAssignedSpecialist(row) {
  const specialist = row?.assigned_specialist && typeof row.assigned_specialist === "object"
    ? row.assigned_specialist
    : null;

  if (!specialist) {
    return null;
  }

  const fullName = readString(specialist, ["full_name", "fullName", "name"]) || "Specialist";
  return {
    id: readString(specialist, ["id", "_id"]),
    fullName,
    specialization: readString(specialist, ["specialization"]) || null,
    email: readString(specialist, ["email"]) || null,
    profileImageUrl: resolveProfileImageUrl(
      readString(specialist, ["profile_image_url", "profileImageUrl"]),
    ),
    initials: getPatientInitials(fullName),
  };
}

export function resolveCaseAttachmentUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return resolveUploadedAssetUrl(trimmed) ?? trimmed;
  }

  return resolveUploadedAssetUrl(trimmed);
}

function mapAttachment(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const fileUrl = readString(row, ["file_url", "fileUrl"]);
  const fileType = readString(row, ["file_type", "fileType"]);
  const originalName = readString(row, ["original_name", "originalName"]) || "Attachment";

  return {
    id,
    fileUrl,
    resolvedUrl: resolveCaseAttachmentUrl(fileUrl),
    fileType,
    originalName,
    createdAtRaw: readString(row, ["created_at", "createdAt"]),
    isImage: fileType.startsWith("image/"),
    isPdf: fileType === "application/pdf",
  };
}

export function mapAdminCaseInboxItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = readString(row, ["status"]) || "pending";
  const category = mapCategory(row);
  const parent = mapParentSummary(row);
  const assignedSpecialist = mapAssignedSpecialist(row);
  const childName = readString(row, ["child_name", "childName"]) || "Child";
  const submittedAtRaw = readString(row, ["submitted_at", "submittedAt", "created_at", "createdAt"]);

  return {
    id,
    childName,
    status,
    statusLabel: formatCaseIntakeStatusLabel(status),
    statusTone: getCaseIntakeStatusTone(status),
    categoryId: category?.id ?? "",
    categoryName: category?.name ?? "—",
    parentName: parent?.fullName ?? "—",
    parentId: parent?.id ?? "",
    submittedAtRaw,
    submittedLabel: formatAdminDateLabel(submittedAtRaw) || "—",
    attachmentCount: readNumber(row, ["attachment_count", "attachmentCount"]) ?? 0,
    attachmentCountLabel: formatAttachmentCount(readNumber(row, ["attachment_count", "attachmentCount"]) ?? 0),
    assignedSpecialistName: assignedSpecialist?.fullName ?? null,
  };
}

export function mapAdminCaseRequestDetail(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = readString(row, ["status"]) || "pending";
  const category = mapCategory(row);
  const parent = mapParentSummary(row);
  const assignedSpecialist = mapAssignedSpecialist(row);
  const childName = readString(row, ["child_name", "childName"]) || "Child";
  const dateOfBirthRaw = readString(row, ["date_of_birth", "dateOfBirth"]);
  const submittedAtRaw = readString(row, ["submitted_at", "submittedAt", "created_at", "createdAt"]);
  const assignedAtRaw = readString(row, ["assigned_at", "assignedAt"]);
  const acceptedAtRaw = readString(row, ["accepted_at", "acceptedAt"]);
  const convertedAtRaw = readString(row, ["converted_at", "convertedAt"]);
  const hasPreviousDiagnosis = readBoolean(row, ["has_previous_diagnosis", "hasPreviousDiagnosis"]);
  const isCurrentlyReceivingTreatment = readBoolean(row, [
    "is_currently_receiving_treatment",
    "isCurrentlyReceivingTreatment",
  ]);
  const preferredContactPeriodRaw = readString(row, [
    "preferred_contact_period",
    "preferredContactPeriod",
  ]);
  const attachments = Array.isArray(row.attachments)
    ? row.attachments.map(mapAttachment).filter(Boolean)
    : [];
  const attachmentCount = readNumber(row, ["attachment_count", "attachmentCount"]) ?? attachments.length;

  return {
    id,
    shortId: formatShortRequestId(id),
    childName,
    status,
    statusLabel: formatCaseIntakeStatusLabel(status),
    statusTone: getCaseIntakeStatusTone(status),
    canAssignSpecialist: status === "pending",
    categoryId: category?.id ?? "",
    categoryName: category?.name ?? "—",
    parent,
    parentName: parent?.fullName ?? "—",
    assignedSpecialist,
    submittedAtRaw,
    submittedLabel: formatAdminDateLabel(submittedAtRaw) || NOT_PROVIDED,
    assignedAtRaw,
    assignedAtLabel: formatAdminDateTimeLabel(assignedAtRaw),
    acceptedAtRaw,
    acceptedAtLabel: formatAdminDateTimeLabel(acceptedAtRaw),
    convertedAtRaw,
    convertedAtLabel: formatAdminDateTimeLabel(convertedAtRaw),
    dateOfBirthRaw,
    dateOfBirthLabel: formatAdminDateOnlyLabel(dateOfBirthRaw) || NOT_PROVIDED,
    age: calculateAgeFromDateOfBirth(dateOfBirthRaw),
    ageLabel: (() => {
      const age = calculateAgeFromDateOfBirth(dateOfBirthRaw);
      return age != null ? `${age} yrs` : NOT_PROVIDED;
    })(),
    genderRaw: readString(row, ["gender"]),
    preferredContactPeriodRaw,
    caseDescription: readString(row, ["case_description", "caseDescription"]) || NOT_PROVIDED,
    observedDifficulties: readString(row, ["observed_difficulties", "observedDifficulties"]) || NOT_PROVIDED,
    hasPreviousDiagnosis,
    hasPreviousDiagnosisLabel: formatBooleanYesNo(hasPreviousDiagnosis),
    previousDiagnosisDetails: readString(row, [
      "previous_diagnosis_details",
      "previousDiagnosisDetails",
    ]) || null,
    isCurrentlyReceivingTreatment,
    isCurrentlyReceivingTreatmentLabel: formatBooleanYesNo(isCurrentlyReceivingTreatment),
    currentTreatmentDetails: readString(row, [
      "current_treatment_details",
      "currentTreatmentDetails",
    ]) || null,
    rejectionReason: readString(row, ["rejection_reason", "rejectionReason"]) || null,
    patientId: readString(row, ["patient_id", "patientId"]) || null,
    assessmentNotes: readString(row, ["assessment_notes", "assessmentNotes"]) || null,
    conversationId: readString(row, ["conversation_id", "conversationId"]) || null,
    attachments,
    attachmentCount,
    attachmentCountLabel: formatAttachmentCount(attachmentCount),
    timelineSteps: buildCaseRequestTimelineSteps({
      status,
      submittedAtRaw,
      assignedAtRaw,
      acceptedAtRaw,
      convertedAtRaw,
    }),
  };
}

export function buildCaseRequestTimelineSteps({
  status,
  submittedAtRaw,
  assignedAtRaw,
  acceptedAtRaw,
  convertedAtRaw,
}) {
  const submittedSubtitle = formatAdminDateTimeLabel(submittedAtRaw);
  const assignedSubtitle = formatAdminDateTimeLabel(assignedAtRaw);
  const acceptedSubtitle = formatAdminDateTimeLabel(acceptedAtRaw);
  const convertedSubtitle = formatAdminDateTimeLabel(convertedAtRaw);
  const inProgressSubtitle = "In progress";

  const steps = [
    { key: "submitted", label: "Submitted" },
    { key: "assigned", label: "Assigned" },
    { key: "underAssessment", label: "Under Assessment" },
    { key: "accepted", label: "Accepted" },
    { key: "converted", label: "Converted" },
  ];

  if (status === "rejected") {
    const assignedCompleted = Boolean(assignedAtRaw);
    return [
      { ...steps[0], state: "completed", subtitle: submittedSubtitle },
      { ...steps[1], state: assignedCompleted ? "completed" : "incomplete", subtitle: assignedCompleted ? assignedSubtitle : null },
      { ...steps[2], state: "incomplete", subtitle: null },
      { ...steps[3], state: "incomplete", subtitle: null },
      { ...steps[4], state: "incomplete", subtitle: null },
    ];
  }

  switch (status) {
    case "assigned":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "current", subtitle: assignedSubtitle },
        { ...steps[2], state: "incomplete", subtitle: null },
        { ...steps[3], state: "incomplete", subtitle: null },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
    case "under_assessment":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "completed", subtitle: assignedSubtitle },
        { ...steps[2], state: "current", subtitle: inProgressSubtitle },
        { ...steps[3], state: "incomplete", subtitle: null },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
    case "accepted":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "completed", subtitle: assignedSubtitle },
        { ...steps[2], state: "completed", subtitle: null },
        { ...steps[3], state: "current", subtitle: acceptedSubtitle },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
    case "converted_to_patient":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "completed", subtitle: assignedSubtitle },
        { ...steps[2], state: "completed", subtitle: null },
        { ...steps[3], state: "completed", subtitle: acceptedSubtitle },
        { ...steps[4], state: "completed", subtitle: convertedSubtitle },
      ];
    case "pending":
    default:
      return [
        { ...steps[0], state: "current", subtitle: submittedSubtitle },
        { ...steps[1], state: "incomplete", subtitle: null },
        { ...steps[2], state: "incomplete", subtitle: null },
        { ...steps[3], state: "incomplete", subtitle: null },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
  }
}

export function mapMatchingSpecialist(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const fullName = readString(row, ["full_name", "fullName", "name"]) || "Specialist";
  const years = readNumber(row, ["years_of_experience", "yearsOfExperience"]);
  const activeCases = readNumber(row, ["active_cases_count", "activeCasesCount"]) ?? 0;
  const currentRequests = readNumber(row, [
    "current_case_requests_count",
    "currentCaseRequestsCount",
  ]) ?? 0;

  return {
    id,
    fullName,
    specialization: readString(row, ["specialization"]) || "—",
    licenseNumber: readString(row, ["license_number", "licenseNumber"]) || null,
    bio: readString(row, ["bio"]) || null,
    yearsOfExperience: years,
    yearsLabel: years == null ? "— Years" : years === 1 ? "1 Year" : `${years} Years`,
    activeCasesCount: activeCases,
    activeCasesLabel: `${activeCases} Active Patients`,
    currentRequestsCount: currentRequests,
    currentRequestsLabel: `${currentRequests} Current Requests`,
    profileImageUrl: resolveProfileImageUrl(
      readString(row, ["profile_image_url", "profileImageUrl"]),
    ),
    initials: getPatientInitials(fullName),
  };
}

export function mapCaseCategoryOption(row) {
  const id = readString(row, ["id", "_id"]);
  const name = readString(row, ["name"]);
  if (!id || !name) {
    return null;
  }

  let isActive = true;
  if (row.is_active === false || row.isActive === false) {
    isActive = false;
  }

  return { id, name, isActive };
}

export function mapInboxPagination(pagination, fallbackLimit = 20) {
  if (!pagination || typeof pagination !== "object") {
    return {
      page: 1,
      limit: fallbackLimit,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
    };
  }

  const page = readNumber(pagination, ["page"]) ?? 1;
  const limit = readNumber(pagination, ["limit"]) ?? fallbackLimit;
  const total = readNumber(pagination, ["total"]) ?? 0;
  const totalPages = readNumber(pagination, ["total_pages", "totalPages"]) ?? 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

export function isStalePendingAssignmentError(message) {
  return (message || "").trim().toLowerCase() === "only pending case requests can be assigned";
}
