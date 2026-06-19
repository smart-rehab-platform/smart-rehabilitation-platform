const express = require("express");

const patientsController = require("./patients.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.createPatient
);

router.get(
  "/",
  authenticate,
  patientsController.getAllPatients
);

router.get(
  "/:id",
  authenticate,
  patientsController.getPatientById
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.updatePatient
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  patientsController.deletePatient
);

router.post(
  "/:id/medical-info",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.createMedicalInfo
);

router.get(
  "/:id/medical-info",
  authenticate,
  patientsController.getMedicalInfo
);

router.put(
  "/:id/medical-info",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.updateMedicalInfo
);

router.post(
  "/:id/diagnoses",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.createDiagnosis
);

router.get(
  "/:id/diagnoses",
  authenticate,
  patientsController.getDiagnoses
);

router.post(
  "/:id/notes",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.createNote
);

router.get(
  "/:id/notes",
  authenticate,
  patientsController.getNotes
);

router.get(
  "/:id/history",
  authenticate,
  patientsController.getPatientHistory
);

router.post(
  "/:id/guardians",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.addGuardian
);

router.get(
  "/:id/guardians",
  authenticate,
  patientsController.getGuardians
);

router.delete(
  "/:id/guardians/:guardianId",
  authenticate,
  authorizeRoles("admin", "specialist"),
  patientsController.removeGuardian
);

router.post(
  "/:id/specialists",
  authenticate,
  authorizeRoles("admin"),
  patientsController.addSpecialist
);

router.get(
  "/:id/specialists",
  authenticate,
  patientsController.getSpecialists
);

router.delete(
  "/:id/specialists/:specialistId",
  authenticate,
  authorizeRoles("admin"),
  patientsController.removeSpecialist
);

module.exports = router;