const db = require("../../database/db");

const getPatientById = async (patientId) => {
  const result = await db.query(
    `SELECT id, full_name FROM patients WHERE id = $1`,
    [patientId]
  );

  return result.rows[0];
};

const buildReportSummary = ({ patient, progress, goals, reviews, type }) => {
  const periodLabel = type === "weekly" ? "weekly" : "monthly";

  const completedExercises = progress?.exercises_completed || 0;
  const averagePerformance = progress?.average_performance || 0;
  const improvement = progress?.improvement_percentage || 0;
  const totalGoals = goals.total_goals || 0;
  const achievedGoals = goals.achieved_goals || 0;
  const avgRating = reviews.average_rating || 0;

  return `
AI ${periodLabel} report for ${patient.full_name}.

Progress Summary:
- Completed exercises: ${completedExercises}
- Average performance: ${averagePerformance}
- Improvement percentage: ${improvement}%

Goals Summary:
- Achieved goals: ${achievedGoals} out of ${totalGoals}

Specialist Reviews:
- Average review rating: ${avgRating}/10

Recommendation:
${improvement >= 15
  ? "The patient is showing strong improvement. Continue with the current treatment plan."
  : improvement >= 5
  ? "The patient is improving gradually. Keep monitoring performance and continue assigned exercises."
  : "The patient needs additional support. Consider reviewing the treatment plan and assigning simpler exercises."}
`.trim();
};

const generateReport = async ({ patient_id, period_start, period_end, type }) => {
  const patient = await getPatientById(patient_id);

  if (!patient) {
    throw new Error("Patient not found");
  }

  const progressResult = await db.query(
    `
    SELECT *
    FROM progress_snapshots
    WHERE patient_id = $1
      AND period = $2
      AND period_start >= $3
      AND period_end <= $4
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [patient_id, type, period_start, period_end]
  );

  const goalsResult = await db.query(
  `
  SELECT
    COUNT(g.id)::int AS total_goals,
    COUNT(*) FILTER (WHERE g.is_achieved = true)::int AS achieved_goals
  FROM goals g
  JOIN treatment_plans tp ON tp.id = g.plan_id
  WHERE tp.patient_id = $1
    AND (g.target_date IS NULL OR g.target_date BETWEEN $2 AND $3)
  `,
  [patient_id, period_start, period_end]
);

  const reviewsResult = await db.query(
  `
  SELECT COALESCE(ROUND(AVG(er.performance_rating), 1), 0) AS average_rating
  FROM exercise_reviews er
  JOIN exercise_submissions es ON es.id = er.submission_id
  JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
  WHERE ae.patient_id = $1
    AND er.reviewed_at::date BETWEEN $2 AND $3
  `,
  [patient_id, period_start, period_end]
);

  const summary = buildReportSummary({
    patient,
    progress: progressResult.rows[0],
    goals: goalsResult.rows[0],
    reviews: reviewsResult.rows[0],
    type
  });

  const insertResult = await db.query(
    `
    INSERT INTO ai_reports
      (patient_id, type, period_start, period_end, summary)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [patient_id, type, period_start, period_end, summary]
  );

  return insertResult.rows[0];
};

const getAllReports = async () => {
  const result = await db.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_reports ar
    JOIN patients p ON p.id = ar.patient_id
    ORDER BY ar.generated_at DESC
    `
  );

  return result.rows;
};

const getReportById = async (id) => {
  const result = await db.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_reports ar
    JOIN patients p ON p.id = ar.patient_id
    WHERE ar.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getReportsByPatient = async (patientId) => {
  const result = await db.query(
    `
    SELECT *
    FROM ai_reports
    WHERE patient_id = $1
    ORDER BY generated_at DESC
    `,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  generateReport,
  getAllReports,
  getReportById,
  getReportsByPatient
};