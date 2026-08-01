const Joi = require("joi");

const PASSWORD_VALIDATION_MESSAGE =
  "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

const validateStrongPassword = (value, helpers) => {
  const hasMinimumLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(value);

  if (
    !hasMinimumLength ||
    !hasUppercase ||
    !hasLowercase ||
    !hasNumber ||
    !hasSpecialCharacter
  ) {
    return helpers.message(PASSWORD_VALIDATION_MESSAGE);
  }

  return value;
};

const passwordSchema = Joi.string()
  .required()
  .custom(validateStrongPassword)
  .messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required."
  });

const specialistProfileSchema = Joi.object({
  specialization: Joi.string().max(150).allow("", null).messages({
    "string.max": "Specialization must not exceed 150 characters."
  }),
  license_number: Joi.string().max(100).allow("", null).messages({
    "string.max": "License number must not exceed 100 characters."
  }),
  years_of_experience: Joi.number().integer().min(0).allow(null).messages({
    "number.base": "Years of experience must be a number.",
    "number.integer": "Years of experience must be an integer.",
    "number.min": "Years of experience must be at least 0."
  }),
  bio: Joi.string().allow("", null),
}).optional();

const registerSchema = Joi.object({
  full_name: Joi.string().min(3).max(150).required().messages({
    "any.required": "Full name is required.",
    "string.empty": "Full name is required.",
    "string.min": "Full name must be at least 3 characters long.",
    "string.max": "Full name must not exceed 150 characters."
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address."
  }),
  password: passwordSchema,
  phone: Joi.string().allow("", null),
  role: Joi.string().valid("admin", "specialist", "parent").required().messages({
    "any.required": "Role is required.",
    "string.empty": "Role is required.",
    "any.only": "Role must be parent, specialist, or admin."
  }),
  profile_image_url: Joi.string().allow("", null),
  specialist_profile: Joi.when("role", {
    is: "specialist",
    then: specialistProfileSchema,
    otherwise: Joi.any().strip(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address."
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required."
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address."
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Reset token is required.",
    "string.empty": "Reset token is required."
  }),
  newPassword: passwordSchema
});

const sendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address."
  })
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Verification token is required.",
    "string.empty": "Verification token is required."
  })
});

module.exports = {
  registerSchema,
  specialistProfileSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendVerificationSchema,
  verifyEmailSchema,
  PASSWORD_VALIDATION_MESSAGE
}; 