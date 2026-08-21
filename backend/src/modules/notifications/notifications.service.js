const pool = require("../../database/db");
const { sendPushToUser } = require("./pushNotifications.service");

const buildPushData = (notification) => {
  if (!notification) {
    return undefined;
  }

  const fields = {
    notificationId: notification.id,
    type: notification.type,
    relatedEntityType: notification.related_entity_type,
    relatedEntityId: notification.related_entity_id,
  };

  const data = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      continue;
    }

    const asString = String(value).trim();
    if (!asString) {
      continue;
    }

    data[key] = asString;
  }

  return Object.keys(data).length > 0 ? data : undefined;
};

const createNotification = async (data) => {
  const {
    user_id,
    type,
    title,
    body,
    related_entity_type,
    related_entity_id
  } = data;

  const result = await pool.query(
    `INSERT INTO notifications
     (user_id, type, title, body, related_entity_type, related_entity_id)
     VALUES ($1, $2::notification_type, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, type, title, body, related_entity_type, related_entity_id]
  );

  const notification = result.rows[0];

  try {
    await sendPushToUser({
      userId: notification.user_id,
      title: notification.title,
      body: notification.body,
      data: buildPushData(notification),
    });
  } catch (error) {
    console.error(
      "[push] Failed to deliver notification push:",
      error.message
    );
  }

  return notification;
};

const getAllNotifications = async () => {
  const result = await pool.query(
    `SELECT n.*,
            u.full_name AS user_name
     FROM notifications n
     JOIN users u ON n.user_id = u.id
     ORDER BY n.created_at DESC`
  );

  return result.rows;
};

const getNotificationById = async (id) => {
  const result = await pool.query(
    `SELECT n.*,
            u.full_name AS user_name
     FROM notifications n
     JOIN users u ON n.user_id = u.id
     WHERE n.id = $1`,
    [id]
  );

  return result.rows[0];
};

const getUserNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

const getUserUnreadNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id = $1
       AND is_read = false
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

const markAsRead = async (id) => {
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const markAllAsRead = async (userId) => {
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1
       AND is_read = false
     RETURNING *`,
    [userId]
  );

  return result.rows;
};

const deleteNotification = async (id) => {
  const result = await pool.query(
    `DELETE FROM notifications
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getUserNotifications,
  getUserUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};