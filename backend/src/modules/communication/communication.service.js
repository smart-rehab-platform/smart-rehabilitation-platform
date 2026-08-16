const pool = require("../../database/db");
const notificationsService = require("../notifications/notifications.service");
const {
  isTrustedUploadUrl,
  buildAttachmentNotificationPreview,
} = require("../../config/messageAttachments");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const CONVERSATION_SELECT = `
  SELECT c.*,
         p.full_name AS patient_name,
         parent.full_name AS parent_name,
         specialist.full_name AS specialist_name
  FROM conversations c
  LEFT JOIN patients p ON c.patient_id = p.id
  JOIN users parent ON c.parent_id = parent.id
  JOIN users specialist ON c.specialist_id = specialist.id
`;

const isAdmin = (user) => user?.role === "admin";

const isConversationParticipant = (conversation, user) => {
  if (!conversation || !user) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  return (
    conversation.parent_id === user.id ||
    conversation.specialist_id === user.id
  );
};

const assertConversationAccess = (conversation, user) => {
  if (!conversation) {
    throw createError("Conversation not found.", 404);
  }

  if (!isConversationParticipant(conversation, user)) {
    throw createError(
      "You are not a participant in this conversation.",
      403
    );
  }
};

const assertCaseRequestConversationWritable = async (conversation) => {
  if (!conversation?.case_request_id) {
    return;
  }

  const result = await pool.query(
    `SELECT status
     FROM case_intake_requests
     WHERE id = $1`,
    [conversation.case_request_id]
  );

  if (result.rows[0]?.status === "rejected") {
    throw createError(
      "This conversation is read-only because the case request was rejected.",
      409
    );
  }
};

const isParentLinkedToPatient = async (parentId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_guardians
     WHERE parent_id = $1 AND patient_id = $2
     LIMIT 1`,
    [parentId, patientId]
  );

  return result.rows.length > 0;
};

const isSpecialistAssignedToPatient = async (specialistId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_specialists
     WHERE specialist_id = $1 AND patient_id = $2
     LIMIT 1`,
    [specialistId, patientId]
  );

  return result.rows.length > 0;
};

const canAccessPatientConversations = async (patientId, user) => {
  if (isAdmin(user)) {
    return true;
  }

  if (user.role === "parent") {
    return isParentLinkedToPatient(user.id, patientId);
  }

  if (user.role === "specialist") {
    return isSpecialistAssignedToPatient(user.id, patientId);
  }

  return false;
};

const findExistingConversation = async (parentId, specialistId, patientId) => {
  const result = await pool.query(
    `${CONVERSATION_SELECT}
     WHERE c.parent_id = $1
       AND c.specialist_id = $2
       AND c.patient_id IS NOT DISTINCT FROM $3
     LIMIT 1`,
    [parentId, specialistId, patientId ?? null]
  );

  return result.rows[0] || null;
};

const validateConversationCreation = async (data, user) => {
  const { patient_id, parent_id, specialist_id } = data;

  if (!parent_id || !specialist_id) {
    throw createError(
      "Parent and specialist are required to create a conversation.",
      400
    );
  }

  if (!patient_id) {
    throw createError(
      "A patient is required to create a conversation.",
      400
    );
  }

  if (!isAdmin(user)) {
    if (user.role === "parent" && user.id !== parent_id) {
      throw createError("Access denied.", 403);
    }

    if (user.role === "specialist" && user.id !== specialist_id) {
      throw createError("Access denied.", 403);
    }

    if (user.role !== "parent" && user.role !== "specialist") {
      throw createError("Access denied.", 403);
    }
  }

  const patientResult = await pool.query(
    `SELECT id FROM patients WHERE id = $1`,
    [patient_id]
  );

  if (!patientResult.rows[0]) {
    throw createError("Patient not found.", 404);
  }

  const parentLinked = await isParentLinkedToPatient(parent_id, patient_id);
  const specialistAssigned = await isSpecialistAssignedToPatient(
    specialist_id,
    patient_id
  );

  if (!parentLinked || !specialistAssigned) {
    throw createError(
      "Invalid patient relationship. The parent and specialist must both be linked to this patient.",
      400
    );
  }
};

const createCaseRequestConversation = async (
  client,
  { caseRequestId, parentId, specialistId }
) => {
  const result = await client.query(
    `INSERT INTO conversations (patient_id, parent_id, specialist_id, case_request_id)
     VALUES (NULL, $1, $2, $3)
     RETURNING id, case_request_id, patient_id, parent_id, specialist_id`,
    [parentId, specialistId, caseRequestId]
  );

  return result.rows[0];
};

const createConversation = async (data, user) => {
  await validateConversationCreation(data, user);

  const { patient_id, parent_id, specialist_id } = data;

  const existing = await findExistingConversation(
    parent_id,
    specialist_id,
    patient_id
  );

  if (existing) {
    return { conversation: existing, created: false };
  }

  const result = await pool.query(
    `INSERT INTO conversations (patient_id, parent_id, specialist_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [patient_id, parent_id, specialist_id]
  );

  const created = await getConversationById(result.rows[0].id);
  return { conversation: created, created: true };
};

const getAllConversations = async () => {
  const result = await pool.query(
    `${CONVERSATION_SELECT}
     ORDER BY c.created_at DESC`
  );

  return result.rows;
};

const getConversationById = async (id) => {
  const result = await pool.query(
    `${CONVERSATION_SELECT}
     WHERE c.id = $1`,
    [id]
  );

  return result.rows[0];
};

const getConversationByIdForUser = async (id, user) => {
  const conversation = await getConversationById(id);
  assertConversationAccess(conversation, user);
  return conversation;
};

const getUserConversations = async (userId) => {
  const result = await pool.query(
    `${CONVERSATION_SELECT}
     WHERE c.parent_id = $1 OR c.specialist_id = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );

  return result.rows;
};

const getPatientConversations = async (patientId) => {
  const result = await pool.query(
    `${CONVERSATION_SELECT}
     WHERE c.patient_id = $1
     ORDER BY c.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const getMessageById = async (messageId) => {
  const result = await pool.query(
    `SELECT *
     FROM messages
     WHERE id = $1`,
    [messageId]
  );

  return result.rows[0] || null;
};

const notifyMessageRecipient = async (
  conversation,
  sender,
  message,
  attachmentFileType = null
) => {
  if (!conversation || !sender || !message) {
    return;
  }

  let recipientId = null;

  if (sender.role === "parent") {
    recipientId = conversation.specialist_id;
  } else if (sender.role === "specialist") {
    recipientId = conversation.parent_id;
  }

  if (!recipientId || recipientId === sender.id) {
    return;
  }

  const preview =
    message.content && String(message.content).trim().length > 0
      ? String(message.content).trim().slice(0, 120)
      : buildAttachmentNotificationPreview(attachmentFileType, null);

  await notificationsService.createNotification({
    user_id: recipientId,
    type: "new_message",
    title: `New message from ${sender.full_name || "a participant"}`,
    body: preview,
    related_entity_type: "conversation",
    related_entity_id: conversation.id,
  });
};

const createMessage = async (conversationId, content, senderId, user) => {
  const conversation = await getConversationById(conversationId);
  assertConversationAccess(conversation, user);
  await assertCaseRequestConversationWritable(conversation);

  const trimmedContent =
    content === null || content === undefined ? "" : String(content).trim();

  if (!trimmedContent) {
    throw createError("Message content cannot be empty.", 400);
  }

  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, senderId, trimmedContent]
  );

  const message = result.rows[0];

  const senderResult = await pool.query(
    `SELECT id, full_name, role
     FROM users
     WHERE id = $1`,
    [senderId]
  );

  const sender = senderResult.rows[0];

  try {
    await notifyMessageRecipient(conversation, sender, message);
  } catch (_notificationError) {
    // Message delivery must succeed even if notification creation fails.
  }

  return {
    ...message,
    sender_name: sender?.full_name ?? null,
    sender_role: sender?.role ?? null,
    attachments: [],
  };
};

const attachAttachmentsToMessages = async (messages) => {
  if (!messages.length) {
    return [];
  }

  const messageIds = messages.map((message) => message.id);
  const attachmentsResult = await pool.query(
    `SELECT *
     FROM message_attachments
     WHERE message_id = ANY($1::uuid[])
     ORDER BY created_at ASC`,
    [messageIds]
  );

  const attachmentsByMessageId = new Map();
  for (const attachment of attachmentsResult.rows) {
    const existing = attachmentsByMessageId.get(attachment.message_id) || [];
    existing.push(attachment);
    attachmentsByMessageId.set(attachment.message_id, existing);
  }

  return messages.map((message) => ({
    ...message,
    attachments: attachmentsByMessageId.get(message.id) || [],
  }));
};

const createConversationAttachmentMessage = async (
  conversationId,
  data,
  senderId,
  user
) => {
  const conversation = await getConversationById(conversationId);
  assertConversationAccess(conversation, user);
  await assertCaseRequestConversationWritable(conversation);

  const fileUrl = data?.file_url;
  const fileType = data?.file_type ?? null;
  const caption =
    data?.content === null || data?.content === undefined
      ? ""
      : String(data.content).trim();

  if (!isTrustedUploadUrl(fileUrl)) {
    throw createError(
      "A valid uploaded file URL is required.",
      400
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const messageResult = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, senderId, caption || null]
    );

    const message = messageResult.rows[0];

    const attachmentResult = await client.query(
      `INSERT INTO message_attachments (message_id, file_url, file_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [message.id, String(fileUrl).trim(), fileType]
    );

    await client.query("COMMIT");

    const senderResult = await pool.query(
      `SELECT id, full_name, role
       FROM users
       WHERE id = $1`,
      [senderId]
    );
    const sender = senderResult.rows[0];

    const fullMessage = {
      ...message,
      sender_name: sender?.full_name ?? null,
      sender_role: sender?.role ?? null,
      attachments: [attachmentResult.rows[0]],
    };

    try {
      await notifyMessageRecipient(
        conversation,
        sender,
        message,
        fileType
      );
    } catch (_notificationError) {
      // Attachment delivery must succeed even if notification creation fails.
    }

    return fullMessage;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getConversationMessages = async (conversationId, user) => {
  const conversation = await getConversationById(conversationId);
  assertConversationAccess(conversation, user);

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

  return attachAttachmentsToMessages(result.rows);
};

const addMessageAttachment = async (messageId, data, user) => {
  const message = await getMessageById(messageId);

  if (!message) {
    throw createError("Message not found.", 404);
  }

  const conversation = await getConversationById(message.conversation_id);
  assertConversationAccess(conversation, user);
  await assertCaseRequestConversationWritable(conversation);

  const { file_url, file_type } = data;

  if (!file_url || String(file_url).trim().length === 0) {
    throw createError("A file URL is required.", 400);
  }

  if (!isTrustedUploadUrl(file_url)) {
    throw createError("A valid uploaded file URL is required.", 400);
  }

  const result = await pool.query(
    `INSERT INTO message_attachments (message_id, file_url, file_type)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [messageId, file_url, file_type ?? null]
  );

  return result.rows[0];
};

const markMessageAsRead = async (messageId, user) => {
  const message = await getMessageById(messageId);

  if (!message) {
    throw createError("Message not found.", 404);
  }

  const conversation = await getConversationById(message.conversation_id);
  assertConversationAccess(conversation, user);

  if (message.sender_id === user.id) {
    throw createError("You cannot mark your own message as read.", 403);
  }

  const result = await pool.query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE id = $1
     RETURNING *`,
    [messageId]
  );

  return result.rows[0];
};

const markConversationMessagesAsRead = async (conversationId, user) => {
  const conversation = await getConversationById(conversationId);
  assertConversationAccess(conversation, user);

  const result = await pool.query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE conversation_id = $1
       AND sender_id IS DISTINCT FROM $2
       AND is_read = FALSE
     RETURNING *`,
    [conversationId, user.id]
  );

  return result.rows;
};

module.exports = {
  createCaseRequestConversation,
  createConversation,
  getAllConversations,
  getConversationById,
  getConversationByIdForUser,
  getUserConversations,
  getPatientConversations,
  canAccessPatientConversations,
  createMessage,
  createConversationAttachmentMessage,
  getConversationMessages,
  addMessageAttachment,
  markMessageAsRead,
  markConversationMessagesAsRead,
  isAdmin,
};
