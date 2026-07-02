const pool = require("../../database/db");

const createAuditLog = async ({ userId, action, entityName, entityId }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_name, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [userId || null, action, entityName || null, entityId || null]
    );
  } catch (error) {
    console.error("[audit] Failed to write audit log:", error.message);
  }
};

module.exports = { createAuditLog };
