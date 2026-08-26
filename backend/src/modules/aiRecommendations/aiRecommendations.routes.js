const express = require("express");
const router = express.Router();

const aiRecommendationsController = require("./aiRecommendations.controller");
const aiRecommendationsValidation = require("./aiRecommendations.validation");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

router.post("/generate", aiRecommendationsController.generateRecommendation);

router.get("/", aiRecommendationsController.getAllRecommendations);

router.get("/patient/:id", aiRecommendationsController.getRecommendationsByPatient);

router.get("/:id", aiRecommendationsController.getRecommendationById);

router.patch("/:id/accept", aiRecommendationsController.acceptRecommendation);

router.patch("/:id/reject", aiRecommendationsController.rejectRecommendation);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  aiRecommendationsValidation.validateUpdateAiRecommendationDraft,
  aiRecommendationsController.updateRecommendationDraft
);

module.exports = router;
