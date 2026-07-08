const pool = require("../../database/db");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");
const { generateReportPdfFile } = require("./reportPdf.generator");

const createReport = async (data) => {
  const { patient_id, generated_by, report_type, title, summary, pdf_url } = data;

  const result = await pool.query(
    `INSERT INTO reports
     (patient_id, generated_by, report_type, title, summary, pdf_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [patient_id, generated_by, report_type, title, summary, pdf_url]
  );

  const report = result.rows[0];

  const patientResult = await pool.query(
    "SELECT full_name FROM patients WHERE id = $1",
    [patient_id]
  );

  await notifyAllAdmins({
    title: "Report generated",
    body: `Report "${title}" was generated for patient ${patientResult.rows[0]?.full_name ?? "patient"}.`,
    related_entity_type: "report",
    related_entity_id: report.id,
  });

  return report;
};

const getAllReports = async () => {
  const result = await pool.query(
    `SELECT r.*,
            p.full_name AS patient_name,
            u.full_name AS generated_by_name
     FROM reports r
     JOIN patients p ON r.patient_id = p.id
     LEFT JOIN users u ON r.generated_by = u.id
     ORDER BY r.created_at DESC`
  );

  return result.rows;
};

const getReportById = async (id) => {
  const result = await pool.query(
    `SELECT r.*,
            p.full_name AS patient_name,
            u.full_name AS generated_by_name
     FROM reports r
     JOIN patients p ON r.patient_id = p.id
     LEFT JOIN users u ON r.generated_by = u.id
     WHERE r.id = $1`,
    [id]
  );

  return result.rows[0];
};

const deleteReport = async (id) => {
  const result = await pool.query(
    `DELETE FROM reports
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const getPatientReports = async (patientId) => {
  const result = await pool.query(
    `SELECT *
     FROM reports
     WHERE patient_id = $1
     ORDER BY created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const getPatientWeeklyReports = async (patientId) => {
  const result = await pool.query(
    `SELECT *
     FROM reports
     WHERE patient_id = $1
       AND report_type = 'weekly'
     ORDER BY created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const getPatientMonthlyReports = async (patientId) => {
  const result = await pool.query(
    `SELECT *
     FROM reports
     WHERE patient_id = $1
       AND report_type = 'monthly'
     ORDER BY created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const fetchReportPdfContext = async (report) => {
  const patientId = report.patient_id;

  const [
    diagnosesResult,
    treatmentPlanResult,
    goalsResult,
    progressResult,
    submissionsResult,
    speechResult,
    recommendationsResult,
  ] = await Promise.all([
    pool.query(
      `SELECT diagnosis_title, description, diagnosed_at
       FROM diagnoses
       WHERE patient_id = $1
       ORDER BY diagnosed_at DESC
       LIMIT 5`,
      [patientId]
    ),
    pool.query(
      `SELECT title, status, start_date, end_date
       FROM treatment_plans
       WHERE patient_id = $1
       ORDER BY
         CASE WHEN status = 'active' THEN 0 ELSE 1 END,
         created_at DESC
       LIMIT 1`,
      [patientId]
    ),
    pool.query(
      `SELECT g.title,
              g.term,
              g.is_achieved,
              gp.completion_percentage,
              gp.recorded_at AS progress_date
       FROM goals g
       JOIN treatment_plans tp ON g.plan_id = tp.id
       LEFT JOIN LATERAL (
         SELECT completion_percentage, recorded_at
         FROM goal_progress
         WHERE goal_id = g.id
         ORDER BY recorded_at DESC
         LIMIT 1
       ) gp ON TRUE
       WHERE tp.patient_id = $1
       ORDER BY g.created_at DESC
       LIMIT 10`,
      [patientId]
    ),
    pool.query(
      `SELECT period,
              period_start,
              period_end,
              exercises_completed,
              average_performance,
              improvement_percentage
       FROM progress_snapshots
       WHERE patient_id = $1
       ORDER BY period_end DESC
       LIMIT 5`,
      [patientId]
    ),
    pool.query(
      `SELECT es.status,
              es.submitted_at,
              e.title AS exercise_title,
              er.performance_rating,
              er.feedback
       FROM exercise_submissions es
       JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
       JOIN exercises e ON ae.exercise_id = e.id
       LEFT JOIN exercise_reviews er ON er.submission_id = es.id
       WHERE ae.patient_id = $1
       ORDER BY es.submitted_at DESC
       LIMIT 10`,
      [patientId]
    ),
    pool.query(
      `SELECT sa.transcript,
              sa.pronunciation_score,
              sa.fluency_score,
              sa.overall_score,
              sa.analyzed_at
       FROM speech_analyses sa
       JOIN exercise_submissions es ON sa.submission_id = es.id
       JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
       WHERE ae.patient_id = $1
       ORDER BY sa.analyzed_at DESC
       LIMIT 5`,
      [patientId]
    ),
    pool.query(
      `SELECT type, status, details, generated_at
       FROM ai_recommendations
       WHERE patient_id = $1
       ORDER BY generated_at DESC
       LIMIT 5`,
      [patientId]
    ),
  ]);

  return {
    report,
    diagnoses: diagnosesResult.rows,
    treatmentPlan: treatmentPlanResult.rows[0] ?? null,
    goals: goalsResult.rows,
    progressSnapshots: progressResult.rows,
    submissions: submissionsResult.rows,
    speechAnalyses: speechResult.rows,
    recommendations: recommendationsResult.rows,
  };
};

const exportReportPdf = async (id) => {
  const report = await getReportById(id);

  if (!report) {
    return null;
  }

  const context = await fetchReportPdfContext(report);
  const { publicUrl } = await generateReportPdfFile(context);

  await pool.query(
    `UPDATE reports
     SET pdf_url = $1
     WHERE id = $2`,
    [publicUrl, id]
  );

  const updatedReport = await getReportById(id);

  return {
    report: updatedReport,
    pdf_url: publicUrl,
  };
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  getPatientReports,
  getPatientWeeklyReports,
  getPatientMonthlyReports,
  exportReportPdf,
};
