const pool = require("../../database/db");

// Admin Dashboard
exports.getAdminOverview = async () => {
  const usersResult = await pool.query(
    `SELECT COUNT(*)::int AS total_users FROM users`
  );

  const patientsResult = await pool.query(
    `SELECT COUNT(*)::int AS total_patients FROM patients`
  );

  const exercisesResult = await pool.query(
    `SELECT COUNT(*)::int AS total_exercises FROM exercises`
  );

  const sessionsResult = await pool.query(
    `SELECT COUNT(*)::int AS total_sessions FROM sessions`
  );

  return {
    totalUsers: usersResult.rows[0].total_users,
    totalPatients: patientsResult.rows[0].total_patients,
    totalExercises: exercisesResult.rows[0].total_exercises,
    totalSessions: sessionsResult.rows[0].total_sessions,
  };
};

exports.getAdminUsers = async () => {
  const result = await pool.query(`
    SELECT
      role,
      COUNT(*)::int AS count
    FROM users
    GROUP BY role
    ORDER BY role
  `);

  return result.rows;
};

exports.getSystemAnalytics = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM patients) AS patients,
      (SELECT COUNT(*) FROM treatment_plans) AS treatment_plans,
      (SELECT COUNT(*) FROM exercises) AS exercises
  `);

  return result.rows[0];
};

// Specialist Dashboard
exports.getSpecialistOverview = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT
      (SELECT COUNT(*) FROM patient_specialists WHERE specialist_id = $1) AS active_cases,
      (SELECT COUNT(*) FROM sessions WHERE specialist_id = $1 AND status = 'scheduled') AS upcoming_sessions,
      (
        SELECT COUNT(*)
        FROM exercise_submissions es
        WHERE es.status = 'pending'
      ) AS pending_reviews
    `,
    [specialistId]
  );

  return result.rows[0];
};

exports.getSpecialistActiveCases = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT
      p.*
    FROM patients p
    JOIN patient_specialists ps
      ON ps.patient_id = p.id
    WHERE ps.specialist_id = $1
    ORDER BY p.created_at DESC
    `,
    [specialistId]
  );

  return result.rows;
};

exports.getSpecialistUpcomingSessions = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM sessions
    WHERE specialist_id = $1
      AND status = 'scheduled'
    ORDER BY scheduled_at ASC
    `,
    [specialistId]
  );

  return result.rows;
};

exports.getSpecialistPendingReviews = async () => {
  const result = await pool.query(`
    SELECT *
    FROM exercise_submissions
    WHERE status = 'pending'
    ORDER BY submitted_at DESC
  `);

  return result.rows;
};

// Parent Dashboard
exports.getParentOverview = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(DISTINCT pg.patient_id)::int AS children_count
    FROM patient_guardians pg
    WHERE pg.parent_id = $1
    `,
    [parentId]
  );

  return result.rows[0];
};

exports.getParentChildrenProgress = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.full_name,
      ps.period,
      ps.improvement_percentage
    FROM patient_guardians pg
    JOIN patients p
      ON p.id = pg.patient_id
    LEFT JOIN progress_snapshots ps
      ON ps.patient_id = p.id
    WHERE pg.parent_id = $1
    ORDER BY p.full_name
    `,
    [parentId]
  );

  return result.rows;
};

exports.getParentTasks = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      ae.*
    FROM assigned_exercises ae
    JOIN patient_guardians pg
      ON pg.patient_id = ae.patient_id
    WHERE pg.parent_id = $1
      AND ae.is_active = true
    ORDER BY ae.created_at DESC
    `,
    [parentId]
  );

  return result.rows;
};

exports.getParentReports = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      r.*
    FROM reports r
    JOIN patient_guardians pg
      ON pg.patient_id = r.patient_id
    WHERE pg.parent_id = $1
    ORDER BY r.created_at DESC
    `,
    [parentId]
  );

  return result.rows;
};