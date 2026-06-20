const express = require("express");

const specialistsController = require("./specialists.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/specialists/profile",
  authenticate,
  authorizeRoles("specialist"),
  specialistsController.createSpecialistProfile
);

router.get(
  "/specialists",
  authenticate,
  specialistsController.getAllSpecialists
);

router.get(
  "/specialists/:id/patients",
  authenticate,
  specialistsController.getSpecialistPatients
);

router.get(
  "/specialists/:id",
  authenticate,
  specialistsController.getSpecialistById
);

router.put(
  "/specialists/:id/profile",
  authenticate,
  authorizeRoles("specialist", "admin"),
  specialistsController.updateSpecialistProfile
);

module.exports = router;