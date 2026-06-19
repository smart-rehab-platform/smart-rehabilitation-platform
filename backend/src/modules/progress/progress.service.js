const pool = require("../../database/db");

const createSnapshot = async (data) => {
  const {
    patient_id,
    period,
    period_start,
    period_end,
    exercises_completed = 0,
    average_performance = null,
    improvement_percentage = null
  } = data;

  const result = await pool.query(
    `
    INSERT INTO progress_snapshots
    (patient_id, period, period_start, period_end, exercises_completed, average_performance, improvement_percentage)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      patient_id,
      period,
      period_start,
      period_end,
      exercises_completed,
      average_performance,
      improvement_percentage
    ]
  );

  return result.rows[0];
};

const getAllSnapshots = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM progress_snapshots
    ORDER BY period_start DESC
    `
  );

  return result.rows;
};

const getPatientProgress = async (patientId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM progress_snapshots
    WHERE patient_id = $1
    ORDER BY period_start DESC
    `,
    [patientId]
  );

  return result.rows;
};

const getPatientProgressByPeriod = async (patientId, period) => {
  const result = await pool.query(
    `
    SELECT *
    FROM progress_snapshots
    WHERE patient_id = $1 AND period = $2
    ORDER BY period_start DESC
    `,
    [patientId, period]
  );

  return result.rows;
};

const getImprovementPercentage = async (patientId) => {
  const result = await pool.query(
    `
    SELECT improvement_percentage
    FROM progress_snapshots
    WHERE patient_id = $1
      AND improvement_percentage IS NOT NULL
    ORDER BY period_start DESC
    LIMIT 1
    `,
    [patientId]
  );

  return result.rows[0] || null;
};

const getPerformanceMetrics = async (patientId) => {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(exercises_completed), 0) AS total_exercises_completed,
      ROUND(AVG(average_performance), 2) AS average_performance,
      ROUND(AVG(improvement_percentage), 2) AS average_improvement
    FROM progress_snapshots
    WHERE patient_id = $1
    `,
    [patientId]
  );

  return result.rows[0];
};

module.exports = {
  createSnapshot,
  getAllSnapshots,
  getPatientProgress,
  getPatientProgressByPeriod,
  getImprovementPercentage,
  getPerformanceMetrics
};