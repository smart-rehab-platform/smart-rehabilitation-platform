const express = require("express");

const reportsController = require("./reports.controller");
const reportsValidation = require("./reports.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const requirePatientAccess = require("../../middleware/patientAccess.middleware");

const router = express.Router();

router.post(
  "/reports",
  authenticate,
  authorizeRoles("specialist"),
  reportsValidation.validateCreateReport,
  requirePatientAccess.fromBodySpecialistAssignment("patient_id"),
  reportsController.createReport
);

router.get(
  "/reports",
  authenticate,
  authorizeRoles("admin", "specialist"),
  reportsController.getAllReports
);

router.get(
  "/patients/:id/reports/weekly",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  requirePatientAccess("id"),
  reportsController.getPatientWeeklyReports
);

router.get(
  "/patients/:id/reports/monthly",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  requirePatientAccess("id"),
  reportsController.getPatientMonthlyReports
);

router.get(
  "/patients/:id/reports",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  requirePatientAccess("id"),
  reportsController.getPatientReports
);

router.post(
  "/reports/:id/export-pdf",
  authenticate,
  authorizeRoles("admin", "specialist"),
  reportsController.exportReportPdf
);

router.get(
  "/reports/:id",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  reportsController.getReportById
);

router.delete(
  "/reports/:id",
  authenticate,
  authorizeRoles("admin"),
  reportsController.deleteReport
);

module.exports = router;
