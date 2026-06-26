const Joi = require("joi");

const registerSchema = Joi.object({
  full_name: Joi.string().min(3).max(150).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow("", null),
  role: Joi.string().valid("admin", "specialist", "parent").required(),
  profile_image_url: Joi.string().allow("", null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
}; 