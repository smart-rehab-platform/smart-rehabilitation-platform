const Joi = require("joi");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const updateSpecialistVerificationSchema = Joi.object({
  status: Joi.string()
    .valid("approved", "rejected")
    .required()
    .messages({
      "any.required": "Status is required.",
      "string.empty": "Status is required.",
      "any.only": "Status must be approved or rejected.",
    }),
});

const specialistUserIdParamSchema = Joi.object({
  userId: Joi.string().pattern(UUID_RE).required().messages({
    "any.required": "Specialist user id is required.",
    "string.empty": "Specialist user id is required.",
    "string.pattern.base": "Specialist user id must be a valid UUID.",
  }),
});

module.exports = {
  updateSpecialistVerificationSchema,
  specialistUserIdParamSchema,
};
