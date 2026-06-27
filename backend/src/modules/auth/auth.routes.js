const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("./auth.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes."
    });
  }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many password reset requests. Please try again in 15 minutes."
    });
  }
});

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-verification", forgotPasswordLimiter, authController.sendVerification);
router.get("/verify-email", authController.verifyEmail);

router.get("/me", authenticate, authController.me);

router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("admin"),
  authController.adminOnly
);

module.exports = router;