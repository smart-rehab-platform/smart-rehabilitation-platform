const pool = require("../../database/db");
const notificationsService = require("./notifications.service");

const getActiveAdminIds = async () => {
  const result = await pool.query(
    `SELECT id FROM users WHERE role = 'admin' AND is_active = true`
  );
  return result.rows.map((row) => row.id);
};

const notifyAllAdmins = async ({
  title,
  body,
  type = "general",
  related_entity_type = null,
  related_entity_id = null,
  excludeUserId = null,
}) => {
  try {
    const adminIds = await getActiveAdminIds();
    const targets = excludeUserId
      ? adminIds.filter((id) => id !== excludeUserId)
      : adminIds;

    for (const adminId of targets) {
      await notificationsService.createNotification({
        user_id: adminId,
        type,
        title,
        body,
        related_entity_type,
        related_entity_id,
      });
    }
  } catch (err) {
    console.error("Failed to notify admins:", err.message);
  }
};

module.exports = {
  notifyAllAdmins,
  getActiveAdminIds,
};
