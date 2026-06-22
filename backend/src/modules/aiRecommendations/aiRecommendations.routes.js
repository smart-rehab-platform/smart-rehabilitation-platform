const express = require("express");
const router = express.Router();

const aiRecommendationsController = require("./aiRecommendations.controller");

router.post("/generate", aiRecommendationsController.generateRecommendation);

router.get("/", aiRecommendationsController.getAllRecommendations);

router.get("/patient/:id", aiRecommendationsController.getRecommendationsByPatient);

router.get("/:id", aiRecommendationsController.getRecommendationById);

router.patch("/:id/accept", aiRecommendationsController.acceptRecommendation);

router.patch("/:id/reject", aiRecommendationsController.rejectRecommendation);

module.exports = router;