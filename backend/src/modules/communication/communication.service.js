const pool = require("../../database/db");

const createConversation = async (data) => {
  const { patient_id, parent_id, specialist_id } = data;

  const result = await pool.query(
    `INSERT INTO conversations (patient_id, parent_id, specialist_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [patient_id, parent_id, specialist_id]
  );

  return result.rows[0];
};

const getAllConversations = async () => {
  const result = await pool.query(
    `SELECT c.*,
            p.full_name AS patient_name,
            parent.full_name AS parent_name,
            specialist.full_name AS specialist_name
     FROM conversations c
     LEFT JOIN patients p ON c.patient_id = p.id
     JOIN users parent ON c.parent_id = parent.id
     JOIN users specialist ON c.specialist_id = specialist.id
     ORDER BY c.created_at DESC`
  );

  return result.rows;
};

const getConversationById = async (id) => {
  const result = await pool.query(
    `SELECT c.*,
            p.full_name AS patient_name,
            parent.full_name AS parent_name,
            specialist.full_name AS specialist_name
     FROM conversations c
     LEFT JOIN patients p ON c.patient_id = p.id
     JOIN users parent ON c.parent_id = parent.id
     JOIN users specialist ON c.specialist_id = specialist.id
     WHERE c.id = $1`,
    [id]
  );

  return result.rows[0];
};

const getUserConversations = async (userId) => {
  const result = await pool.query(
    `SELECT c.*,
            p.full_name AS patient_name,
            parent.full_name AS parent_name,
            specialist.full_name AS specialist_name
     FROM conversations c
     LEFT JOIN patients p ON c.patient_id = p.id
     JOIN users parent ON c.parent_id = parent.id
     JOIN users specialist ON c.specialist_id = specialist.id
     WHERE c.parent_id = $1 OR c.specialist_id = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );

  return result.rows;
};

const getPatientConversations = async (patientId) => {
  const result = await pool.query(
    `SELECT c.*,
            p.full_name AS patient_name,
            parent.full_name AS parent_name,
            specialist.full_name AS specialist_name
     FROM conversations c
     LEFT JOIN patients p ON c.patient_id = p.id
     JOIN users parent ON c.parent_id = parent.id
     JOIN users specialist ON c.specialist_id = specialist.id
     WHERE c.patient_id = $1
     ORDER BY c.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const createMessage = async (conversationId, data) => {
  const { sender_id, content } = data;

  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, sender_id, content]
  );

  return result.rows[0];
};

const getConversationMessages = async (conversationId) => {
  const result = await pool.query(
    `SELECT m.*,
            u.full_name AS sender_name,
            u.role AS sender_role
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = $1
     ORDER BY m.sent_at ASC`,
    [conversationId]
  );

  return result.rows;
};

const addMessageAttachment = async (messageId, data) => {
  const { file_url, file_type } = data;

  const result = await pool.query(
    `INSERT INTO message_attachments (message_id, file_url, file_type)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [messageId, file_url, file_type]
  );

  return result.rows[0];
};

const markMessageAsRead = async (messageId) => {
  const result = await pool.query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE id = $1
     RETURNING *`,
    [messageId]
  );

  return result.rows[0];
};

module.exports = {
  createConversation,
  getAllConversations,
  getConversationById,
  getUserConversations,
  getPatientConversations,
  createMessage,
  getConversationMessages,
  addMessageAttachment,
  markMessageAsRead
};