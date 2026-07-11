const express = require("express");

const sessionRequestsController = require("./sessionRequests.controller");
const sessionRequestsValidation = require("./sessionRequests.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("parent"),
  sessionRequestsValidation.validateCreateSessionRequest,
  sessionRequestsController.createSessionRequest
);

router.get(
  "/mine",
  authenticate,
  authorizeRoles("parent"),
  sessionRequestsValidation.validateStatusQuery,
  sessionRequestsController.listMyRequests
);

router.get(
  "/inbox",
  authenticate,
  authorizeRoles("specialist"),
  sessionRequestsValidation.validateStatusQuery,
  sessionRequestsController.listInbox
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("specialist"),
  sessionRequestsValidation.validateRequestIdParam,
  sessionRequestsValidation.validateApproveSessionRequest,
  sessionRequestsController.approveSessionRequest
);

router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("specialist"),
  sessionRequestsValidation.validateRequestIdParam,
  sessionRequestsValidation.validateRejectSessionRequest,
  sessionRequestsController.rejectSessionRequest
);

module.exports = router;
