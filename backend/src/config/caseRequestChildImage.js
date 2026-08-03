const {
  resolveMimeType,
} = require("./messageAttachments");

const ALLOWED_CASE_REQUEST_CHILD_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** 5 MB — child profile-style photo limit. */
const MAX_CASE_REQUEST_CHILD_IMAGE_BYTES = 5 * 1024 * 1024;

const isAllowedCaseRequestChildImage = (mimetype, originalname) => {
  const resolved = resolveMimeType(mimetype, originalname);
  return (
    resolved !== null
    && ALLOWED_CASE_REQUEST_CHILD_IMAGE_MIME_TYPES.has(resolved)
  );
};

module.exports = {
  ALLOWED_CASE_REQUEST_CHILD_IMAGE_MIME_TYPES,
  MAX_CASE_REQUEST_CHILD_IMAGE_BYTES,
  isAllowedCaseRequestChildImage,
  resolveMimeType,
};
