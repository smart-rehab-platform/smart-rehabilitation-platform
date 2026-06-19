const express = require("express");

const assessmentsController = require("./assessments.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assessmentsController.createAssessment
);

router.get(
  "/",
  authenticate,
  assessmentsController.getAllAssessments
);

router.get(
  "/:id",
  authenticate,
  assessmentsController.getAssessmentById
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assessmentsController.updateAssessment
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assessmentsController.deleteAssessment
);

router.post(
  "/:id/results",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assessmentsController.createAssessmentResult
);

router.get(
  "/:id/results",
  authenticate,
  assessmentsController.getAssessmentResults
);

router.get(
  "/patient/:id",
  authenticate,
  assessmentsController.getPatientAssessments
);

module.exports = router;