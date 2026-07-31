const pool = require("../database/db");

const isAdmin = (user) => user?.role === "admin";

const patientExists = async (patientId) => {
  const result = await pool.query(
    `SELECT 1 FROM patients WHERE id = $1 LIMIT 1`,
    [patientId]
  );

  return result.rows.length > 0;
};

const isParentLinkedToPatient = async (parentId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_guardians
     WHERE parent_id = $1 AND patient_id = $2
     LIMIT 1`,
    [parentId, patientId]
  );

  return result.rows.length > 0;
};

const isSpecialistAssignedToPatient = async (specialistId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_specialists
     WHERE specialist_id = $1 AND patient_id = $2
     LIMIT 1`,
    [specialistId, patientId]
  );

  return result.rows.length > 0;
};

const canAccessPatient = async (patientId, user) => {
  if (!user) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  if (user.role === "parent") {
    return isParentLinkedToPatient(user.id, patientId);
  }

  if (user.role === "specialist") {
    return isSpecialistAssignedToPatient(user.id, patientId);
  }

  return false;
};

module.exports = {
  patientExists,
  canAccessPatient,
  isParentLinkedToPatient,
  isSpecialistAssignedToPatient,
};
