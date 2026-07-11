const path = require("path");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
]);

const EXTENSION_MIME_FALLBACK = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const resolveMimeType = (mimetype, originalname) => {
  const normalized = String(mimetype || "").toLowerCase().trim();
  if (normalized && ALLOWED_MIME_TYPES.has(normalized)) {
    return normalized;
  }

  const extension = path.extname(String(originalname || "")).toLowerCase();
  return EXTENSION_MIME_FALLBACK[extension] || null;
};

const isAllowedMessageAttachment = (mimetype, originalname) =>
  resolveMimeType(mimetype, originalname) !== null;

const isTrustedUploadUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") {
    return false;
  }

  const trimmed = fileUrl.trim();
  if (!trimmed.startsWith("/uploads/")) {
    return false;
  }

  if (trimmed.includes("..")) {
    return false;
  }

  const filename = trimmed.slice("/uploads/".length);
  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return false;
  }

  return true;
};

const buildAttachmentNotificationPreview = (fileType, caption) => {
  const trimmedCaption =
    caption && String(caption).trim().length > 0
      ? String(caption).trim().slice(0, 120)
      : null;

  if (trimmedCaption) {
    return trimmedCaption;
  }

  const normalized = String(fileType || "").toLowerCase();
  if (normalized.startsWith("image/")) {
    return "Sent an image";
  }
  if (normalized.startsWith("audio/")) {
    return "Sent an audio recording";
  }
  if (normalized === "application/pdf") {
    return "Sent a PDF file";
  }
  if (normalized.startsWith("video/")) {
    return "Sent a video";
  }
  return "Sent a file";
};

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  resolveMimeType,
  isAllowedMessageAttachment,
  isTrustedUploadUrl,
  buildAttachmentNotificationPreview,
};
