const express = require("express");
const router = express.Router();

const speechAnalysesController = require("./speechAnalyses.controller");

router.post("/analyze", speechAnalysesController.analyzeSpeech);

router.get("/patients/:id", speechAnalysesController.getSpeechAnalysesByPatient);

router.get(
  "/exercise-submissions/:id",
  speechAnalysesController.getSpeechAnalysisBySubmission
);

router.get(
  "/patients/:id/progress",
  speechAnalysesController.getSpeechProgressByPatient
);

router.get("/:id", speechAnalysesController.getSpeechAnalysisById);

module.exports = router;