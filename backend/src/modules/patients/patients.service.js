const pool = require("../../database/db");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");

const createHistory = async (patientId, userId, eventType, description) => {
  await pool.query(
    `INSERT INTO case_history (patient_id, changed_by, event_type, description)
     VALUES ($1, $2, $3, $4)`,
    [patientId, userId, eventType, description]
  );
};

const createPatient = async (data, userId) => {
  const { full_name, date_of_birth, gender, profile_image_url } = data;

  const result = await pool.query(
    `INSERT INTO patients (full_name, date_of_birth, gender, profile_image_url, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [full_name, date_of_birth, gender, profile_image_url, userId]
  );

  await createHistory(result.rows[0].id, userId, "patient_created", "Patient file created");

  await notifyAllAdmins({
    title: "Patient created",
    body: `${result.rows[0].full_name} was added to the system.`,
    related_entity_type: "patient",
    related_entity_id: result.rows[0].id,
  });

  return result.rows[0];
};

const getAllPatients = async () => {
  const result = await pool.query(
    `SELECT p.*, u.full_name AS created_by_name
     FROM patients p
     LEFT JOIN users u ON p.created_by = u.id
     ORDER BY p.created_at DESC`
  );

  return result.rows;
};

const getPatientById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, u.full_name AS created_by_name
     FROM patients p
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updatePatient = async (id, data, userId) => {
  const { full_name, date_of_birth, gender, profile_image_url } = data;

  const result = await pool.query(
    `UPDATE patients
     SET
       full_name = COALESCE($1, full_name),
       date_of_birth = COALESCE($2, date_of_birth),
       gender = COALESCE($3, gender),
       profile_image_url = COALESCE($4, profile_image_url)
     WHERE id = $5
     RETURNING *`,
    [full_name, date_of_birth, gender, profile_image_url, id]
  );

  if (result.rows[0]) {
    await createHistory(id, userId, "patient_updated", "Patient information updated");
  }

  return result.rows[0];
};

const deletePatient = async (id, userId) => {
  const result = await pool.query(
    `DELETE FROM patients
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const createMedicalInfo = async (patientId, data, userId) => {
  const { medical_history, allergies, current_medications, family_history } = data;

  const result = await pool.query(
    `INSERT INTO patient_medical_info
     (patient_id, medical_history, allergies, current_medications, family_history)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [patientId, medical_history, allergies, current_medications, family_history]
  );

  await createHistory(patientId, userId, "medical_info_added", "Medical information added");

  return result.rows[0];
};

const getMedicalInfo = async (patientId) => {
  const result = await pool.query(
    `SELECT *
     FROM patient_medical_info
     WHERE patient_id = $1`,
    [patientId]
  );

  return result.rows[0];
};

const updateMedicalInfo = async (patientId, data, userId) => {
  const { medical_history, allergies, current_medications, family_history } = data;

  const result = await pool.query(
    `UPDATE patient_medical_info
     SET
       medical_history = COALESCE($1, medical_history),
       allergies = COALESCE($2, allergies),
       current_medications = COALESCE($3, current_medications),
       family_history = COALESCE($4, family_history),
       updated_at = now()
     WHERE patient_id = $5
     RETURNING *`,
    [medical_history, allergies, current_medications, family_history, patientId]
  );

  if (result.rows[0]) {
    await createHistory(patientId, userId, "medical_info_updated", "Medical information updated");
  }

  return result.rows[0];
};

const createDiagnosis = async (patientId, data, userId) => {
  const { diagnosis_title, description, diagnosed_at } = data;

  const result = await pool.query(
    `INSERT INTO diagnoses
     (patient_id, diagnosed_by, diagnosis_title, description, diagnosed_at)
     VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
     RETURNING *`,
    [patientId, userId, diagnosis_title, description, diagnosed_at]
  );

  await createHistory(patientId, userId, "diagnosis_added", "Diagnosis added");

  return result.rows[0];
};

const getDiagnoses = async (patientId) => {
  const result = await pool.query(
    `SELECT d.*, u.full_name AS diagnosed_by_name
     FROM diagnoses d
     LEFT JOIN users u ON d.diagnosed_by = u.id
     WHERE d.patient_id = $1
     ORDER BY d.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const createNote = async (patientId, data, userId) => {
  const { note } = data;

  const result = await pool.query(
    `INSERT INTO specialist_notes (patient_id, specialist_id, note)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [patientId, userId, note]
  );

  await createHistory(patientId, userId, "note_added", "Specialist note added");

  return result.rows[0];
};

const getNotes = async (patientId) => {
  const result = await pool.query(
    `SELECT n.*, u.full_name AS specialist_name
     FROM specialist_notes n
     LEFT JOIN users u ON n.specialist_id = u.id
     WHERE n.patient_id = $1
     ORDER BY n.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const getPatientHistory = async (patientId) => {
  const result = await pool.query(
    `SELECT h.*, u.full_name AS changed_by_name
     FROM case_history h
     LEFT JOIN users u ON h.changed_by = u.id
     WHERE h.patient_id = $1
     ORDER BY h.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const addGuardian = async (patientId, data, userId) => {
  const { parent_id, relationship, is_primary_contact } = data;

  const result = await pool.query(
    `INSERT INTO patient_guardians
     (patient_id, parent_id, relationship, is_primary_contact)
     VALUES (
       $1,
       $2,
       COALESCE($3::relationship_type, 'guardian'::relationship_type),
       COALESCE($4, true)
     )
     RETURNING *`,
    [patientId, parent_id, relationship, is_primary_contact]
  );

  await createHistory(patientId, userId, "guardian_added", "Guardian linked to patient");

  const patientResult = await pool.query(
    "SELECT full_name FROM patients WHERE id = $1",
    [patientId]
  );
  const parentResult = await pool.query(
    "SELECT full_name FROM users WHERE id = $1",
    [parent_id]
  );

  await notifyAllAdmins({
    title: "Parent linked",
    body: `${parentResult.rows[0]?.full_name ?? "Parent"} was linked to patient ${patientResult.rows[0]?.full_name ?? "patient"}.`,
    related_entity_type: "patient",
    related_entity_id: patientId,
  });

  return result.rows[0];
};

const getGuardians = async (patientId) => {
  const result = await pool.query(
    `SELECT pg.*, u.full_name, u.email, u.phone, u.role
     FROM patient_guardians pg
     JOIN users u ON pg.parent_id = u.id
     WHERE pg.patient_id = $1
     ORDER BY pg.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const removeGuardian = async (patientId, guardianId, userId) => {
  const result = await pool.query(
    `DELETE FROM patient_guardians
     WHERE patient_id = $1 AND parent_id = $2
     RETURNING *`,
    [patientId, guardianId]
  );

  if (result.rows[0]) {
    await createHistory(patientId, userId, "guardian_removed", "Guardian unlinked from patient");
  }

  return result.rows[0];
};

const addSpecialist = async (patientId, data, userId) => {
  const { specialist_id, is_primary } = data;

  const result = await pool.query(
    `INSERT INTO patient_specialists
     (patient_id, specialist_id, is_primary)
     VALUES ($1, $2, COALESCE($3, true))
     RETURNING *`,
    [patientId, specialist_id, is_primary]
  );

  await createHistory(patientId, userId, "specialist_added", "Specialist linked to patient");

  const patientResult = await pool.query(
    "SELECT full_name FROM patients WHERE id = $1",
    [patientId]
  );
  const specialistResult = await pool.query(
    "SELECT full_name FROM users WHERE id = $1",
    [specialist_id]
  );

  await notifyAllAdmins({
    title: "Specialist assigned",
    body: `${specialistResult.rows[0]?.full_name ?? "Specialist"} was assigned to patient ${patientResult.rows[0]?.full_name ?? "patient"}.`,
    related_entity_type: "patient",
    related_entity_id: patientId,
  });

  return result.rows[0];
};

const getSpecialists = async (patientId) => {
  const result = await pool.query(
    `SELECT ps.*, u.full_name, u.email, u.phone, u.role
     FROM patient_specialists ps
     JOIN users u ON ps.specialist_id = u.id
     WHERE ps.patient_id = $1
     ORDER BY ps.assigned_at DESC`,
    [patientId]
  );

  return result.rows;
};

const removeSpecialist = async (patientId, specialistId, userId) => {
  const result = await pool.query(
    `DELETE FROM patient_specialists
     WHERE patient_id = $1 AND specialist_id = $2
     RETURNING *`,
    [patientId, specialistId]
  );

  if (result.rows[0]) {
    await createHistory(patientId, userId, "specialist_removed", "Specialist unlinked from patient");
  }

  return result.rows[0];
};



module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  createMedicalInfo,
  getMedicalInfo,
  updateMedicalInfo,
  createDiagnosis,
  getDiagnoses,
  createNote,
  getNotes,
  getPatientHistory,
  addGuardian,
  getGuardians,
  removeGuardian,
  addSpecialist,
  getSpecialists,
  removeSpecialist
};