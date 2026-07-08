const express = require("express");
const aiReportsController = require("./aiReports.controller");
const aiReportsValidation = require("./aiReports.validation");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/ai/reports/generate-weekly",
  aiReportsValidation.validateGenerateReport,
  aiReportsController.generateWeeklyReport
);

router.post(
  "/ai/reports/generate-monthly",
  aiReportsValidation.validateGenerateReport,
  aiReportsController.generateMonthlyReport
);

router.get("/ai/reports", aiReportsController.getAllReports);

router.post(
  "/ai/reports/:id/export-pdf",
  authenticate,
  authorizeRoles("admin", "specialist"),
  aiReportsController.exportReportPdf
);

router.get("/ai/reports/:id", aiReportsController.getReportById);

router.get("/patients/:id/ai-reports", aiReportsController.getReportsByPatient);

module.exports = router;
