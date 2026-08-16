const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const supportRequestsController = require("./supportRequests.controller");
const supportRequestsValidation = require("./supportRequests.validation");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("specialist"),
  supportRequestsValidation.validateCreateSupportRequest,
  supportRequestsController.createSupportRequest
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("specialist"),
  supportRequestsValidation.validateSpecialistListQuery,
  supportRequestsController.listMySupportRequests
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("specialist"),
  supportRequestsController.getMySupportRequestById
);

router.post(
  "/:id/messages",
  authenticate,
  authorizeRoles("specialist"),
  supportRequestsValidation.validateCreateMessage,
  supportRequestsController.addSpecialistMessage
);

module.exports = router;
