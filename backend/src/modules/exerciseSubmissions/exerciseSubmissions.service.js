const pool = require("../../database/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Returns the latest submission for an assignment, or null.
 */
const getLatestSubmissionForAssignment = async (assignedExerciseId) => {
  const result = await pool.query(
    `SELECT *
     FROM exercise_submissions
     WHERE assigned_exercise_id = $1
     ORDER BY submitted_at DESC, id DESC
     LIMIT 1`,
    [assignedExerciseId]
  );
  return result.rows[0] || null;
};

/**
 * Specialist-requested retry eligibility:
 * - first submission always allowed
 * - additional submissions only when latest status is needs_retry
 *
 * Does not redesign daily/weekly recurrence.
 */
const assertSubmissionEligibility = async (assignedExerciseId) => {
  const latest = await getLatestSubmissionForAssignment(assignedExerciseId);
  if (!latest) {
    return { allowed: true, latest: null };
  }

  const status = String(latest.status || "").trim().toLowerCase();
  if (status === "needs_retry") {
    return { allowed: true, latest };
  }

  if (status === "pending") {
    throw createError(
      "This exercise already has a submission awaiting specialist review.",
      409
    );
  }

  if (status === "reviewed") {
    throw createError(
      "This exercise was already reviewed. Wait for a specialist retry request before submitting again.",
      409
    );
  }

  throw createError(
    "A new submission is not allowed for this exercise right now.",
    409
  );
};

const createExerciseSubmission = async (data, submittedBy) => {
  const { assigned_exercise_id, parent_notes } = data;
  const assignedExerciseId = String(assigned_exercise_id || "").trim();
  if (!assignedExerciseId) {
    throw createError("assigned_exercise_id is required.", 400);
  }

  const assignment = await pool.query(
    `SELECT id, is_active
     FROM assigned_exercises
     WHERE id = $1`,
    [assignedExerciseId]
  );
  if (!assignment.rows[0]) {
    throw createError("Assigned exercise not found.", 404);
  }
  if (assignment.rows[0].is_active === false) {
    throw createError("This assigned exercise is no longer active.", 409);
  }

  await assertSubmissionEligibility(assignedExerciseId);

  const result = await pool.query(
    `INSERT INTO exercise_submissions
     (assigned_exercise_id, submitted_by, parent_notes)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [assignedExerciseId, submittedBy, parent_notes]
  );

  return result.rows[0];
};

const getAllExerciseSubmissions = async () => {
  const result = await pool.query(
    `SELECT es.*,
            u.full_name AS submitted_by_name,
            e.title AS exercise_title,
            ae.patient_id
     FROM exercise_submissions es
     JOIN users u ON es.submitted_by = u.id
     JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
     JOIN exercises e ON ae.exercise_id = e.id
     ORDER BY es.submitted_at DESC`
  );

  return result.rows;
};

const getExerciseSubmissionById = async (id) => {
  const result = await pool.query(
    `SELECT es.*,
            u.full_name AS submitted_by_name,
            e.title AS exercise_title,
            e.instructions,
            ae.patient_id
     FROM exercise_submissions es
     JOIN users u ON es.submitted_by = u.id
     JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
     JOIN exercises e ON ae.exercise_id = e.id
     WHERE es.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateExerciseSubmission = async (id, data) => {
  const { parent_notes, status } = data;

  const result = await pool.query(
    `UPDATE exercise_submissions
     SET parent_notes = COALESCE($1, parent_notes),
         status = COALESCE($2::submission_status, status)
     WHERE id = $3
     RETURNING *`,
    [parent_notes, status, id]
  );

  return result.rows[0];
};

const deleteExerciseSubmission = async (id) => {
  const result = await pool.query(
    `DELETE FROM exercise_submissions
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const addSubmissionMedia = async (submissionId, data) => {
  const { media_type, file_url, duration_seconds } = data;

  const result = await pool.query(
    `INSERT INTO submission_media
     (submission_id, media_type, file_url, duration_seconds)
     VALUES ($1, $2::media_type, $3, $4)
     RETURNING *`,
    [submissionId, media_type, file_url, duration_seconds]
  );

  return result.rows[0];
};

const getSubmissionMedia = async (submissionId) => {
  const result = await pool.query(
    `SELECT *
     FROM submission_media
     WHERE submission_id = $1
     ORDER BY created_at DESC`,
    [submissionId]
  );

  return result.rows;
};

const getAssignedExerciseSubmissions = async (assignedExerciseId) => {
  const result = await pool.query(
    `SELECT es.*,
            u.full_name AS submitted_by_name
     FROM exercise_submissions es
     JOIN users u ON es.submitted_by = u.id
     WHERE es.assigned_exercise_id = $1
     ORDER BY es.submitted_at DESC`,
    [assignedExerciseId]
  );

  return result.rows;
};

const getPatientSubmissions = async (patientId) => {
  const result = await pool.query(
    `SELECT es.*,
            e.title AS exercise_title,
            u.full_name AS submitted_by_name
     FROM exercise_submissions es
     JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
     JOIN exercises e ON ae.exercise_id = e.id
     JOIN users u ON es.submitted_by = u.id
     WHERE ae.patient_id = $1
     ORDER BY es.submitted_at DESC`,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  createExerciseSubmission,
  getAllExerciseSubmissions,
  getExerciseSubmissionById,
  updateExerciseSubmission,
  deleteExerciseSubmission,
  addSubmissionMedia,
  getSubmissionMedia,
  getAssignedExerciseSubmissions,
  getPatientSubmissions,
  getLatestSubmissionForAssignment,
  assertSubmissionEligibility,
};
