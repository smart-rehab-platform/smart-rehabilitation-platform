const {
  ALLOWED_MIME_TYPES,
  MAX_COMPLAINT_ATTACHMENT_BYTES,
  isAllowedComplaintAttachment,
  resolveMimeType,
} = require("./complaintAttachments");

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_SUPPORT_REQUEST_ATTACHMENT_BYTES: MAX_COMPLAINT_ATTACHMENT_BYTES,
  isAllowedSupportRequestAttachment: isAllowedComplaintAttachment,
  resolveMimeType,
};
