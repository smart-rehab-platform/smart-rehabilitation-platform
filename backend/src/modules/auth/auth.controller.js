const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendVerificationSchema,
  verifyEmailSchema
} = require("./auth.validation");
const authService = require("./auth.service");

const validateRequest = (schema, payload, res) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return null;
  }

  return value;
};

const register = async (req, res) => {
  try {
    const validatedBody = validateRequest(registerSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const user = await authService.registerUser(validatedBody);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

const login = async (req, res) => {
  try {
    const validatedBody = validateRequest(loginSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const result = await authService.loginUser(
      validatedBody.email,
      validatedBody.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (err) {
    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const validatedBody = validateRequest(forgotPasswordSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const message = await authService.forgotPassword(validatedBody.email);

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const validatedBody = validateRequest(resetPasswordSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const message = await authService.resetPassword(
      validatedBody.token,
      validatedBody.newPassword
    );

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const sendVerification = async (req, res) => {
  try {
    const validatedBody = validateRequest(sendVerificationSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const message = await authService.sendVerification(validatedBody.email);

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const validatedQuery = validateRequest(verifyEmailSchema, req.query, res);
    if (!validatedQuery) {
      return;
    }

    const message = await authService.verifyEmail(validatedQuery.token);

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const me = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};

const adminOnly = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Admin. You have access to this route",
    user: req.user
  });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendVerification,
  verifyEmail,
  me,
  adminOnly
};
