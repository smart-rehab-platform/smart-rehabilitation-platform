const path = require("path");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const EXTENSION_MIME_FALLBACK = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

const MAX_COMPLAINT_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const resolveMimeType = (mimetype, originalname) => {
  const normalized = String(mimetype || "").toLowerCase().trim();
  if (normalized && ALLOWED_MIME_TYPES.has(normalized)) {
    return normalized;
  }

  const extension = path.extname(String(originalname || "")).toLowerCase();
  return EXTENSION_MIME_FALLBACK[extension] || null;
};

const isAllowedComplaintAttachment = (mimetype, originalname) =>
  resolveMimeType(mimetype, originalname) !== null;

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_COMPLAINT_ATTACHMENT_BYTES,
  isAllowedComplaintAttachment,
  resolveMimeType,
};
