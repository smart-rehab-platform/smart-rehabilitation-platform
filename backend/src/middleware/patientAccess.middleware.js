const {
  patientExists,
  canAccessPatient,
} = require("../utils/patientAccess");

const requirePatientAccess =
  (paramName = "id") =>
  async (req, res, next) => {
    try {
      const patientId = req.params[paramName];

      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: "Patient id is required",
        });
      }

      const exists = await patientExists(patientId);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      const allowed = await canAccessPatient(patientId, req.user);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this patient.",
        });
      }

      next();
    } catch (error) {
      console.error("Patient access check error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify patient access",
      });
    }
  };

module.exports = requirePatientAccess;
