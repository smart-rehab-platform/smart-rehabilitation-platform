import { resolveUploadedAssetUrl } from "../../../services/apiConfig.js";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const COMPLAINT_PAGE_LIMIT = 20;

export const COMPLAINT_STATUS_VALUES = [
  "pending",
  "under_review",
  "resolved",
  "rejected",
];

export const COMPLAINT_STATUS_LABELS = {
  pending: "Pending",
  under_review: "Under Review",
  resolved: "Resolved",
  rejected: "Rejected",
};

/** StatusBadge-compatible tones. */
export const COMPLAINT_STATUS_TONES = {
  pending: "warning",
  under_review: "blue",
  resolved: "success",
  rejected: "danger",
};

export const COMPLAINT_STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export const COMPLAINT_CATEGORY_VALUES = [
  "specialist_not_responding",
  "poor_follow_up",
  "repeated_session_cancellations",
  "delayed_exercise_feedback",
  "inappropriate_communication",
  "other",
];

export const COMPLAINT_CATEGORY_LABELS = {
  specialist_not_responding: "Specialist is not responding",
  poor_follow_up: "Poor follow-up",
  repeated_session_cancellations: "Missed or repeatedly cancelled sessions",
  delayed_exercise_feedback: "Delayed exercise feedback",
  inappropriate_communication: "Inappropriate communication",
  other: "Other",
};

export const COMPLAINT_CATEGORY_FILTER_OPTIONS = COMPLAINT_CATEGORY_VALUES.map((value) => ({
  value,
  label: COMPLAINT_CATEGORY_LABELS[value],
}));

/** Backend Joi: admin_notes min 3, max 2000; parent_response max 2000. */
export const COMPLAINT_ADMIN_NOTES_MIN_LENGTH = 3;
export const COMPLAINT_ADMIN_NOTES_MAX_LENGTH = 2000;
export const COMPLAINT_PARENT_RESPONSE_MAX_LENGTH = 2000;

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

function parseDateOnlyParts(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = DATE_ONLY_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function getComplaintStatusLabel(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return COMPLAINT_STATUS_LABELS[normalized] || (normalized ? status : "Pending");
}

export function getComplaintStatusTone(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return COMPLAINT_STATUS_TONES[normalized] || "gray";
}

export function getComplaintCategoryLabel(category) {
  const normalized = typeof category === "string" ? category.trim().toLowerCase() : "";
  return COMPLAINT_CATEGORY_LABELS[normalized] || (normalized ? category : "Other");
}

/**
 * Formats complaint submitted date like Flutter Admin yMMMd (e.g. Aug 7, 2026).
 */
export function formatComplaintSubmittedLabel(value) {
  if (value == null || value === "") {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Formats submitted/review timestamps with local date and time.
 */
export function formatComplaintDateTimeLabel(value) {
  if (value == null || value === "") {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function isComplaintAttachmentPdf(url) {
  if (typeof url !== "string" || !url.trim()) {
    return false;
  }

  return /\.pdf(?:[?#]|$)/i.test(url.trim());
}

export function getComplaintStatusActions(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalized === "pending") {
    return {
      canStartReview: true,
      canReject: true,
      canResolve: false,
    };
  }

  if (normalized === "under_review") {
    return {
      canStartReview: false,
      canReject: true,
      canResolve: true,
    };
  }

  return {
    canStartReview: false,
    canReject: false,
    canResolve: false,
  };
}

/**
 * Validates YYYY-MM-DD range. Returns true when from is after to.
 */
export function isComplaintDateRangeInvalid(fromDate, toDate) {
  const fromParts = parseDateOnlyParts(fromDate);
  const toParts = parseDateOnlyParts(toDate);

  if (!fromParts || !toParts) {
    return false;
  }

  const from = new Date(fromParts.year, fromParts.month - 1, fromParts.day);
  const to = new Date(toParts.year, toParts.month - 1, toParts.day);
  return from.getTime() > to.getTime();
}

/**
 * Converts YYYY-MM-DD inputs into inclusive local-day ISO timestamps for API `from`/`to`.
 */
export function buildComplaintDateRangeIso(fromDate, toDate) {
  const result = { from: null, to: null };
  const fromParts = parseDateOnlyParts(fromDate);
  const toParts = parseDateOnlyParts(toDate);

  if (fromParts) {
    result.from = new Date(
      fromParts.year,
      fromParts.month - 1,
      fromParts.day,
      0,
      0,
      0,
      0,
    ).toISOString();
  }

  if (toParts) {
    result.to = new Date(
      toParts.year,
      toParts.month - 1,
      toParts.day,
      23,
      59,
      59,
      999,
    ).toISOString();
  }

  return result;
}

export function validateComplaintAdminNotes(notes) {
  const trimmed = typeof notes === "string" ? notes.trim() : "";

  if (!trimmed) {
    return { valid: false, value: "", error: "Admin notes are required." };
  }

  if (trimmed.length < COMPLAINT_ADMIN_NOTES_MIN_LENGTH) {
    return {
      valid: false,
      value: trimmed,
      error: `Admin notes must be at least ${COMPLAINT_ADMIN_NOTES_MIN_LENGTH} characters.`,
    };
  }

  if (trimmed.length > COMPLAINT_ADMIN_NOTES_MAX_LENGTH) {
    return {
      valid: false,
      value: trimmed,
      error: `Admin notes must be at most ${COMPLAINT_ADMIN_NOTES_MAX_LENGTH} characters.`,
    };
  }

  return { valid: true, value: trimmed, error: null };
}

export function normalizeComplaintParentResponse(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length > COMPLAINT_PARENT_RESPONSE_MAX_LENGTH) {
    return trimmed.slice(0, COMPLAINT_PARENT_RESPONSE_MAX_LENGTH);
  }

  return trimmed;
}

/**
 * Builds resolve/reject request body. Omits empty parent_response.
 */
export function buildComplaintReviewPayload({ adminNotes, parentResponse } = {}) {
  const notesResult = validateComplaintAdminNotes(adminNotes);
  if (!notesResult.valid) {
    return { valid: false, error: notesResult.error, payload: null };
  }

  const payload = {
    admin_notes: notesResult.value,
  };

  const normalizedParentResponse = normalizeComplaintParentResponse(parentResponse);
  if (normalizedParentResponse) {
    payload.parent_response = normalizedParentResponse;
  }

  return { valid: true, error: null, payload };
}

export function isInvalidComplaintStatusTransitionError(error) {
  const message = error instanceof Error
    ? error.message
    : (typeof error === "string" ? error : "");
  const code = error && typeof error === "object" ? error.code : null;
  const haystack = `${message} ${code || ""}`.toLowerCase();
  return haystack.includes("invalid_status_transition");
}

function mapPerson(record, fallbackIdKeys = []) {
  if (!record || typeof record !== "object") {
    return { id: "", fullName: "" };
  }

  const id = readString(record, ["id", ...fallbackIdKeys]);
  const fullName = readString(record, ["fullName", "full_name", "name"]);
  return { id, fullName };
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

export function mapAdminComplaintListItem(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id"]);
  if (!id) {
    return null;
  }

  const parent = mapPerson(row.parent, ["parent_id"]);
  const patient = mapPerson(row.patient, ["patient_id"]);
  const specialist = mapPerson(row.specialist, ["specialist_id"]);

  const parentId = parent.id || readString(row, ["parent_id", "parentId"]);
  const patientId = patient.id || readString(row, ["patient_id", "patientId"]);
  const specialistId = specialist.id || readString(row, ["specialist_id", "specialistId"]);
  const category = readString(row, ["category"]).toLowerCase() || "other";
  const status = readString(row, ["status"]).toLowerCase() || "pending";
  const actions = getComplaintStatusActions(status);
  const attachmentUrl = readString(row, ["attachment_url", "attachmentUrl"]) || null;

  return {
    id,
    parentId,
    parentName: parent.fullName || "—",
    patientId,
    patientName: patient.fullName || "—",
    specialistId,
    specialistName: specialist.fullName || "—",
    category,
    categoryLabel: getComplaintCategoryLabel(category),
    status,
    statusLabel: getComplaintStatusLabel(status),
    statusTone: getComplaintStatusTone(status),
    createdAt: readDate(row.created_at ?? row.createdAt),
    description: readString(row, ["description"]) || "",
    attachmentUrl,
    attachmentResolvedUrl: resolveAttachmentUrl(attachmentUrl),
    ...actions,
  };
}

export function mapAdminComplaints(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapAdminComplaintListItem).filter(Boolean);
}

export function mapAdminComplaintDetails(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id"]);
  if (!id) {
    return null;
  }

  const parent = mapPerson(row.parent, ["parent_id"]);
  const patient = mapPerson(row.patient, ["patient_id"]);
  const specialist = mapPerson(row.specialist, ["specialist_id"]);
  const reviewer = row.reviewer ? mapPerson(row.reviewer, ["reviewed_by"]) : null;

  const category = readString(row, ["category"]).toLowerCase() || "other";
  const status = readString(row, ["status"]).toLowerCase() || "pending";
  const actions = getComplaintStatusActions(status);
  const attachmentUrl = readString(row, ["attachment_url", "attachmentUrl"]) || null;

  return {
    id,
    parentId: parent.id || readString(row, ["parent_id", "parentId"]),
    parentName: parent.fullName || "—",
    parent,
    patientId: patient.id || readString(row, ["patient_id", "patientId"]),
    patientName: patient.fullName || "—",
    patient,
    specialistId: specialist.id || readString(row, ["specialist_id", "specialistId"]),
    specialistName: specialist.fullName || "—",
    specialist,
    category,
    categoryLabel: getComplaintCategoryLabel(category),
    status,
    statusLabel: getComplaintStatusLabel(status),
    statusTone: getComplaintStatusTone(status),
    description: readString(row, ["description"]) || "",
    attachmentUrl,
    attachmentResolvedUrl: resolveAttachmentUrl(attachmentUrl),
    createdAt: readDate(row.created_at ?? row.createdAt),
    updatedAt: readDate(row.updated_at ?? row.updatedAt),
    reviewedAt: readDate(row.reviewed_at ?? row.reviewedAt),
    resolvedAt: readDate(row.resolved_at ?? row.resolvedAt),
    reviewer,
    reviewedByName: reviewer?.fullName || null,
    adminNotes: readString(row, ["admin_notes", "adminNotes"]) || null,
    parentResponse: readString(row, ["parent_response", "parentResponse"]) || null,
    ...actions,
  };
}

export function mapComplaintPagination(pagination, fallbackLimit = COMPLAINT_PAGE_LIMIT) {
  if (!pagination || typeof pagination !== "object") {
    return {
      page: 1,
      limit: fallbackLimit,
      total: 0,
      totalPages: 1,
      hasMore: false,
    };
  }

  const page = readNumber(pagination, ["page"]) ?? 1;
  const limit = readNumber(pagination, ["limit"]) ?? fallbackLimit;
  const total = readNumber(pagination, ["total"]) ?? 0;
  const totalPages = readNumber(pagination, ["total_pages", "totalPages"])
    ?? Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function mapComplaintSpecialistOptions(users) {
  if (!Array.isArray(users)) {
    return [];
  }

  const options = [];

  for (const row of users) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const role = readString(row, ["role"]).toLowerCase();
    if (role !== "specialist") {
      continue;
    }

    const value = readString(row, ["id", "_id"]);
    if (!value) {
      continue;
    }

    const name = readString(row, ["full_name", "fullName", "name"]);
    const email = readString(row, ["email"]);
    const label = name || email || "Specialist";

    options.push({ value, label });
  }

  return options.sort((left, right) => left.label.localeCompare(right.label, undefined, {
    sensitivity: "base",
  }));
}
