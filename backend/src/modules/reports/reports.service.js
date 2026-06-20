const pool = require("../../database/db");

const createReport = async (data) => {
  const { patient_id, generated_by, report_type, title, summary, pdf_url } = data;

  const result = await pool.query(
    `INSERT INTO reports
     (patient_id, generated_by, report_type, title, summary, pdf_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [patient_id, generated_by, report_type, title, summary, pdf_url]
  );

  return result.rows[0];
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

const exportReportPdf = async (id, pdf_url) => {
  const result = await pool.query(
    `UPDATE reports
     SET pdf_url = $1
     WHERE id = $2
     RETURNING *`,
    [pdf_url, id]
  );

  return result.rows[0];
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  getPatientReports,
  getPatientWeeklyReports,
  getPatientMonthlyReports,
  exportReportPdf
};