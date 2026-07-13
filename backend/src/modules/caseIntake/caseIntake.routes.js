const express = require("express");

const caseIntakeController = require("./caseIntake.controller");
const caseIntakeValidation = require("./caseIntake.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.get(
  "/mine",
  authenticate,
  authorizeRoles("parent"),
  caseIntakeValidation.validateListFilters,
  caseIntakeController.listMyRequests
);

router.get(
  "/admin/inbox",
  authenticate,
  authorizeRoles("admin"),
  caseIntakeValidation.validateAdminInboxQuery,
  caseIntakeController.listAdminInbox
);

router.get(
  "/admin/:id/matching-specialists",
  authenticate,
  authorizeRoles("admin"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeController.getMatchingSpecialists
);

router.patch(
  "/admin/:id/assign",
  authenticate,
  authorizeRoles("admin"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateAssignSpecialist,
  caseIntakeController.assignSpecialist
);

router.get(
  "/admin/:id",
  authenticate,
  authorizeRoles("admin"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeController.getAdminRequestById
);

router.get(
  "/specialist/assigned",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateSpecialistListQuery,
  caseIntakeController.listSpecialistAssigned
);

router.patch(
  "/specialist/:id/start-assessment",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeController.startAssessment
);

router.patch(
  "/specialist/:id/assessment-notes",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateAssessmentNotes,
  caseIntakeController.updateAssessmentNotes
);

router.patch(
  "/specialist/:id/accept",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeController.acceptCaseRequest
);

router.patch(
  "/specialist/:id/reject",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateRejectReason,
  caseIntakeController.rejectCaseRequest
);

router.post(
  "/specialist/:id/convert-to-patient",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateConvertToPatient,
  caseIntakeController.convertToPatient
);

router.get(
  "/specialist/:id",
  authenticate,
  authorizeRoles("specialist"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeController.getSpecialistRequestById
);

router.post(
  "/",
  authenticate,
  authorizeRoles("parent"),
  caseIntakeValidation.validateCreateCaseIntakeRequest,
  caseIntakeController.createCaseIntakeRequest
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("parent"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeController.getMyRequestById
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("parent"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateUpdateCaseIntakeRequest,
  caseIntakeController.updateMyRequest
);

router.post(
  "/:id/attachments",
  authenticate,
  authorizeRoles("parent"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateAddAttachment,
  caseIntakeController.addAttachment
);

router.delete(
  "/:id/attachments/:attachmentId",
  authenticate,
  authorizeRoles("parent"),
  caseIntakeValidation.validateRequestIdParam,
  caseIntakeValidation.validateAttachmentIdParam,
  caseIntakeController.deleteAttachment
);

module.exports = router;
