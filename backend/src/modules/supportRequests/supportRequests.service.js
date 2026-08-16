const pool = require("../../database/db");
const notificationsService = require("../notifications/notifications.service");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");
const { isTrustedUploadUrl } = require("../../config/messageAttachments");
const { SUPPORT_REQUEST_CATEGORIES } = require("./supportRequests.validation");

const createError = (message, statusCode, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
};

const assertTrustedAttachmentUrl = (attachmentUrl) => {
  if (!attachmentUrl) {
    return;
  }

  if (!isTrustedUploadUrl(attachmentUrl)) {
    throw createError("Attachment URL must reference a trusted uploaded file", 400);
  }
};

const REQUEST_BASE_SELECT = `
  SELECT
    sr.*,
    specialist_u.full_name AS specialist_name,
    specialist_u.email AS specialist_email,
    resolver.full_name AS resolver_name
  FROM support_requests sr
  JOIN users specialist_u ON specialist_u.id = sr.specialist_id
  LEFT JOIN users resolver ON resolver.id = sr.resolved_by
`;

const formatSupportRequest = (row, { includeMessages = false, messages = [] } = {}) => {
  if (!row) {
    return null;
  }

  const request = {
    id: row.id,
    specialist_id: row.specialist_id,
    category: row.category,
    subject: row.subject,
    status: row.status,
    last_message_at: row.last_message_at,
    resolved_at: row.resolved_at,
    resolved_by: row.resolved_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    specialist: {
      id: row.specialist_id,
      fullName: row.specialist_name,
      email: row.specialist_email,
    },
    resolver: row.resolved_by
      ? {
          id: row.resolved_by,
          fullName: row.resolver_name,
        }
      : null,
  };

  if (includeMessages) {
    request.messages = messages;
  }

  return request;
};

const formatMessage = (row) => ({
  id: row.id,
  support_request_id: row.support_request_id,
  sender_id: row.sender_id,
  content: row.content,
  attachment_url: row.attachment_url,
  created_at: row.created_at,
  sender: {
    id: row.sender_id,
    fullName: row.sender_name,
    role: row.sender_role,
  },
});

const fetchMessagesForRequest = async (supportRequestId, client = pool) => {
  const result = await client.query(
    `SELECT
       m.*,
       u.full_name AS sender_name,
       u.role AS sender_role
     FROM support_request_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.support_request_id = $1
     ORDER BY m.created_at ASC`,
    [supportRequestId]
  );
  return result.rows.map((row) => formatMessage(row));
};

const getSupportRequestRowById = async (supportRequestId, client = pool) => {
  const result = await client.query(
    `${REQUEST_BASE_SELECT} WHERE sr.id = $1`,
    [supportRequestId]
  );
  return result.rows[0] || null;
};

const getSupportRequestDetail = async (supportRequestId) => {
  const row = await getSupportRequestRowById(supportRequestId);
  if (!row) {
    return null;
  }

  const messages = await fetchMessagesForRequest(supportRequestId);
  return formatSupportRequest(row, { includeMessages: true, messages });
};

const assertSupportRequestAccessible = (row, specialistId) => {
  if (!row) {
    throw createError("Support request not found", 404);
  }

  if (specialistId && row.specialist_id !== specialistId) {
    throw createError("Support request not found", 404);
  }
};

const assertRequestIsOpen = (row) => {
  if (row.status === "resolved") {
    throw createError("Cannot reply to a resolved support request", 409, "request_resolved");
  }
};

const buildListFilters = (filters, { specialistId = null } = {}) => {
  const conditions = ["1=1"];
  const params = [];

  if (specialistId) {
    params.push(specialistId);
    conditions.push(`sr.specialist_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`sr.status = $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`sr.category = $${params.length}`);
  }

  if (filters.specialist_id) {
    params.push(filters.specialist_id);
    conditions.push(`sr.specialist_id = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`sr.created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`sr.created_at <= $${params.length}`);
  }

  return {
    whereClause: conditions.join(" AND "),
    params,
  };
};

exports.createSupportRequest = async ({
  specialistId,
  category,
  subject,
  description,
  attachmentUrl,
}) => {
  if (!SUPPORT_REQUEST_CATEGORIES.includes(category)) {
    throw createError("Invalid support request category", 400);
  }

  const trimmedSubject = String(subject || "").trim();
  const trimmedDescription = String(description || "").trim();

  if (trimmedSubject.length < 3 || trimmedSubject.length > 200) {
    throw createError("Subject must be between 3 and 200 characters", 400);
  }

  if (trimmedDescription.length < 20 || trimmedDescription.length > 2000) {
    throw createError("Description must be between 20 and 2000 characters", 400);
  }

  assertTrustedAttachmentUrl(attachmentUrl);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `INSERT INTO support_requests (
        specialist_id,
        category,
        subject,
        status,
        last_message_at
      ) VALUES ($1, $2, $3, 'pending', now())
      RETURNING id`,
      [specialistId, category, trimmedSubject]
    );

    const supportRequestId = requestResult.rows[0].id;

    await client.query(
      `INSERT INTO support_request_messages (
        support_request_id,
        sender_id,
        content,
        attachment_url
      ) VALUES ($1, $2, $3, $4)`,
      [supportRequestId, specialistId, trimmedDescription, attachmentUrl || null]
    );

    await client.query("COMMIT");

    const request = await getSupportRequestDetail(supportRequestId);

    await notifyAllAdmins({
      type: "support_request_submitted",
      title: "New specialist support request",
      body: `A specialist submitted a support request: ${trimmedSubject}`,
      related_entity_type: "support_request",
      related_entity_id: supportRequestId,
    });

    return request;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.listSpecialistSupportRequests = async (specialistId, filters = {}) => {
  const { whereClause, params } = buildListFilters(filters, { specialistId });

  const result = await pool.query(
    `${REQUEST_BASE_SELECT}
     WHERE ${whereClause}
     ORDER BY sr.last_message_at DESC`,
    params
  );

  return result.rows.map((row) => formatSupportRequest(row));
};

exports.getSpecialistSupportRequestById = async (specialistId, supportRequestId) => {
  const row = await getSupportRequestRowById(supportRequestId);
  assertSupportRequestAccessible(row, specialistId);

  const messages = await fetchMessagesForRequest(supportRequestId);
  return formatSupportRequest(row, { includeMessages: true, messages });
};

exports.listAdminSupportRequests = async (filters = {}) => {
  const { whereClause, params } = buildListFilters(filters);
  const page = Number.parseInt(filters.page, 10) > 0 ? Number.parseInt(filters.page, 10) : 1;
  const limit =
    Number.parseInt(filters.limit, 10) > 0
      ? Math.min(Number.parseInt(filters.limit, 10), 50)
      : 20;
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM support_requests sr
     WHERE ${whereClause}`,
    params
  );

  const listParams = [...params, limit, offset];
  const result = await pool.query(
    `${REQUEST_BASE_SELECT}
     WHERE ${whereClause}
     ORDER BY sr.last_message_at DESC
     LIMIT $${listParams.length - 1}
     OFFSET $${listParams.length}`,
    listParams
  );

  return {
    items: result.rows.map((row) => formatSupportRequest(row)),
    pagination: {
      page,
      limit,
      total: countResult.rows[0]?.total ?? 0,
      totalPages: Math.ceil((countResult.rows[0]?.total ?? 0) / limit),
    },
  };
};

exports.getAdminSupportRequestById = async (supportRequestId) => {
  const request = await getSupportRequestDetail(supportRequestId);
  if (!request) {
    throw createError("Support request not found", 404);
  }
  return request;
};

exports.addSpecialistMessage = async ({
  specialistId,
  supportRequestId,
  content,
  attachmentUrl,
}) => {
  const trimmedContent = String(content || "").trim();
  const attachment = attachmentUrl || null;

  if (!trimmedContent && !attachment) {
    throw createError("Message content or attachment is required", 400);
  }

  assertTrustedAttachmentUrl(attachment);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      `SELECT * FROM support_requests WHERE id = $1 FOR UPDATE`,
      [supportRequestId]
    );
    const current = currentResult.rows[0];

    assertSupportRequestAccessible(current, specialistId);
    assertRequestIsOpen(current);

    const messageResult = await client.query(
      `INSERT INTO support_request_messages (
        support_request_id,
        sender_id,
        content,
        attachment_url
      ) VALUES ($1, $2, $3, $4)
      RETURNING id`,
      [supportRequestId, specialistId, trimmedContent, attachment]
    );

    await client.query(
      `UPDATE support_requests
       SET last_message_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [supportRequestId]
    );

    await client.query("COMMIT");

    const request = await getSupportRequestDetail(supportRequestId);

    await notifyAllAdmins({
      type: "support_request_reply",
      title: "Specialist replied to a support request",
      body: trimmedContent
        ? trimmedContent.slice(0, 120)
        : "The specialist added an attachment to a support request.",
      related_entity_type: "support_request",
      related_entity_id: supportRequestId,
      excludeUserId: specialistId,
    });

    return {
      request,
      messageId: messageResult.rows[0].id,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.addAdminMessage = async ({
  adminId,
  supportRequestId,
  content,
  attachmentUrl,
}) => {
  const trimmedContent = String(content || "").trim();
  const attachment = attachmentUrl || null;

  if (!trimmedContent && !attachment) {
    throw createError("Message content or attachment is required", 400);
  }

  assertTrustedAttachmentUrl(attachment);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      `SELECT * FROM support_requests WHERE id = $1 FOR UPDATE`,
      [supportRequestId]
    );
    const current = currentResult.rows[0];

    if (!current) {
      throw createError("Support request not found", 404);
    }

    assertRequestIsOpen(current);

    const autoStarted = current.status === "pending";

    const messageResult = await client.query(
      `INSERT INTO support_request_messages (
        support_request_id,
        sender_id,
        content,
        attachment_url
      ) VALUES ($1, $2, $3, $4)
      RETURNING id`,
      [supportRequestId, adminId, trimmedContent, attachment]
    );

    if (autoStarted) {
      await client.query(
        `UPDATE support_requests
         SET status = 'in_progress',
             last_message_at = now(),
             updated_at = now()
         WHERE id = $1`,
        [supportRequestId]
      );
    } else {
      await client.query(
        `UPDATE support_requests
         SET last_message_at = now(),
             updated_at = now()
         WHERE id = $1`,
        [supportRequestId]
      );
    }

    await client.query("COMMIT");

    const request = await getSupportRequestDetail(supportRequestId);

    await notificationsService.createNotification({
      user_id: current.specialist_id,
      type: "support_request_reply",
      title: autoStarted
        ? "Administration is handling your support request"
        : "New reply on your support request",
      body: trimmedContent
        ? trimmedContent.slice(0, 120)
        : "The administration added an attachment to your support request.",
      related_entity_type: "support_request",
      related_entity_id: supportRequestId,
    }).catch((error) => {
      console.error("Failed to notify specialist about support request reply:", error.message);
    });

    return {
      request,
      messageId: messageResult.rows[0].id,
      autoStarted,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.updateSupportRequestStatus = async ({
  adminId,
  supportRequestId,
  status,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      `SELECT * FROM support_requests WHERE id = $1 FOR UPDATE`,
      [supportRequestId]
    );
    const current = currentResult.rows[0];

    if (!current) {
      throw createError("Support request not found", 404);
    }

    const allowedTransitions = {
      pending: ["in_progress", "resolved"],
      in_progress: ["resolved"],
      resolved: [],
    };

    const allowedNext = allowedTransitions[current.status] || [];
    if (!allowedNext.includes(status)) {
      throw createError(
        `Support request cannot transition from ${current.status} to ${status}`,
        409,
        "invalid_status_transition"
      );
    }

    const setResolved = status === "resolved";

    await client.query(
      `UPDATE support_requests
       SET status = $2,
           resolved_at = CASE WHEN $3 THEN now() ELSE resolved_at END,
           resolved_by = CASE WHEN $3 THEN $4 ELSE resolved_by END,
           updated_at = now()
       WHERE id = $1`,
      [supportRequestId, status, setResolved, adminId]
    );

    await client.query("COMMIT");

    const request = await getSupportRequestDetail(supportRequestId);

    const statusLabel = status === "in_progress" ? "In Progress" : "Resolved";
    await notificationsService.createNotification({
      user_id: current.specialist_id,
      type: "support_request_status_changed",
      title: "Support request status updated",
      body: `Your support request is now ${statusLabel}.`,
      related_entity_type: "support_request",
      related_entity_id: supportRequestId,
    }).catch((error) => {
      console.error("Failed to notify specialist about support request status:", error.message);
    });

    return request;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.SUPPORT_REQUEST_CATEGORIES = SUPPORT_REQUEST_CATEGORIES;
