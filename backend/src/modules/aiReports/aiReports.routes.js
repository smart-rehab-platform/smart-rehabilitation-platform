const express = require("express");
const aiReportsController = require("./aiReports.controller");
const aiReportsValidation = require("./aiReports.validation");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const requirePatientAccess = require("../../middleware/patientAccess.middleware");

const router = express.Router();

router.post(
  "/ai/reports/generate-weekly",
  authenticate,
  authorizeRoles("specialist"),
  aiReportsValidation.validateGenerateReport,
  requirePatientAccess.fromBodySpecialistAssignment("patient_id"),
  aiReportsController.generateWeeklyReport
);

router.post(
  "/ai/reports/generate-monthly",
  authenticate,
  authorizeRoles("specialist"),
  aiReportsValidation.validateGenerateReport,
  requirePatientAccess.fromBodySpecialistAssignment("patient_id"),
  aiReportsController.generateMonthlyReport
);

router.get(
  "/ai/reports",
  authenticate,
  authorizeRoles("admin", "specialist"),
  aiReportsController.getAllReports
);

router.post(
  "/ai/reports/:id/export-pdf",
  authenticate,
  authorizeRoles("admin", "specialist"),
  aiReportsController.exportReportPdf
);

router.get(
  "/ai/reports/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  aiReportsController.getReportById
);

router.get(
  "/patients/:id/ai-reports",
  authenticate,
  authorizeRoles("admin", "specialist"),
  requirePatientAccess("id"),
  aiReportsController.getReportsByPatient
);

module.exports = router;
