const express = require("express");
const router = express.Router();

const controller = require("./exerciseReviews.controller");

router.post("/exercise-submissions/:id/review", controller.createReview);
router.get("/exercise-submissions/:id/review", controller.getReviewBySubmissionId);
router.put("/exercise-reviews/:id", controller.updateReview);

router.get("/specialists/:id/pending-reviews", controller.getPendingReviewsBySpecialist);
router.get("/patients/:id/reviews", controller.getReviewsByPatient);

module.exports = router;