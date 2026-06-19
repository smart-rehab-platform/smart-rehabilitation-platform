const express = require("express");

const goalsController = require("./goals.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/treatment-plans/:planId/goals",
  authenticate,
  authorizeRoles("admin", "specialist"),
  goalsController.createGoal
);

router.get(
  "/treatment-plans/:planId/goals",
  authenticate,
  goalsController.getPlanGoals
);

router.post(
  "/goals/:id/progress",
  authenticate,
  authorizeRoles("admin", "specialist"),
  goalsController.createGoalProgress
);

router.get(
  "/goals/:id/progress",
  authenticate,
  goalsController.getGoalProgress
);

router.patch(
  "/goals/:id/achieve",
  authenticate,
  authorizeRoles("admin", "specialist"),
  goalsController.achieveGoal
);

router.get(
  "/goals/:id",
  authenticate,
  goalsController.getGoalById
);

router.put(
  "/goals/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  goalsController.updateGoal
);

router.delete(
  "/goals/:id",
  authenticate,
  authorizeRoles("admin"),
  goalsController.deleteGoal
);

module.exports = router;