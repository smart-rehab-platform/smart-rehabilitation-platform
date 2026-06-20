const express = require("express");

const parentsController = require("./parents.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/parents/profile",
  authenticate,
  authorizeRoles("parent"),
  parentsController.createParentProfile
);

router.get(
  "/parents",
  authenticate,
  parentsController.getAllParents
);

router.get(
  "/parents/:id/patients",
  authenticate,
  parentsController.getParentPatients
);

router.get(
  "/parents/:id",
  authenticate,
  parentsController.getParentById
);

router.put(
  "/parents/:id/profile",
  authenticate,
  authorizeRoles("parent", "admin"),
  parentsController.updateParentProfile
);

module.exports = router;