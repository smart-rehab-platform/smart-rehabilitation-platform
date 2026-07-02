const pool = require("../../database/db");
const { createAuditLog } = require("./auditLogs.helper");

const getAllAuditLogs = async (filters = {}) => {
  const { user_id, action, entity_name, date_from, date_to } = filters;
  const conditions = [];
  const params = [];
  let index = 1;

  if (user_id) {
    conditions.push(`al.user_id = $${index++}`);
    params.push(user_id);
  }

  if (action) {
    conditions.push(`al.action ILIKE $${index++}`);
    params.push(`%${action}%`);
  }

  if (entity_name) {
    conditions.push(`al.entity_name = $${index++}`);
    params.push(entity_name);
  }

  if (date_from) {
    conditions.push(`al.created_at >= $${index++}`);
    params.push(date_from);
  }

  if (date_to) {
    conditions.push(`al.created_at <= $${index++}`);
    params.push(date_to);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT
       al.*,
       u.full_name AS user_name,
       u.email AS user_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT 500`,
    params
  );

  return result.rows;
};

const getAuditLogById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM audit_logs
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

const getAuditLogsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM audit_logs
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

const getAuditLogsByEntity = async (entityName, entityId) => {
  const result = await pool.query(
    `SELECT * FROM audit_logs
     WHERE entity_name = $1
     AND entity_id = $2
     ORDER BY created_at DESC`,
    [entityName, entityId]
  );

  return result.rows;
};

module.exports = {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByEntity,
};