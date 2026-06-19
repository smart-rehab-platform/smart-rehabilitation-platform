const express = require("express");

const exercisesController = require("./exercises.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/exercise-categories",
  authenticate,
  authorizeRoles("admin", "specialist"),
  exercisesController.createExerciseCategory
);

router.get(
  "/exercise-categories",
  authenticate,
  exercisesController.getExerciseCategories
);

router.put(
  "/exercise-categories/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  exercisesController.updateExerciseCategory
);

router.delete(
  "/exercise-categories/:id",
  authenticate,
  authorizeRoles("admin"),
  exercisesController.deleteExerciseCategory
);

router.post(
  "/exercises",
  authenticate,
  authorizeRoles("admin", "specialist"),
  exercisesController.createExercise
);

router.get(
  "/exercises",
  authenticate,
  exercisesController.getAllExercises
);

router.get(
  "/exercises/category/:categoryId",
  authenticate,
  exercisesController.getExercisesByCategory
);

router.get(
  "/exercises/:id",
  authenticate,
  exercisesController.getExerciseById
);

router.put(
  "/exercises/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  exercisesController.updateExercise
);

router.delete(
  "/exercises/:id",
  authenticate,
  authorizeRoles("admin"),
  exercisesController.deleteExercise
);

module.exports = router;