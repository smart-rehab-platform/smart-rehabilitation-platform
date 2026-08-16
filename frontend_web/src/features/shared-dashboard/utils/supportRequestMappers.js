import { resolveUploadedAssetUrl } from "../../../services/apiConfig.js";
import {
  buildSupportRequestCategoryFilterOptions,
  buildSupportRequestCategoryFormOptions,
  buildSupportRequestStatusFilterOptions,
  formatSupportRequestDate,
  formatSupportRequestDateTime,
  getSupportRequestCategoryLabel,
  getSupportRequestStatusLabel,
  getSupportRequestStatusTone,
  SUPPORT_REQUEST_CATEGORY_VALUES,
  SUPPORT_REQUEST_STATUS_TONES,
  SUPPORT_REQUEST_STATUS_VALUES,
  translateSupportRequestKey,
} from "./supportRequestLocalization.js";

export {
  buildSupportRequestCategoryFilterOptions,
  buildSupportRequestCategoryFormOptions,
  buildSupportRequestStatusFilterOptions,
  formatSupportRequestDate,
  formatSupportRequestDateTime,
  getSupportRequestCategoryLabel,
  getSupportRequestStatusLabel,
  getSupportRequestStatusTone,
  SUPPORT_REQUEST_CATEGORY_VALUES,
  SUPPORT_REQUEST_STATUS_TONES,
  SUPPORT_REQUEST_STATUS_VALUES,
};

export const SUPPORT_REQUEST_PAGE_LIMIT = 20;

export const SUPPORT_REQUEST_SUBJECT_MIN_LENGTH = 3;
export const SUPPORT_REQUEST_SUBJECT_MAX_LENGTH = 200;
export const SUPPORT_REQUEST_DESCRIPTION_MIN_LENGTH = 20;
export const SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH = 2000;
export const SUPPORT_REQUEST_MESSAGE_MAX_LENGTH = 2000;

export const SUPPORT_REQUEST_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const SUPPORT_REQUEST_ATTACHMENT_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

const ATTACHMENT_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);
const ATTACHMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

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

function readDate(record, keys) {
  const raw = readString(record, keys);
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveMapperContext(options = {}) {
  if (typeof options === "string" || options === null) {
    return {
      currentUserId: options,
      t: null,
      locale: "en",
    };
  }

  return {
    currentUserId: options.currentUserId ?? null,
    t: typeof options.t === "function" ? options.t : null,
    locale: options.locale === "ar" ? "ar" : "en",
  };
}

export function resolveSupportRequestAttachmentUrl(url) {
  return resolveUploadedAssetUrl(url);
}

/** @deprecated Use buildSupportRequestStatusFilterOptions(t) */
export const SUPPORT_REQUEST_STATUS_FILTER_OPTIONS = buildSupportRequestStatusFilterOptions(null);

/** @deprecated Use buildSupportRequestCategoryFilterOptions(t) */
export const SUPPORT_REQUEST_CATEGORY_FILTER_OPTIONS = buildSupportRequestCategoryFilterOptions(null);

/** @deprecated Use buildSupportRequestCategoryFormOptions(t) */
export const SUPPORT_REQUEST_CATEGORY_FORM_OPTIONS = SUPPORT_REQUEST_CATEGORY_FILTER_OPTIONS;

export function isSupportRequestAttachmentPdf(url) {
  return typeof url === "string" && url.toLowerCase().includes(".pdf");
}

export function validateSupportRequestAttachmentFile(file, t = null) {
  if (!file) {
    return null;
  }

  const name = typeof file.name === "string" ? file.name.toLowerCase() : "";
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";
  const mime = typeof file.type === "string" ? file.type.toLowerCase() : "";

  const typeAllowed = ATTACHMENT_MIME_TYPES.has(mime) || ATTACHMENT_EXTENSIONS.has(extension);
  if (!typeAllowed) {
    return translateSupportRequestKey(
      t,
      "supportRequests.errors.attachmentInvalidType",
      "Unsupported attachment type. Allowed: JPEG, PNG, WebP, and PDF.",
    );
  }

  if (file.size > SUPPORT_REQUEST_ATTACHMENT_MAX_BYTES) {
    return translateSupportRequestKey(
      t,
      "supportRequests.errors.attachmentTooLarge",
      "Attachment is too large. Maximum allowed size is 10 MB.",
    );
  }

  return null;
}

export function mapSupportRequestMessage(row, options = {}) {
  const { currentUserId, t, locale } = resolveMapperContext(options);

  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const senderId = readString(row, ["sender_id", "senderId"])
    || readString(row.sender, ["id", "_id"]);
  const senderRole = readString(row.sender, ["role"]) || "";
  const isOwn = currentUserId && senderId === currentUserId;
  const isAdminMessage = senderRole === "admin";
  const createdAtRaw = readString(row, ["created_at", "createdAt"]);

  return {
    id,
    supportRequestId: readString(row, ["support_request_id", "supportRequestId"]),
    senderId,
    content: readString(row, ["content"]),
    attachmentUrl: resolveSupportRequestAttachmentUrl(
      readString(row, ["attachment_url", "attachmentUrl"]),
    ),
    createdAt: readDate(row, ["created_at", "createdAt"]),
    createdAtLabel: formatSupportRequestDateTime(createdAtRaw, locale, t),
    senderName: readString(row.sender, ["fullName", "full_name", "name"])
      || translateSupportRequestKey(t, "roles.user", "User"),
    senderRole,
    isOwn,
    bubbleVariant: isAdminMessage ? "admin" : "specialist",
  };
}

export function mapSupportRequestListItem(row, options = {}) {
  const { t, locale } = resolveMapperContext(options);

  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = readString(row, ["status"]) || "pending";
  const category = readString(row, ["category"]);
  const createdAtRaw = readString(row, ["created_at", "createdAt"]);
  const lastMessageAtRaw = readString(row, ["last_message_at", "lastMessageAt"]);

  return {
    id,
    specialistId: readString(row, ["specialist_id", "specialistId"]),
    subject: readString(row, ["subject"]) || translateSupportRequestKey(t, "supportRequests.defaultSubject", "Support request"),
    category,
    categoryLabel: getSupportRequestCategoryLabel(category, t),
    status,
    statusLabel: getSupportRequestStatusLabel(status, t),
    statusTone: getSupportRequestStatusTone(status),
    lastMessageAt: readDate(row, ["last_message_at", "lastMessageAt"]),
    lastMessageAtLabel: formatSupportRequestDateTime(lastMessageAtRaw, locale, t),
    createdAt: readDate(row, ["created_at", "createdAt"]),
    createdAtLabel: formatSupportRequestDate(createdAtRaw, locale, t),
    specialistName: readString(row.specialist, ["fullName", "full_name"])
      || translateSupportRequestKey(t, "supportRequests.specialist", "Specialist"),
    specialistEmail: readString(row.specialist, ["email"]),
    isResolved: status === "resolved",
  };
}

export function mapSupportRequestDetails(row, options = {}) {
  const { currentUserId, t, locale } = resolveMapperContext(options);
  const base = mapSupportRequestListItem(row, { t, locale });

  if (!base) {
    return null;
  }

  const messages = Array.isArray(row.messages)
    ? row.messages
      .map((message) => mapSupportRequestMessage(message, { currentUserId, t, locale }))
      .filter(Boolean)
    : [];

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const resolvedAtRaw = readString(row, ["resolved_at", "resolvedAt"]);

  return {
    ...base,
    resolvedAt: readDate(row, ["resolved_at", "resolvedAt"]),
    resolvedAtLabel: formatSupportRequestDateTime(resolvedAtRaw, locale, t),
    resolvedBy: readString(row, ["resolved_by", "resolvedBy"]),
    resolverName: readString(row.resolver, ["fullName", "full_name"]),
    updatedAt: readDate(row, ["updated_at", "updatedAt"]),
    messages,
    latestMessagePreview: latestMessage?.content
      ? latestMessage.content.slice(0, 120)
      : null,
  };
}

export function mapSupportRequests(rows, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => mapSupportRequestListItem(row, options)).filter(Boolean);
}

export function mapSupportRequestPagination(pagination) {
  if (!pagination || typeof pagination !== "object") {
    return {
      page: 1,
      limit: SUPPORT_REQUEST_PAGE_LIMIT,
      total: 0,
      totalPages: 0,
      hasMore: false,
    };
  }

  const page = Number(pagination.page) > 0 ? Number(pagination.page) : 1;
  const limit = Number(pagination.limit) > 0 ? Number(pagination.limit) : SUPPORT_REQUEST_PAGE_LIMIT;
  const total = Number(pagination.total) >= 0 ? Number(pagination.total) : 0;
  const totalPages = Number(pagination.totalPages) >= 0
    ? Number(pagination.totalPages)
    : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function mapSupportRequestSpecialistOptions(users, t = null) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users
    .filter((user) => readString(user, ["role"]).toLowerCase() === "specialist")
    .map((user) => ({
      value: readString(user, ["id", "_id"]),
      label: readString(user, ["full_name", "fullName", "email"])
        || translateSupportRequestKey(t, "supportRequests.specialist", "Specialist"),
    }))
    .filter((option) => option.value)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getSupportRequestStatusActions(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalized === "pending") {
    return {
      canMarkInProgress: true,
      canMarkResolved: true,
    };
  }

  if (normalized === "in_progress") {
    return {
      canMarkInProgress: false,
      canMarkResolved: true,
    };
  }

  return {
    canMarkInProgress: false,
    canMarkResolved: false,
  };
}

export function isSupportRequestResolved(status) {
  return String(status || "").trim().toLowerCase() === "resolved";
}

export function resolveSupportRequestNotificationRoute(notification, buildDetailPath) {
  if (typeof buildDetailPath !== "function") {
    return null;
  }

  const entityType = readString(notification, ["related_entity_type", "relatedEntityType"]);
  const entityId = readString(notification, ["related_entity_id", "relatedEntityId"]);

  if (entityType !== "support_request" || !entityId) {
    return null;
  }

  return buildDetailPath(entityId);
}

export function validateSupportRequestForm(form) {
  const errors = {};
  const subject = String(form?.subject || "").trim();
  const description = String(form?.description || "").trim();
  const category = String(form?.category || "").trim();

  if (!category) {
    errors.category = "Please select a category.";
  }

  if (subject.length < SUPPORT_REQUEST_SUBJECT_MIN_LENGTH) {
    errors.subject = `Subject must be at least ${SUPPORT_REQUEST_SUBJECT_MIN_LENGTH} characters.`;
  } else if (subject.length > SUPPORT_REQUEST_SUBJECT_MAX_LENGTH) {
    errors.subject = `Subject must not exceed ${SUPPORT_REQUEST_SUBJECT_MAX_LENGTH} characters.`;
  }

  if (description.length < SUPPORT_REQUEST_DESCRIPTION_MIN_LENGTH) {
    errors.description = `Description must be at least ${SUPPORT_REQUEST_DESCRIPTION_MIN_LENGTH} characters.`;
  } else if (description.length > SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must not exceed ${SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH} characters.`;
  }

  return errors;
}
