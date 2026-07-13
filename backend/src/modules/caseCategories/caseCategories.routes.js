const express = require("express");

const caseCategoriesController = require("./caseCategories.controller");
const caseCategoriesValidation = require("./caseCategories.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  caseCategoriesValidation.validateIncludeInactiveQuery,
  caseCategoriesController.listCategories
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  caseCategoriesValidation.validateCreateCategory,
  caseCategoriesController.createCategory
);

router.get(
  "/specialists/:specialistId",
  authenticate,
  authorizeRoles("admin", "specialist"),
  caseCategoriesValidation.validateUuidParam("specialistId"),
  caseCategoriesController.getSpecialistCategories
);

router.put(
  "/specialists/:specialistId",
  authenticate,
  authorizeRoles("admin"),
  caseCategoriesValidation.validateUuidParam("specialistId"),
  caseCategoriesValidation.validateReplaceSpecialistCategories,
  caseCategoriesController.replaceSpecialistCategories
);

router.get(
  "/:id/specialists",
  authenticate,
  authorizeRoles("admin"),
  caseCategoriesValidation.validateUuidParam("id"),
  caseCategoriesController.listMatchingSpecialists
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  caseCategoriesValidation.validateUuidParam("id"),
  caseCategoriesController.getCategoryById
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  caseCategoriesValidation.validateUuidParam("id"),
  caseCategoriesValidation.validateUpdateCategory,
  caseCategoriesController.updateCategory
);

module.exports = router;
