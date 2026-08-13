const express = require("express");

const dashboardController = require("./dashboard.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

// Admin Dashboard
router.get(
  "/dashboard/admin/overview",
  authenticate,
  authorizeRoles("admin"),
  dashboardController.getAdminOverview
);

router.get(
  "/dashboard/admin/users",
  authenticate,
  authorizeRoles("admin"),
  dashboardController.getAdminUsers
);

router.get(
  "/dashboard/admin/system-analytics",
  authenticate,
  authorizeRoles("admin"),
  dashboardController.getSystemAnalytics
);

router.get(
  "/dashboard/admin/weekly-system-activity",
  authenticate,
  authorizeRoles("admin"),
  dashboardController.getWeeklySystemActivity
);

router.get(
  "/dashboard/admin/patients",
  authenticate,
  authorizeRoles("admin"),
  dashboardController.getAdminPatients
);

router.get(
  "/dashboard/admin/ai-center",
  authenticate,
  authorizeRoles("admin"),
  dashboardController.getAdminAiCenter
);

// Specialist Dashboard
router.get(
  "/dashboard/specialist/overview",
  authenticate,
  authorizeRoles("specialist"),
  dashboardController.getSpecialistOverview
);

router.get(
  "/dashboard/specialist/active-cases",
  authenticate,
  authorizeRoles("specialist"),
  dashboardController.getSpecialistActiveCases
);

router.get(
  "/dashboard/specialist/upcoming-sessions",
  authenticate,
  authorizeRoles("specialist"),
  dashboardController.getSpecialistUpcomingSessions
);

router.get(
  "/dashboard/specialist/pending-reviews",
  authenticate,
  authorizeRoles("specialist"),
  dashboardController.getSpecialistPendingReviews
);

router.get(
  "/dashboard/specialist/weekly-patient-interactions",
  authenticate,
  authorizeRoles("specialist"),
  dashboardController.getSpecialistWeeklyPatientInteractions
);

// Parent Dashboard
router.get(
  "/dashboard/parent/overview",
  authenticate,
  authorizeRoles("parent"),
  dashboardController.getParentOverview
);

router.get(
  "/dashboard/parent/children-progress",
  authenticate,
  authorizeRoles("parent"),
  dashboardController.getParentChildrenProgress
);

router.get(
  "/dashboard/parent/tasks",
  authenticate,
  authorizeRoles("parent"),
  dashboardController.getParentTasks
);

router.get(
  "/dashboard/parent/reports",
  authenticate,
  authorizeRoles("parent"),
  dashboardController.getParentReports
);

module.exports = router;