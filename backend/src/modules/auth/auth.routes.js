const express = require("express");
const authController = require("./auth.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authenticate, authController.me);

router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("admin"),
  authController.adminOnly
);

module.exports = router;