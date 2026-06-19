const express = require("express");

const assignedExercisesController = require("./assignedExercises.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/assigned-exercises",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assignedExercisesController.createAssignedExercise
);

router.get(
  "/assigned-exercises",
  authenticate,
  assignedExercisesController.getAllAssignedExercises
);

router.get(
  "/patients/:id/assigned-exercises",
  authenticate,
  assignedExercisesController.getPatientAssignedExercises
);

router.get(
  "/patients/:id/daily-tasks",
  authenticate,
  assignedExercisesController.getDailyTasks
);

router.get(
  "/patients/:id/weekly-tasks",
  authenticate,
  assignedExercisesController.getWeeklyTasks
);

router.patch(
  "/assigned-exercises/:id/deactivate",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assignedExercisesController.deactivateAssignedExercise
);

router.get(
  "/assigned-exercises/:id",
  authenticate,
  assignedExercisesController.getAssignedExerciseById
);

router.put(
  "/assigned-exercises/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  assignedExercisesController.updateAssignedExercise
);

router.delete(
  "/assigned-exercises/:id",
  authenticate,
  authorizeRoles("admin"),
  assignedExercisesController.deleteAssignedExercise
);

module.exports = router;