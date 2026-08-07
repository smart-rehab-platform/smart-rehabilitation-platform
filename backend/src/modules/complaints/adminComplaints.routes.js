const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const complaintsController = require("../complaints/complaints.controller");
const complaintsValidation = require("../complaints/complaints.validation");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  complaintsValidation.validateAdminListQuery,
  complaintsController.listAdminComplaints
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  complaintsController.getAdminComplaintById
);

router.patch(
  "/:id/start-review",
  authenticate,
  authorizeRoles("admin"),
  complaintsController.startComplaintReview
);

router.patch(
  "/:id/resolve",
  authenticate,
  authorizeRoles("admin"),
  complaintsValidation.validateAdminReviewNotes,
  complaintsController.resolveComplaint
);

router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("admin"),
  complaintsValidation.validateAdminReviewNotes,
  complaintsController.rejectComplaint
);

module.exports = router;
