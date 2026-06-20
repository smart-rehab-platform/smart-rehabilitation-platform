const express = require("express");

const sessionsController = require("./sessions.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/sessions",
  authenticate,
  authorizeRoles("admin", "specialist"),
  sessionsController.createSession
);

router.get(
  "/sessions",
  authenticate,
  sessionsController.getAllSessions
);

router.get(
  "/patients/:id/sessions",
  authenticate,
  sessionsController.getPatientSessions
);

router.get(
  "/specialists/:id/sessions",
  authenticate,
  sessionsController.getSpecialistSessions
);

router.get(
  "/parents/:id/sessions",
  authenticate,
  sessionsController.getParentSessions
);

router.patch(
  "/sessions/:id/complete",
  authenticate,
  authorizeRoles("admin", "specialist"),
  sessionsController.completeSession
);

router.patch(
  "/sessions/:id/cancel",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  sessionsController.cancelSession
);

router.patch(
  "/sessions/:id/no-show",
  authenticate,
  authorizeRoles("admin", "specialist"),
  sessionsController.markNoShow
);

router.get(
  "/sessions/:id",
  authenticate,
  sessionsController.getSessionById
);

router.put(
  "/sessions/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  sessionsController.updateSession
);

router.delete(
  "/sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  sessionsController.deleteSession
);

module.exports = router;