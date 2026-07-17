const express = require("express");
const router = express.Router();

const speechAnalysesController = require("./speechAnalyses.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

router.post(
  "/analyze",
  authenticate,
  authorizeRoles("admin", "specialist"),
  speechAnalysesController.analyzeSpeech
);

router.get(
  "/patients/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  speechAnalysesController.getSpeechAnalysesByPatient
);

router.get(
  "/exercise-submissions/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  speechAnalysesController.getSpeechAnalysisBySubmission
);

router.get(
  "/patients/:id/progress",
  authenticate,
  authorizeRoles("admin", "specialist"),
  speechAnalysesController.getSpeechProgressByPatient
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  speechAnalysesController.getSpeechAnalysisById
);

module.exports = router;