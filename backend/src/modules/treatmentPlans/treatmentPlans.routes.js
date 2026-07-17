const express = require("express");

const treatmentPlansController = require("./treatmentPlans.controller");
const {
  validateCreateTreatmentPlan,
  validateUpdateTreatmentPlan,
  validatePlanIdParam,
} = require("./treatmentPlans.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "specialist"),
  validateCreateTreatmentPlan,
  treatmentPlansController.createTreatmentPlan
);

router.get("/", authenticate, treatmentPlansController.getAllTreatmentPlans);

router.get(
  "/patient/:id",
  authenticate,
  treatmentPlansController.getPatientTreatmentPlans
);

router.post(
  "/:id/revisions",
  authenticate,
  authorizeRoles("admin", "specialist"),
  validatePlanIdParam,
  treatmentPlansController.createTreatmentPlanRevision
);

router.get(
  "/:id/revisions",
  authenticate,
  validatePlanIdParam,
  treatmentPlansController.getTreatmentPlanRevisions
);

router.get(
  "/:id",
  authenticate,
  validatePlanIdParam,
  treatmentPlansController.getTreatmentPlanById
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  validatePlanIdParam,
  validateUpdateTreatmentPlan,
  treatmentPlansController.updateTreatmentPlan
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  validatePlanIdParam,
  treatmentPlansController.deleteTreatmentPlan
);

router.patch(
  "/:id/archive",
  authenticate,
  authorizeRoles("admin", "specialist"),
  validatePlanIdParam,
  treatmentPlansController.archiveTreatmentPlan
);

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("admin", "specialist"),
  validatePlanIdParam,
  treatmentPlansController.completeTreatmentPlan
);

module.exports = router;
