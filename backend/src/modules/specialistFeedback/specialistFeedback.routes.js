const express = require("express");

const specialistFeedbackController = require("./specialistFeedback.controller");
const specialistFeedbackValidation = require("./specialistFeedback.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("parent"),
  specialistFeedbackValidation.validateSubmitFeedback,
  specialistFeedbackController.submitFeedback
);

router.get(
  "/check/:treatmentPlanId",
  authenticate,
  authorizeRoles("parent"),
  specialistFeedbackValidation.validateTreatmentPlanIdParam,
  specialistFeedbackController.checkFeedback
);

router.get(
  "/specialist/:specialistId/summary",
  authenticate,
  authorizeRoles("admin", "specialist"),
  specialistFeedbackValidation.validateSpecialistIdParam,
  specialistFeedbackController.getSpecialistFeedbackSummary
);

router.get(
  "/specialist/:specialistId",
  authenticate,
  authorizeRoles("admin", "specialist"),
  specialistFeedbackValidation.validateSpecialistIdParam,
  specialistFeedbackController.getSpecialistFeedback
);

module.exports = router;
