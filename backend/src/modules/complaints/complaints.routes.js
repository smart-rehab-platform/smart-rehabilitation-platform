const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const complaintsController = require("./complaints.controller");
const complaintsValidation = require("./complaints.validation");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("parent"),
  complaintsValidation.validateCreateComplaint,
  complaintsController.createComplaint
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("parent"),
  complaintsController.listMyComplaints
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("parent"),
  complaintsController.getMyComplaintById
);

module.exports = router;
