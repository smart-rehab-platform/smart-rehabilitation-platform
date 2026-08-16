const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const supportRequestsController = require("./supportRequests.controller");
const supportRequestsValidation = require("./supportRequests.validation");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  supportRequestsValidation.validateAdminListQuery,
  supportRequestsController.listAdminSupportRequests
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  supportRequestsController.getAdminSupportRequestById
);

router.post(
  "/:id/messages",
  authenticate,
  authorizeRoles("admin"),
  supportRequestsValidation.validateCreateMessage,
  supportRequestsController.addAdminMessage
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  supportRequestsValidation.validateUpdateStatus,
  supportRequestsController.updateSupportRequestStatus
);

module.exports = router;
