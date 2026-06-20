const pool = require("../../database/db");

const getAllAuditLogs = async () => {
  const result = await pool.query(
    `SELECT * FROM audit_logs
     ORDER BY created_at DESC`
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
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByEntity,
};