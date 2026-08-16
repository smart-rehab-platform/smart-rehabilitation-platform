const Joi = require("joi");
const { isTrustedUploadUrl } = require("../../config/messageAttachments");

const SUPPORT_REQUEST_CATEGORIES = [
  "technical_issue",
  "patient_case_issue",
  "session_scheduling_issue",
  "account_profile_issue",
  "exercise_content_issue",
  "other",
];

const SUPPORT_REQUEST_STATUSES = ["pending", "in_progress", "resolved"];

const attachmentUrlSchema = Joi.string()
  .trim()
  .allow(null, "")
  .custom((value, helpers) => {
    if (!value) {
      return value;
    }
    if (!isTrustedUploadUrl(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .optional();

const createSupportRequestSchema = Joi.object({
  category: Joi.string()
    .valid(...SUPPORT_REQUEST_CATEGORIES)
    .required(),
  subject: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(20).max(2000).required(),
  attachment_url: attachmentUrlSchema,
});

const createMessageSchema = Joi.object({
  content: Joi.string().trim().max(2000).allow("").default(""),
  attachment_url: attachmentUrlSchema,
}).custom((value, helpers) => {
  const content = String(value.content || "").trim();
  const attachment = String(value.attachment_url || "").trim();
  if (!content && !attachment) {
    return helpers.error("any.custom", {
      message: "Message content or attachment is required.",
    });
  }
  return value;
});

const specialistListQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...SUPPORT_REQUEST_STATUSES)
    .optional(),
  category: Joi.string()
    .valid(...SUPPORT_REQUEST_CATEGORIES)
    .optional(),
});

const adminListQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...SUPPORT_REQUEST_STATUSES)
    .optional(),
  category: Joi.string()
    .valid(...SUPPORT_REQUEST_CATEGORIES)
    .optional(),
  specialist_id: Joi.string().uuid().optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("in_progress", "resolved")
    .required(),
});

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join("; "),
    });
  }

  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join("; "),
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = {
  SUPPORT_REQUEST_CATEGORIES,
  SUPPORT_REQUEST_STATUSES,
  validateCreateSupportRequest: validateBody(createSupportRequestSchema),
  validateCreateMessage: validateBody(createMessageSchema),
  validateSpecialistListQuery: validateQuery(specialistListQuerySchema),
  validateAdminListQuery: validateQuery(adminListQuerySchema),
  validateUpdateStatus: validateBody(updateStatusSchema),
};
