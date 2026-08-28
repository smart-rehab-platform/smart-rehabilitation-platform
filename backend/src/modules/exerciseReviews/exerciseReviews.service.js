const pool = require("../../database/db");

const createReview = async (submissionId, data) => {
  const { specialist_id, performance_rating, feedback, requires_retry } = data;

  const result = await pool.query(
    `
    INSERT INTO exercise_reviews
      (submission_id, specialist_id, performance_rating, feedback, requires_retry)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [submissionId, specialist_id, performance_rating, feedback, requires_retry]
  );

  const newStatus = requires_retry ? "needs_retry" : "reviewed";

  await pool.query(
    `UPDATE exercise_submissions SET status = $1 WHERE id = $2`,
    [newStatus, submissionId]
  );

  return result.rows[0];
};

const getReviewBySubmissionId = async (submissionId) => {
  const result = await pool.query(
    `
    SELECT er.*, u.full_name AS specialist_name
    FROM exercise_reviews er
    JOIN users u ON er.specialist_id = u.id
    WHERE er.submission_id = $1
    `,
    [submissionId]
  );

  return result.rows[0];
};

const updateReview = async (reviewId, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key of ["performance_rating", "feedback", "requires_retry"]) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  values.push(reviewId);

  const result = await pool.query(
    `
    UPDATE exercise_reviews
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
    `,
    values
  );

  if (!result.rows[0]) return null;

  const newStatus = result.rows[0].requires_retry ? "needs_retry" : "reviewed";

  await pool.query(
    `UPDATE exercise_submissions SET status = $1 WHERE id = $2`,
    [newStatus, result.rows[0].submission_id]
  );

  return result.rows[0];
};

const getPendingReviewsBySpecialist = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT 
      es.*,
      ae.patient_id,
      e.title AS exercise_title,
      p.full_name AS patient_name
    FROM exercise_submissions es
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    JOIN exercises e ON ae.exercise_id = e.id
    JOIN patients p ON ae.patient_id = p.id
    JOIN patient_specialists ps ON ps.patient_id = ae.patient_id
    WHERE ps.specialist_id = $1
      AND es.status = 'pending'
    ORDER BY es.submitted_at DESC
    `,
    [specialistId]
  );

  return result.rows;
};

const getReviewsByPatient = async (patientId) => {
  const result = await pool.query(
    `
    SELECT 
      er.*,
      es.parent_notes,
      es.submitted_at,
      e.title AS exercise_title,
      c.name AS category_name,
      u.full_name AS specialist_name
    FROM exercise_reviews er
    JOIN exercise_submissions es ON er.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    JOIN exercises e ON ae.exercise_id = e.id
    LEFT JOIN exercise_categories c ON e.category_id = c.id
    JOIN users u ON er.specialist_id = u.id
    WHERE ae.patient_id = $1
    ORDER BY er.reviewed_at DESC
    `,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  createReview,
  getReviewBySubmissionId,
  updateReview,
  getPendingReviewsBySpecialist,
  getReviewsByPatient,
};