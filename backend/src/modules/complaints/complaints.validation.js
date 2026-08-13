const Joi = require("joi");
const { isTrustedUploadUrl } = require("../../config/messageAttachments");

const COMPLAINT_CATEGORIES = [
  "specialist_not_responding",
  "poor_follow_up",
  "repeated_session_cancellations",
  "delayed_exercise_feedback",
  "inappropriate_communication",
  "other",
];

const COMPLAINT_STATUSES = [
  "pending",
  "under_review",
  "resolved",
  "rejected",
];

const createComplaintSchema = Joi.object({
  patient_id: Joi.string().uuid().required(),
  specialist_id: Joi.string().uuid().required(),
  category: Joi.string()
    .valid(...COMPLAINT_CATEGORIES)
    .required(),
  description: Joi.string().trim().min(20).max(1000).required(),
  attachment_url: Joi.string()
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
    .optional(),
});

const adminReviewNotesSchema = Joi.object({
  admin_notes: Joi.string().trim().min(3).max(2000).required(),
  parent_response: Joi.string().trim().max(2000).allow(null, "").optional(),
});

const adminListQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...COMPLAINT_STATUSES)
    .optional(),
  specialist_id: Joi.string().uuid().optional(),
  category: Joi.string()
    .valid(...COMPLAINT_CATEGORIES)
    .optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
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
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  validateCreateComplaint: validateBody(createComplaintSchema),
  validateAdminReviewNotes: validateBody(adminReviewNotesSchema),
  validateAdminListQuery: validateQuery(adminListQuerySchema),
};
