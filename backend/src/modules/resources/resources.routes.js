const express = require("express");

const resourcesController = require("./resources.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/resources",
  authenticate,
  authorizeRoles("admin", "specialist"),
  resourcesController.createResource
);

router.get(
  "/resources",
  authenticate,
  resourcesController.getAllResources
);

router.get(
  "/resources/type/:type",
  authenticate,
  resourcesController.getResourcesByType
);

router.get(
  "/resources/:id",
  authenticate,
  resourcesController.getResourceById
);

router.put(
  "/resources/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  resourcesController.updateResource
);

router.delete(
  "/resources/:id",
  authenticate,
  authorizeRoles("admin"),
  resourcesController.deleteResource
);

module.exports = router;