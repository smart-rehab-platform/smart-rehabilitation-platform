const {
  patientExists,
  canAccessPatient,
  isSpecialistAssignedToPatient,
} = require("../utils/patientAccess");

const sendAccessError = (res, statusCode, message) =>
  res.status(statusCode).json({
    success: false,
    message,
  });

const verifyExistingPatientAccess = async (patientId, user, res, next) => {
  if (!patientId) {
    return sendAccessError(res, 400, "Patient id is required");
  }

  const exists = await patientExists(patientId);
  if (!exists) {
    return sendAccessError(res, 404, "Patient not found");
  }

  const allowed = await canAccessPatient(patientId, user);
  if (!allowed) {
    return sendAccessError(res, 403, "You do not have access to this patient.");
  }

  return next();
};

const requirePatientAccess =
  (paramName = "id") =>
  async (req, res, next) => {
    try {
      await verifyExistingPatientAccess(req.params[paramName], req.user, res, next);
    } catch (error) {
      console.error("Patient access check error:", error);
      return sendAccessError(res, 500, "Failed to verify patient access");
    }
  };

/**
 * Body-based specialist assignment check.
 * Canonical source: patient_specialists (same as Specialist patient APIs).
 */
requirePatientAccess.fromBodySpecialistAssignment =
  (fieldName = "patient_id") =>
  async (req, res, next) => {
    try {
      const patientId = req.body?.[fieldName];

      if (!patientId) {
        return sendAccessError(res, 400, "Patient id is required");
      }

      const exists = await patientExists(patientId);
      if (!exists) {
        return sendAccessError(res, 404, "Patient not found");
      }

      const specialistId = req.user?.id;
      if (!specialistId) {
        return sendAccessError(res, 401, "Unauthorized");
      }

      const assigned = await isSpecialistAssignedToPatient(specialistId, patientId);
      if (!assigned) {
        return sendAccessError(res, 403, "You do not have access to this patient.");
      }

      return next();
    } catch (error) {
      console.error("Patient access check error:", error);
      return sendAccessError(res, 500, "Failed to verify patient access");
    }
  };

module.exports = requirePatientAccess;
