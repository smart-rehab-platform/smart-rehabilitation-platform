const pool = require("../../database/db");

const createHistory = async (patientId, userId, eventType, description) => {
  await pool.query(
    `INSERT INTO case_history (patient_id, changed_by, event_type, description)
     VALUES ($1, $2, $3, $4)`,
    [patientId, userId, eventType, description]
  );
};

const createAssessment = async (data, userId) => {
  const { patient_id, type, assessment_date, notes } = data;

  const result = await pool.query(
    `INSERT INTO assessments
     (patient_id, specialist_id, type, assessment_date, notes)
     VALUES ($1, $2, $3::assessment_type, COALESCE($4, CURRENT_DATE), $5)
     RETURNING *`,
    [patient_id, userId, type, assessment_date, notes]
  );

  await createHistory(
    patient_id,
    userId,
    "assessment_created",
    "Assessment created"
  );

  return result.rows[0];
};

const getAllAssessments = async () => {
  const result = await pool.query(
    `SELECT 
       a.*,
       p.full_name AS patient_name,
       u.full_name AS specialist_name
     FROM assessments a
     LEFT JOIN patients p ON a.patient_id = p.id
     LEFT JOIN users u ON a.specialist_id = u.id
     ORDER BY a.created_at DESC`
  );

  return result.rows;
};

const getAssessmentById = async (id) => {
  const result = await pool.query(
    `SELECT 
       a.*,
       p.full_name AS patient_name,
       u.full_name AS specialist_name
     FROM assessments a
     LEFT JOIN patients p ON a.patient_id = p.id
     LEFT JOIN users u ON a.specialist_id = u.id
     WHERE a.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateAssessment = async (id, data, userId) => {
  const { type, assessment_date, notes } = data;

  const result = await pool.query(
    `UPDATE assessments
     SET
       type = COALESCE($1::assessment_type, type),
       assessment_date = COALESCE($2, assessment_date),
       notes = COALESCE($3, notes)
     WHERE id = $4
     RETURNING *`,
    [type, assessment_date, notes, id]
  );

  if (result.rows[0]) {
    await createHistory(
      result.rows[0].patient_id,
      userId,
      "assessment_updated",
      "Assessment updated"
    );
  }

  return result.rows[0];
};

const deleteAssessment = async (id, userId) => {
  const assessment = await getAssessmentById(id);

  const result = await pool.query(
    `DELETE FROM assessments
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (result.rows[0]) {
    await createHistory(
      assessment.patient_id,
      userId,
      "assessment_deleted",
      "Assessment deleted"
    );
  }

  return result.rows[0];
};

const createAssessmentResult = async (assessmentId, data, userId) => {
  const { criterion, score, result_details } = data;

  const result = await pool.query(
    `INSERT INTO assessment_results
     (assessment_id, criterion, score, result_details)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [assessmentId, criterion, score, result_details]
  );

  const assessment = await getAssessmentById(assessmentId);

  if (assessment) {
    await createHistory(
      assessment.patient_id,
      userId,
      "assessment_result_added",
      "Assessment result added"
    );
  }

  return result.rows[0];
};

const getAssessmentResults = async (assessmentId) => {
  const result = await pool.query(
    `SELECT *
     FROM assessment_results
     WHERE assessment_id = $1
     ORDER BY created_at DESC`,
    [assessmentId]
  );

  return result.rows;
};

const getPatientAssessments = async (patientId) => {
  const result = await pool.query(
    `SELECT 
       a.*,
       u.full_name AS specialist_name
     FROM assessments a
     LEFT JOIN users u ON a.specialist_id = u.id
     WHERE a.patient_id = $1
     ORDER BY a.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  createAssessmentResult,
  getAssessmentResults,
  getPatientAssessments
};