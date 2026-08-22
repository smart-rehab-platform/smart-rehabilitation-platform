const pool = require("../../database/db");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");
const { canAccessPatient, isSpecialistAssignedToPatient } = require("../../utils/patientAccess");
const { generateReportPdfFile } = require("./reportPdf.generator");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createReport = async (data) => {
  const { patient_id, generated_by, report_type, title, summary } = data;

  const result = await pool.query(
    `INSERT INTO reports
     (patient_id, generated_by, report_type, title, summary, pdf_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [patient_id, generated_by, report_type, title, summary, null]
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

const assertActorCanAccessReportPatient = async (actor, patientId) => {
  if (!actor) {
    throw createError("Unauthorized", 401);
  }

  const allowed = await canAccessPatient(patientId, actor);
  if (!allowed) {
    throw createError("You do not have access to this patient.", 403);
  }
};

const getAllReports = async (actor) => {
  const role = String(actor?.role || "").toLowerCase();

  if (role === "admin") {
    const result = await pool.query(
      `SELECT r.*,
              p.full_name AS patient_name,
              p.profile_image_url AS patient_profile_image_url,
              u.full_name AS generated_by_name
       FROM reports r
       JOIN patients p ON r.patient_id = p.id
       LEFT JOIN users u ON r.generated_by = u.id
       ORDER BY r.created_at DESC`
    );

    return result.rows;
  }

  if (role === "specialist") {
    const result = await pool.query(
      `SELECT r.*,
              p.full_name AS patient_name,
              p.profile_image_url AS patient_profile_image_url,
              u.full_name AS generated_by_name
       FROM reports r
       JOIN patients p ON r.patient_id = p.id
       LEFT JOIN users u ON r.generated_by = u.id
       JOIN patient_specialists ps
         ON ps.patient_id = r.patient_id
        AND ps.specialist_id = $1
       ORDER BY r.created_at DESC`,
      [actor.id]
    );

    return result.rows;
  }

  throw createError("Access forbidden. You do not have permission", 403);
};

const getReportById = async (id) => {
  const result = await pool.query(
    `SELECT r.*,
            p.full_name AS patient_name,
            p.profile_image_url AS patient_profile_image_url,
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

  const [diagnosesResult, treatmentPlanResult] = await Promise.all([
    pool.query(
      `SELECT diagnosis_title, description, diagnosed_at
       FROM diagnoses
       WHERE patient_id = $1
       ORDER BY diagnosed_at DESC, created_at DESC
       LIMIT 1`,
      [patientId]
    ),
    pool.query(
      `SELECT title
       FROM treatment_plans
       WHERE patient_id = $1
         AND status = 'active'
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      [patientId]
    ),
  ]);

  return {
    report,
    diagnoses: diagnosesResult.rows,
    treatmentPlan: treatmentPlanResult.rows[0] ?? null,
  };
};

const exportReportPdf = async (id, actor) => {
  const report = await getReportById(id);

  if (!report) {
    return null;
  }

  const role = String(actor?.role || "").toLowerCase();
  if (role === "admin") {
    // Admin may export any regular report.
  } else if (role === "specialist") {
    const assigned = await isSpecialistAssignedToPatient(actor.id, report.patient_id);
    if (!assigned) {
      throw createError("You do not have access to this patient.", 403);
    }
  } else {
    throw createError("Access forbidden. You do not have permission", 403);
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
  assertActorCanAccessReportPatient,
};
