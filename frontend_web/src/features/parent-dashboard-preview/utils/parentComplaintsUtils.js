import { resolveUploadedAssetUrl } from "../../../services/apiConfig.js";
import { readString } from "./parentDashboardMappers";
import {
  buildParentComplaintCategoryOptions,
  COMPLAINT_CATEGORY_VALUES,
  formatParentComplaintDateTime,
  getParentComplaintCategoryLabel,
  getParentComplaintStatusLabel,
  getParentComplaintStatusTone,
  getParentComplaintValidationMessages,
  mapParentComplaintSubmitErrorLocalized,
} from "./parentComplaintsLocalization.js";

export {
  buildParentComplaintCategoryOptions,
  COMPLAINT_CATEGORY_VALUES,
  formatParentComplaintDateTime,
  getParentComplaintCategoryLabel,
  getParentComplaintStatusLabel,
  getParentComplaintStatusTone,
  getParentComplaintValidationMessages,
  mapParentComplaintSubmitErrorLocalized,
};

/** @deprecated Use buildParentComplaintCategoryOptions(t) */
export const COMPLAINT_CATEGORY_OPTIONS = buildParentComplaintCategoryOptions(null);

export function isComplaintAttachmentPdf(url) {
  return typeof url === "string" && url.toLowerCase().includes(".pdf");
}

export {
  formatParentComplaintDateTime as formatComplaintDateTimeLabel,
  formatParentComplaintDateTime as formatComplaintSubmittedLabel,
  getParentComplaintStatusLabel as getComplaintStatusLabel,
  getParentComplaintStatusTone as getComplaintStatusTone,
};

/** Matches backend Joi + Flutter validation. */
export const COMPLAINT_DESCRIPTION_MIN_LENGTH = 20;
export const COMPLAINT_DESCRIPTION_MAX_LENGTH = 1000;

/** Matches backend complaintAttachments.js */
export const COMPLAINT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const COMPLAINT_ATTACHMENT_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

const COMPLAINT_ATTACHMENT_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
]);

const COMPLAINT_ATTACHMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

/** @deprecated Use t("parent.complaints.empty") */
export const COMPLAINTS_EMPTY_MESSAGE =
  "You have not submitted any complaints yet. Use Report a Specialist when you need administration review.";

/** @deprecated Use getParentComplaintValidationMessages(t) */
export const COMPLAINT_VALIDATION_MESSAGES = getParentComplaintValidationMessages(() => "");

function readDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (value == null || value === "") {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapPerson(record, fallbackIdKeys = []) {
  if (!record || typeof record !== "object") {
    return { id: "", fullName: "" };
  }

  return {
    id: readString(record, ["id", ...fallbackIdKeys]),
    fullName: readString(record, ["fullName", "full_name", "name"]),
  };
}

function resolveAttachmentUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  return resolveUploadedAssetUrl(trimmed) ?? trimmed;
}

function truncateDescription(description, maxLength = 140) {
  if (!description || description.length <= maxLength) {
    return description || "";
  }

  return `${description.slice(0, maxLength - 1).trim()}…`;
}

export function mapPatientSpecialistLink(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const specialistId = readString(row, ["specialist_id", "specialistId", "id"]);
  if (!specialistId) {
    return null;
  }

  const fullName = readString(row, ["full_name", "fullName", "name"]);
  const isPrimary = row.is_primary === true || row.isPrimary === true;

  return {
    specialistId,
    specialistName: fullName || "Specialist",
    isPrimary,
  };
}

export function mapPatientSpecialistLinks(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapPatientSpecialistLink).filter(Boolean);
}

/**
 * Mirrors Flutter auto-selection: single specialist or primary, else first.
 */
export function pickDefaultSpecialist(specialists) {
  if (!Array.isArray(specialists) || specialists.length === 0) {
    return null;
  }

  if (specialists.length === 1) {
    return specialists[0];
  }

  return specialists.find((item) => item.isPrimary) || specialists[0];
}

export function mapParentComplaintListItem(row, options = {}) {
  const { t, locale = "en" } = typeof options === "object" ? options : { t: null, locale: "en" };
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id"]);
  if (!id) {
    return null;
  }

  const patient = mapPerson(row.patient, ["patient_id"]);
  const specialist = mapPerson(row.specialist, ["specialist_id"]);
  const category = readString(row, ["category"]).toLowerCase() || "other";
  const status = readString(row, ["status"]).toLowerCase() || "pending";
  const description = readString(row, ["description"]) || "";

  return {
    id,
    patientId: patient.id || readString(row, ["patient_id", "patientId"]),
    patientName: patient.fullName || "—",
    specialistId: specialist.id || readString(row, ["specialist_id", "specialistId"]),
    specialistName: specialist.fullName || "—",
    category,
    categoryLabel: getParentComplaintCategoryLabel(category, t),
    status,
    statusLabel: getParentComplaintStatusLabel(status, t),
    statusTone: getParentComplaintStatusTone(status),
    description,
    descriptionPreview: truncateDescription(description),
    createdAt: readDate(row.created_at ?? row.createdAt),
    submittedLabel: formatParentComplaintDateTime(row.created_at ?? row.createdAt, locale, t),
  };
}

export function mapParentComplaints(rows, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => mapParentComplaintListItem(row, options)).filter(Boolean);
}

export function mapParentComplaintDetails(row, options = {}) {
  const { t, locale = "en" } = typeof options === "object" ? options : { t: null, locale: "en" };
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id"]);
  if (!id) {
    return null;
  }

  const patient = mapPerson(row.patient, ["patient_id"]);
  const specialist = mapPerson(row.specialist, ["specialist_id"]);
  const category = readString(row, ["category"]).toLowerCase() || "other";
  const status = readString(row, ["status"]).toLowerCase() || "pending";
  const attachmentUrl = readString(row, ["attachment_url", "attachmentUrl"]) || null;

  return {
    id,
    patientId: patient.id || readString(row, ["patient_id", "patientId"]),
    patientName: patient.fullName || "—",
    specialistId: specialist.id || readString(row, ["specialist_id", "specialistId"]),
    specialistName: specialist.fullName || "—",
    category,
    categoryLabel: getParentComplaintCategoryLabel(category, t),
    status,
    statusLabel: getParentComplaintStatusLabel(status, t),
    statusTone: getParentComplaintStatusTone(status),
    description: readString(row, ["description"]) || "",
    parentResponse: readString(row, ["parent_response", "parentResponse"]) || null,
    attachmentUrl,
    attachmentResolvedUrl: resolveAttachmentUrl(attachmentUrl),
    createdAt: readDate(row.created_at ?? row.createdAt),
    reviewedAt: readDate(row.reviewed_at ?? row.reviewedAt),
    resolvedAt: readDate(row.resolved_at ?? row.resolvedAt),
    submittedLabel: formatParentComplaintDateTime(row.created_at ?? row.createdAt, locale, t),
  };
}

export function validateComplaintAttachmentFile(file, t = null) {
  const messages = getParentComplaintValidationMessages(t ?? (() => ""));
  if (!(file instanceof File)) {
    return { valid: false, error: messages.attachmentPickFailed || COMPLAINT_VALIDATION_MESSAGES.attachmentPickFailed };
  }

  const mime = String(file.type || "").toLowerCase();
  const extension = file.name.includes(".")
    ? `.${file.name.split(".").pop().toLowerCase()}`
    : "";

  const mimeAllowed = mime && COMPLAINT_ATTACHMENT_MIME_TYPES.has(mime);
  const extensionAllowed = extension && COMPLAINT_ATTACHMENT_EXTENSIONS.has(extension);

  if (!mimeAllowed && !extensionAllowed) {
    return { valid: false, error: messages.attachmentInvalidType || COMPLAINT_VALIDATION_MESSAGES.attachmentInvalidType };
  }

  if (file.size > COMPLAINT_ATTACHMENT_MAX_BYTES) {
    return { valid: false, error: messages.attachmentTooLarge || COMPLAINT_VALIDATION_MESSAGES.attachmentTooLarge };
  }

  return { valid: true, error: null };
}

export function validateComplaintForm({
  patientId,
  specialistId,
  category,
  description,
  hasAssignedSpecialist,
}, t = null) {
  const messages = getParentComplaintValidationMessages(t ?? (() => ""));
  const errors = {};

  if (!patientId) {
    errors.patientId = messages.selectChild || COMPLAINT_VALIDATION_MESSAGES.selectChild;
  }

  if (!hasAssignedSpecialist) {
    errors.specialistId = messages.noSpecialistAssigned || COMPLAINT_VALIDATION_MESSAGES.noSpecialistAssigned;
  } else if (!specialistId) {
    errors.specialistId = messages.selectSpecialist || COMPLAINT_VALIDATION_MESSAGES.selectSpecialist;
  }

  if (!category) {
    errors.category = messages.selectCategory || COMPLAINT_VALIDATION_MESSAGES.selectCategory;
  }

  const trimmedDescription = typeof description === "string" ? description.trim() : "";

  if (trimmedDescription.length < COMPLAINT_DESCRIPTION_MIN_LENGTH) {
    errors.description = messages.descriptionTooShort || COMPLAINT_VALIDATION_MESSAGES.descriptionTooShort;
  } else if (trimmedDescription.length > COMPLAINT_DESCRIPTION_MAX_LENGTH) {
    errors.description = messages.descriptionTooLong || COMPLAINT_VALIDATION_MESSAGES.descriptionTooLong;
  }

  return errors;
}

export function buildComplaintCreatePayload({
  patientId,
  specialistId,
  category,
  description,
  attachmentUrl,
}) {
  const payload = {
    patient_id: patientId,
    specialist_id: specialistId,
    category,
    description: description.trim(),
  };

  if (attachmentUrl) {
    payload.attachment_url = attachmentUrl;
  }

  return payload;
}

export function mapParentComplaintSubmitError(error, t = null) {
  if (typeof t === "function") {
    return mapParentComplaintSubmitErrorLocalized(error, t);
  }

  const status = error && typeof error === "object" ? error.status : null;
  const code = error && typeof error === "object" ? error.code : null;
  const message = error instanceof Error ? error.message : (typeof error === "string" ? error : "");

  if (
    status === 409
    || code === "duplicate_active_complaint"
    || message === "duplicate_active_complaint"
  ) {
    return COMPLAINT_VALIDATION_MESSAGES.duplicateActive;
  }

  if (message.includes("not assigned")) {
    return COMPLAINT_VALIDATION_MESSAGES.specialistNotAssigned;
  }

  if (message.includes("not authorized")) {
    return COMPLAINT_VALIDATION_MESSAGES.childNotAuthorized;
  }

  if (message === "submit_failed" || !message.trim()) {
    return COMPLAINT_VALIDATION_MESSAGES.submitFailed;
  }

  return message;
}
