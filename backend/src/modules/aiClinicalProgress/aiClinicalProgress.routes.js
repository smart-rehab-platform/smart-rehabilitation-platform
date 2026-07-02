const express = require("express");

const aiClinicalProgressController = require("./aiClinicalProgress.controller");
const {
  validateGetPatientAiProgressNotes,
  validateGeneratePatientClinicalSummary,
  validateGetPatientChangeAnalysis,
  validateGetTreatmentEffectiveness,
  validateGetDecisionSupport,
  validateGenerateWeeklySummary,
  validateGenerateMonthlySummary
} = require("./aiClinicalProgress.validation");
const authenticate = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/patients/:id/ai-progress-notes",
  authenticate,
  validateGetPatientAiProgressNotes,
  aiClinicalProgressController.getPatientAiProgressNotes
);

router.post(
  "/patients/:id/ai-clinical-summary",
  authenticate,
  validateGeneratePatientClinicalSummary,
  aiClinicalProgressController.generatePatientClinicalSummary
);

router.get(
  "/patients/:id/change-analysis",
  authenticate,
  validateGetPatientChangeAnalysis,
  aiClinicalProgressController.getPatientChangeAnalysis
);

router.get(
  "/patients/:id/treatment-effectiveness",
  authenticate,
  validateGetTreatmentEffectiveness,
  aiClinicalProgressController.getTreatmentEffectiveness
);

router.get(
  "/patients/:id/decision-support",
  authenticate,
  validateGetDecisionSupport,
  aiClinicalProgressController.getDecisionSupport
);

router.post(
  "/patients/:id/ai-weekly-summary",
  authenticate,
  validateGenerateWeeklySummary,
  aiClinicalProgressController.generateWeeklySummary
);

router.post(
  "/patients/:id/ai-monthly-summary",
  authenticate,
  validateGenerateMonthlySummary,
  aiClinicalProgressController.generateMonthlySummary
);

module.exports = router;
