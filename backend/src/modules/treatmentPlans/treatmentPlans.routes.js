const express = require("express");

const treatmentPlansController = require("./treatmentPlans.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "specialist"),
  treatmentPlansController.createTreatmentPlan
);

router.get(
  "/",
  authenticate,
  treatmentPlansController.getAllTreatmentPlans
);

router.get(
  "/patient/:id",
  authenticate,
  treatmentPlansController.getPatientTreatmentPlans
);

router.post(
  "/:id/revisions",
  authenticate,
  authorizeRoles("admin", "specialist"),
  treatmentPlansController.createTreatmentPlanRevision
);

router.get(
  "/:id/revisions",
  authenticate,
  treatmentPlansController.getTreatmentPlanRevisions
);


router.get(
  "/:id",
  authenticate,
  treatmentPlansController.getTreatmentPlanById
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  treatmentPlansController.updateTreatmentPlan
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  treatmentPlansController.deleteTreatmentPlan
);

router.patch(
  "/:id/archive",
  authenticate,
  authorizeRoles("admin", "specialist"),
  treatmentPlansController.archiveTreatmentPlan
);

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("admin", "specialist"),
  treatmentPlansController.completeTreatmentPlan
);

module.exports = router;