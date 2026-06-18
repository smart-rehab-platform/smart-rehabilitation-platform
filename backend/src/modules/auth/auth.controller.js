const { registerSchema, loginSchema } = require("./auth.validation");
const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const user = await authService.registerUser(req.body);

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
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await authService.loginUser(
      req.body.email,
      req.body.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (err) {
    return res.status(401).json({
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
  me,
  adminOnly
};
