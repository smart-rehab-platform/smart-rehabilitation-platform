const express = require("express");

const exerciseSubmissionsController = require("./exerciseSubmissions.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/exercise-submissions",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  exerciseSubmissionsController.createExerciseSubmission
);

router.get(
  "/exercise-submissions",
  authenticate,
  exerciseSubmissionsController.getAllExerciseSubmissions
);

router.post(
  "/exercise-submissions/:id/media",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  exerciseSubmissionsController.addSubmissionMedia
);

router.get(
  "/exercise-submissions/:id/media",
  authenticate,
  exerciseSubmissionsController.getSubmissionMedia
);

router.get(
  "/assigned-exercises/:id/submissions",
  authenticate,
  exerciseSubmissionsController.getAssignedExerciseSubmissions
);

router.get(
  "/patients/:id/submissions",
  authenticate,
  exerciseSubmissionsController.getPatientSubmissions
);

router.get(
  "/exercise-submissions/:id",
  authenticate,
  exerciseSubmissionsController.getExerciseSubmissionById
);

router.put(
  "/exercise-submissions/:id",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  exerciseSubmissionsController.updateExerciseSubmission
);

router.delete(
  "/exercise-submissions/:id",
  authenticate,
  authorizeRoles("admin"),
  exerciseSubmissionsController.deleteExerciseSubmission
);

module.exports = router;