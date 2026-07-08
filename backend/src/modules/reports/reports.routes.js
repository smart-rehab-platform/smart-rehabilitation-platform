const express = require("express");

const reportsController = require("./reports.controller");
const reportsValidation = require("./reports.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/reports",
  authenticate,
  authorizeRoles("admin", "specialist"),
  reportsValidation.validateCreateReport,
  reportsController.createReport
);

router.get(
  "/reports",
  authenticate,
  reportsController.getAllReports
);

router.get(
  "/patients/:id/reports/weekly",
  authenticate,
  reportsController.getPatientWeeklyReports
);

router.get(
  "/patients/:id/reports/monthly",
  authenticate,
  reportsController.getPatientMonthlyReports
);

router.get(
  "/patients/:id/reports",
  authenticate,
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
  reportsController.getReportById
);

router.delete(
  "/reports/:id",
  authenticate,
  authorizeRoles("admin"),
  reportsController.deleteReport
);

module.exports = router;