const express = require("express");

const auditLogsController = require("./auditLogs.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.get(
  "/audit-logs",
  authenticate,
  authorizeRoles("admin"),
  auditLogsController.getAllAuditLogs
);

router.get(
  "/audit-logs/user/:userId",
  authenticate,
  authorizeRoles("admin"),
  auditLogsController.getAuditLogsByUser
);

router.get(
  "/audit-logs/entity/:entityName/:entityId",
  authenticate,
  authorizeRoles("admin"),
  auditLogsController.getAuditLogsByEntity
);

router.get(
  "/audit-logs/:id",
  authenticate,
  authorizeRoles("admin"),
  auditLogsController.getAuditLogById
);

module.exports = router;