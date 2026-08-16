export const CASE_REQUEST_STATUS_ALL = "all";
export const CASE_REQUEST_CATEGORY_ALL = "all";

export {
  CASE_REQUEST_STATUS_FILTER_DEFS,
  CASE_REQUEST_STATUS_FILTERS,
  CASE_REQUEST_STATUS_VALUES,
  applyCaseRequestDetailLocalization,
  applyCaseRequestListItemLocalization,
  buildCaseRequestStatusFilters,
  buildCaseRequestTimelineSteps,
  formatCaseRequestAgeLabel,
  formatCaseRequestAssignedDateLabel,
  formatCaseRequestAttachmentCountLabel,
  formatCaseRequestDisplayDate,
  formatCaseRequestDisplayDateTime,
  formatCaseRequestGenderLabel,
  formatPreferredContactPeriodLabel,
  getCaseRequestAttachmentTypeLabel,
  getCaseRequestCategoryLabel,
  getCaseRequestListEmptyMessage,
  getCaseRequestStatusLabel,
  yesNoLabel,
} from "./specialistCaseRequestsLocalization.js";

import {
  applyCaseRequestDetailLocalization,
  applyCaseRequestListItemLocalization,
  formatCaseRequestAgeLabel,
  formatCaseRequestAssignedDateLabel,
  formatCaseRequestAttachmentCountLabel,
  formatCaseRequestDisplayDate,
  formatCaseRequestDisplayDateTime,
  formatCaseRequestGenderLabel,
  formatPreferredContactPeriodLabel,
  getCaseRequestAttachmentTypeLabel,
  getCaseRequestCategoryLabel,
  getCaseRequestStatusLabel,
} from "./specialistCaseRequestsLocalization.js";

const STATUS_TONES = {
  pending: "warning",
  assigned: "blue",
  under_assessment: "blue",
  accepted: "success",
  rejected: "danger",
  converted_to_patient: "success",
};

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

function readNullableString(record, keys) {
  const value = readString(record, keys);
  return value || null;
}

function parseStatus(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (
    normalized === "pending"
    || normalized === "assigned"
    || normalized === "under_assessment"
    || normalized === "accepted"
    || normalized === "rejected"
    || normalized === "converted_to_patient"
  ) {
    return normalized;
  }
  return "assigned";
}

function parseDate(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCaseRequestDate(value, locale = "en") {
  return formatCaseRequestDisplayDate(value, locale);
}

export function formatCaseRequestDateTime(value, locale = "en") {
  return formatCaseRequestDisplayDateTime(value, locale);
}

export function getCaseRequestStatusChipLabel(status, t = null) {
  return getCaseRequestStatusLabel(status, t);
}

export function getCaseRequestStatusTone(status) {
  return STATUS_TONES[parseStatus(status)] || "blue";
}

export function formatCaseRequestGender(gender, t = null) {
  return formatCaseRequestGenderLabel(gender, t);
}

export function formatPreferredContactPeriod(value, t = null) {
  return formatPreferredContactPeriodLabel(value, t);
}

export function calculateAgeYears(dateOfBirth, now = new Date()) {
  const dob = parseDate(dateOfBirth);
  if (!dob) {
    return null;
  }
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function formatAgeLabel(dateOfBirth, t = null) {
  return formatCaseRequestAgeLabel(dateOfBirth, t);
}

function mapParentSummary(row, { includeContact = false } = {}) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const parent = {
    id: readNullableString(row, ["id", "_id"]),
    fullName: readString(row, ["full_name", "fullName"]) || "Parent",
    profileImageUrl: readNullableString(row, ["profile_image_url", "profileImageUrl"]),
  };
  if (includeContact) {
    parent.email = readNullableString(row, ["email"]);
    parent.phone = readNullableString(row, ["phone"]);
  }
  return parent;
}

function mapCategory(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  return {
    id: readNullableString(row, ["id", "_id"]),
    name: readString(row, ["name", "title"]) || "Category",
    description: readNullableString(row, ["description"]),
    isActive: row.is_active !== false && row.isActive !== false,
  };
}

function guessAttachmentKind(fileType, fileUrl, originalName) {
  const haystack = `${fileType || ""} ${fileUrl || ""} ${originalName || ""}`.toLowerCase();
  if (haystack.includes("pdf") || haystack.endsWith(".pdf")) return "pdf";
  if (haystack.includes("image") || /\.(jpg|jpeg|png|webp|gif)/.test(haystack)) return "image";
  if (haystack.includes("audio") || /\.(mp3|m4a|wav|aac)/.test(haystack)) return "audio";
  if (haystack.includes("video") || /\.(mp4|mov)/.test(haystack)) return "video";
  return "file";
}

export function mapCaseRequestAttachment(row, t = null) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  const fileUrl = readNullableString(row, ["file_url", "fileUrl"]);
  if (!id && !fileUrl) {
    return null;
  }
  const originalName = readNullableString(row, ["original_name", "originalName"]);
  const fileType = readNullableString(row, ["file_type", "fileType"]);
  const kind = guessAttachmentKind(fileType, fileUrl, originalName);

  return {
    id: id || fileUrl,
    fileUrl,
    fileType,
    originalName,
    displayName: originalName || "Attachment",
    kind,
    typeLabel: getCaseRequestAttachmentTypeLabel(kind, fileType, t),
    createdAt: parseDate(row.created_at ?? row.createdAt),
  };
}

export function mapSpecialistCaseRequestListItem(row, context = {}) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = parseStatus(row.status);
  const assignedAt = parseDate(row.assigned_at ?? row.assignedAt);
  const submittedAt = parseDate(row.submitted_at ?? row.submittedAt);
  const attachmentCount = Number(row.attachment_count ?? row.attachmentCount ?? 0) || 0;
  const conversationId = readNullableString(row, ["conversation_id", "conversationId"]);
  const category = mapCategory(row.category);

  const item = {
    id,
    childName: readString(row, ["child_name", "childName"]) || "Unnamed child",
    status,
    statusLabel: getCaseRequestStatusChipLabel(status),
    statusTone: getCaseRequestStatusTone(status),
    category,
    categoryName: category?.name || "",
    parent: mapParentSummary(row.parent),
    parentName: mapParentSummary(row.parent)?.fullName || "",
    assignedAt,
    submittedAt,
    acceptedAt: parseDate(row.accepted_at ?? row.acceptedAt),
    convertedAt: parseDate(row.converted_at ?? row.convertedAt),
    dateLabel: formatCaseRequestAssignedDateLabel(assignedAt, submittedAt),
    attachmentCount,
    attachmentCountLabel: formatCaseRequestAttachmentCountLabel(attachmentCount),
    conversationId,
    conversationAvailable: Boolean(conversationId),
    patientId: readNullableString(row, ["patient_id", "patientId"]),
    dateOfBirth: parseDate(row.date_of_birth ?? row.dateOfBirth),
    gender: readNullableString(row, ["gender"]),
    childImageUrl: readNullableString(row, ["child_image_url", "childImageUrl"]),
  };

  return applyCaseRequestListItemLocalization(item, context);
}

export function mapSpecialistCaseRequestList(rows, context = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => mapSpecialistCaseRequestListItem(row, context)).filter(Boolean);
}

export function mapCaseCategoryItem(row, context = {}) {
  const category = mapCategory(row);
  if (!category?.id) {
    return null;
  }
  return {
    ...category,
    name: getCaseRequestCategoryLabel(category.name, context.t),
  };
}

export function mapCaseCategoryList(rows, context = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((row) => mapCaseCategoryItem(row, context))
    .filter((item) => item && item.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mapSpecialistCaseRequestDetail(row, context = {}) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = parseStatus(row.status);
  const assignedAt = parseDate(row.assigned_at ?? row.assignedAt);
  const submittedAt = parseDate(row.submitted_at ?? row.submittedAt);
  const dateOfBirth = parseDate(row.date_of_birth ?? row.dateOfBirth);
  const attachments = Array.isArray(row.attachments)
    ? row.attachments.map((attachment) => mapCaseRequestAttachment(attachment, context.t)).filter(Boolean)
    : [];
  const parent = mapParentSummary(row.parent, { includeContact: true });
  const category = mapCategory(row.category);
  const hasPreviousDiagnosis = Boolean(
    row.has_previous_diagnosis ?? row.hasPreviousDiagnosis,
  );
  const isCurrentlyReceivingTreatment = Boolean(
    row.is_currently_receiving_treatment ?? row.isCurrentlyReceivingTreatment,
  );

  const detail = {
    id,
    childName: readString(row, ["child_name", "childName"]) || "Unnamed child",
    status,
    statusLabel: getCaseRequestStatusChipLabel(status, context.t),
    statusTone: getCaseRequestStatusTone(status),
    category,
    categoryName: category?.name || "",
    parent,
    parentName: parent?.fullName || "",
    parentId: readNullableString(row, ["parent_id", "parentId"]) || parent?.id || null,
    assignedSpecialistId: readNullableString(row, ["assigned_specialist_id", "assignedSpecialistId"]),
    assignedAt,
    submittedAt,
    acceptedAt: parseDate(row.accepted_at ?? row.acceptedAt),
    convertedAt: parseDate(row.converted_at ?? row.convertedAt),
    headerDateLabel: formatCaseRequestAssignedDateLabel(assignedAt, submittedAt),
    dateOfBirth,
    dateOfBirthLabel: formatCaseRequestDate(dateOfBirth) || "Not provided",
    ageLabel: formatAgeLabel(dateOfBirth, context.t),
    gender: readNullableString(row, ["gender"]),
    genderLabel: formatCaseRequestGender(row.gender, context.t),
    childImageUrl: readNullableString(row, ["child_image_url", "childImageUrl"]),
    caseDescription: readNullableString(row, ["case_description", "caseDescription"]),
    observedDifficulties: readNullableString(row, ["observed_difficulties", "observedDifficulties"]),
    preferredContactPeriod: readNullableString(row, ["preferred_contact_period", "preferredContactPeriod"]),
    preferredContactPeriodLabel: formatPreferredContactPeriod(
      row.preferred_contact_period ?? row.preferredContactPeriod,
      context.t,
    ),
    hasPreviousDiagnosis,
    previousDiagnosisDetails: readNullableString(row, [
      "previous_diagnosis_details",
      "previousDiagnosisDetails",
    ]),
    isCurrentlyReceivingTreatment,
    currentTreatmentDetails: readNullableString(row, [
      "current_treatment_details",
      "currentTreatmentDetails",
    ]),
    assessmentNotes: readNullableString(row, ["assessment_notes", "assessmentNotes"]) || "",
    rejectionReason: readNullableString(row, ["rejection_reason", "rejectionReason"]),
    attachments,
    attachmentCount: attachments.length
      || Number(row.attachment_count ?? row.attachmentCount ?? 0)
      || 0,
    conversationId: readNullableString(row, ["conversation_id", "conversationId"]),
    patientId: readNullableString(row, ["patient_id", "patientId"]),
    canStartAssessment: status === "assigned",
    canEditAssessmentNotes: status === "under_assessment",
    canAcceptOrReject: status === "under_assessment",
    isConverted: status === "converted_to_patient",
    isRejected: status === "rejected",
    showReadOnlyNotes: status !== "assigned"
      && status !== "under_assessment"
      && Boolean(readNullableString(row, ["assessment_notes", "assessmentNotes"])),
  };

  return applyCaseRequestDetailLocalization(detail, context);
}
