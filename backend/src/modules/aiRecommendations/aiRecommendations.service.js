const pool = require("../../database/db");

const generateRecommendation = async ({ patient_id, related_plan_id, type }) => {
  const patientResult = await pool.query(
    `SELECT id, full_name FROM patients WHERE id = $1`,
    [patient_id]
  );

  if (patientResult.rows.length === 0) {
    throw new Error("Patient not found");
  }

  const progressResult = await pool.query(
    `
    SELECT *
    FROM progress_snapshots
    WHERE patient_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [patient_id]
  );

  const exercisesResult = await pool.query(
    `
    SELECT e.id, e.title, e.description, e.instructions
    FROM exercises e
    ORDER BY e.created_at DESC
    LIMIT 3
    `
  );

  const latestProgress = progressResult.rows[0];

  let details;

  if (type === "exercise_suggestion") {
    details = {
      reason: latestProgress
        ? `Based on latest progress: average performance ${latestProgress.average_performance}, improvement ${latestProgress.improvement_percentage}%`
        : "No progress data found, suggesting general beginner exercises.",
      suggested_exercises: exercisesResult.rows,
    };
  } else {
    details = {
      reason: latestProgress
        ? `Plan adjustment suggested based on improvement percentage ${latestProgress.improvement_percentage}%`
        : "No progress data found, specialist should review the plan manually.",
      suggestion:
        latestProgress && latestProgress.improvement_percentage < 50
          ? "Consider reducing exercise difficulty or increasing specialist follow-up."
          : "Current plan seems acceptable, continue monitoring progress.",
    };
  }

  const result = await pool.query(
    `
    INSERT INTO ai_recommendations
    (patient_id, related_plan_id, type, details)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [patient_id, related_plan_id || null, type, details]
  );

  return result.rows[0];
};

const getAllRecommendations = async () => {
  const result = await pool.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_recommendations ar
    JOIN patients p ON ar.patient_id = p.id
    ORDER BY ar.generated_at DESC
    `
  );

  return result.rows;
};

const getRecommendationById = async (id) => {
  const result = await pool.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_recommendations ar
    JOIN patients p ON ar.patient_id = p.id
    WHERE ar.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getRecommendationsByPatient = async (patientId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM ai_recommendations
    WHERE patient_id = $1
    ORDER BY generated_at DESC
    `,
    [patientId]
  );

  return result.rows;
};

const updateRecommendationStatus = async (id, status, reviewedBy) => {
  const result = await pool.query(
    `
    UPDATE ai_recommendations
    SET status = $1,
        reviewed_by = $2,
        reviewed_at = now()
    WHERE id = $3
    RETURNING *
    `,
    [status, reviewedBy || null, id]
  );

  return result.rows[0];
};

module.exports = {
  generateRecommendation,
  getAllRecommendations,
  getRecommendationById,
  getRecommendationsByPatient,
  updateRecommendationStatus,
};