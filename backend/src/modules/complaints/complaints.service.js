const pool = require("../../database/db");
const notificationsService = require("../notifications/notifications.service");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");
const { COMPLAINT_CATEGORIES } = require("./complaints.validation");

const ATTENTION_THRESHOLD = 3;
const WARNING_THRESHOLD = 5;
const LOOKBACK_DAYS = 90;

const createError = (message, statusCode, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
};

const BASE_SELECT = `
  SELECT
    c.*,
    parent_u.full_name AS parent_name,
    patient.full_name AS patient_name,
    specialist_u.full_name AS specialist_name,
    reviewer.full_name AS reviewer_name
  FROM complaints c
  JOIN users parent_u ON parent_u.id = c.parent_id
  JOIN patients patient ON patient.id = c.patient_id
  JOIN users specialist_u ON specialist_u.id = c.specialist_id
  LEFT JOIN users reviewer ON reviewer.id = c.reviewed_by
`;

const formatComplaint = (row, { includeAdminNotes = false } = {}) => {
  if (!row) {
    return null;
  }

  const complaint = {
    id: row.id,
    parent_id: row.parent_id,
    patient_id: row.patient_id,
    specialist_id: row.specialist_id,
    category: row.category,
    description: row.description,
    attachment_url: row.attachment_url,
    status: row.status,
    parent_response: row.parent_response,
    reviewed_at: row.reviewed_at,
    resolved_at: row.resolved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    parent: {
      id: row.parent_id,
      fullName: row.parent_name,
    },
    patient: {
      id: row.patient_id,
      fullName: row.patient_name,
    },
    specialist: {
      id: row.specialist_id,
      fullName: row.specialist_name,
    },
    reviewer: row.reviewed_by
      ? {
          id: row.reviewed_by,
          fullName: row.reviewer_name,
        }
      : null,
  };

  if (includeAdminNotes) {
    complaint.admin_notes = row.admin_notes;
  }

  return complaint;
};

const isParentLinkedToPatient = async (parentId, patientId) => {
  const result = await pool.query(
    `SELECT 1 FROM patient_guardians
     WHERE parent_id = $1 AND patient_id = $2 LIMIT 1`,
    [parentId, patientId]
  );
  return result.rows.length > 0;
};

const isSpecialistAssignedToPatient = async (specialistId, patientId) => {
  const result = await pool.query(
    `SELECT 1 FROM patient_specialists
     WHERE specialist_id = $1 AND patient_id = $2 LIMIT 1`,
    [specialistId, patientId]
  );
  return result.rows.length > 0;
};

const hasActiveDuplicateComplaint = async ({
  parentId,
  patientId,
  specialistId,
  category,
}) => {
  const result = await pool.query(
    `SELECT id FROM complaints
     WHERE parent_id = $1
       AND patient_id = $2
       AND specialist_id = $3
       AND category = $4
       AND status IN ('pending', 'under_review')
     LIMIT 1`,
    [parentId, patientId, specialistId, category]
  );
  return result.rows.length > 0;
};

const countResolvedComplaintsWithinWindow = async (specialistId, client = pool) => {
  const result = await client.query(
    `SELECT COUNT(*)::int AS total
     FROM complaints
     WHERE specialist_id = $1
       AND status = 'resolved'
       AND resolved_at >= now() - ($2 || ' days')::interval`,
    [specialistId, String(LOOKBACK_DAYS)]
  );
  return result.rows[0]?.total ?? 0;
};

const hasRecentAutomaticWarning = async (
  specialistId,
  confirmedCount,
  client = pool
) => {
  const result = await client.query(
    `SELECT id FROM specialist_warnings
     WHERE specialist_id = $1
       AND is_automatic = true
       AND confirmed_complaints_count >= $2
       AND created_at >= now() - ($3 || ' days')::interval
     LIMIT 1`,
    [specialistId, confirmedCount, String(LOOKBACK_DAYS)]
  );
  return result.rows.length > 0;
};

const issueAutomaticWarningIfNeeded = async ({
  specialistId,
  adminId,
  confirmedCount,
  client,
}) => {
  if (confirmedCount < WARNING_THRESHOLD) {
    return null;
  }

  const alreadyIssued = await hasRecentAutomaticWarning(
    specialistId,
    WARNING_THRESHOLD,
    client
  );
  if (alreadyIssued) {
    return null;
  }

  const reason = `${confirmedCount} confirmed complaints within the last ${LOOKBACK_DAYS} days.`;
  const warningResult = await client.query(
    `INSERT INTO specialist_warnings (
      specialist_id,
      warning_level,
      confirmed_complaints_count,
      reason,
      issued_by,
      is_automatic
    ) VALUES ($1, 'official', $2, $3, $4, true)
    RETURNING *`,
    [specialistId, confirmedCount, reason, adminId]
  );

  const warning = warningResult.rows[0];

  await notificationsService.createNotification({
    user_id: specialistId,
    type: "specialist_warning_issued",
    title: "Official administrative warning issued",
    body: "An official warning has been issued following repeated confirmed complaints.",
    related_entity_type: "specialist_warning",
    related_entity_id: warning.id,
  });

  await notifyAllAdmins({
    type: "specialist_warning_issued",
    title: "Specialist warning threshold reached",
    body: `A specialist reached ${WARNING_THRESHOLD} confirmed complaints within ${LOOKBACK_DAYS} days.`,
    related_entity_type: "specialist_warning",
    related_entity_id: warning.id,
  });

  return warning;
};

const getComplaintById = async (complaintId, { includeAdminNotes = false } = {}) => {
  const result = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [complaintId]);
  return formatComplaint(result.rows[0], { includeAdminNotes });
};

exports.createComplaint = async ({
  parentId,
  patientId,
  specialistId,
  category,
  description,
  attachmentUrl,
}) => {
  if (!COMPLAINT_CATEGORIES.includes(category)) {
    throw createError("Invalid complaint category", 400);
  }

  const trimmedDescription = String(description || "").trim();
  if (trimmedDescription.length < 20 || trimmedDescription.length > 1000) {
    throw createError("Description must be between 20 and 1000 characters", 400);
  }

  const linked = await isParentLinkedToPatient(parentId, patientId);
  if (!linked) {
    throw createError("You are not authorized to submit a complaint for this child", 403);
  }

  const assigned = await isSpecialistAssignedToPatient(specialistId, patientId);
  if (!assigned) {
    throw createError(
      "The selected specialist is not assigned to this child",
      403
    );
  }

  const duplicate = await hasActiveDuplicateComplaint({
    parentId,
    patientId,
    specialistId,
    category,
  });
  if (duplicate) {
    throw createError(
      "An active complaint already exists for this child, specialist, and category",
      409,
      "duplicate_active_complaint"
    );
  }

  const result = await pool.query(
    `INSERT INTO complaints (
      parent_id,
      patient_id,
      specialist_id,
      category,
      description,
      attachment_url
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`,
    [
      parentId,
      patientId,
      specialistId,
      category,
      trimmedDescription,
      attachmentUrl || null,
    ]
  );

  const complaint = await getComplaintById(result.rows[0].id);

  await notifyAllAdmins({
    type: "complaint_submitted",
    title: "New specialist complaint submitted",
    body: "A parent submitted a specialist complaint for administration review.",
    related_entity_type: "complaint",
    related_entity_id: complaint.id,
  });

  return complaint;
};

exports.listParentComplaints = async (parentId) => {
  const result = await pool.query(
    `${BASE_SELECT}
     WHERE c.parent_id = $1
     ORDER BY c.created_at DESC`,
    [parentId]
  );
  return result.rows.map((row) => formatComplaint(row));
};

exports.getParentComplaintById = async (parentId, complaintId) => {
  const result = await pool.query(
    `${BASE_SELECT}
     WHERE c.id = $1 AND c.parent_id = $2`,
    [complaintId, parentId]
  );
  if (!result.rows[0]) {
    throw createError("Complaint not found", 404);
  }
  return formatComplaint(result.rows[0]);
};

exports.listAdminComplaints = async (filters) => {
  const conditions = ["1=1"];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`c.status = $${params.length}`);
  }
  if (filters.specialist_id) {
    params.push(filters.specialist_id);
    conditions.push(`c.specialist_id = $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    conditions.push(`c.category = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`c.created_at >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`c.created_at <= $${params.length}`);
  }

  const whereClause = conditions.join(" AND ");
  const page = Number.parseInt(filters.page, 10) > 0 ? Number.parseInt(filters.page, 10) : 1;
  const limit =
    Number.parseInt(filters.limit, 10) > 0
      ? Math.min(Number.parseInt(filters.limit, 10), 50)
      : 20;
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM complaints c WHERE ${whereClause}`,
    params
  );

  const listParams = [...params, limit, offset];
  const result = await pool.query(
    `${BASE_SELECT}
     WHERE ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${listParams.length - 1}
     OFFSET $${listParams.length}`,
    listParams
  );

  return {
    items: result.rows.map((row) => formatComplaint(row, { includeAdminNotes: true })),
    pagination: {
      page,
      limit,
      total: countResult.rows[0]?.total ?? 0,
      totalPages: Math.ceil((countResult.rows[0]?.total ?? 0) / limit),
    },
  };
};

exports.getAdminComplaintById = async (complaintId) => {
  const complaint = await getComplaintById(complaintId, { includeAdminNotes: true });
  if (!complaint) {
    throw createError("Complaint not found", 404);
  }
  return complaint;
};

const transitionComplaintStatus = async ({
  complaintId,
  adminId,
  expectedStatuses,
  nextStatus,
  adminNotes,
  parentResponse,
  setResolvedAt = false,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      `SELECT * FROM complaints WHERE id = $1 FOR UPDATE`,
      [complaintId]
    );
    const current = currentResult.rows[0];

    if (!current) {
      throw createError("Complaint not found", 404);
    }

    if (!expectedStatuses.includes(current.status)) {
      throw createError(
        `Complaint cannot transition from ${current.status} to ${nextStatus}`,
        409,
        "invalid_status_transition"
      );
    }

    const updateResult = await client.query(
      `UPDATE complaints
       SET status = $2,
           admin_notes = COALESCE($3, admin_notes),
           parent_response = COALESCE($4, parent_response),
           reviewed_by = $5,
           reviewed_at = now(),
           resolved_at = CASE WHEN $6 THEN now() ELSE resolved_at END,
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        complaintId,
        nextStatus,
        adminNotes || null,
        parentResponse || null,
        adminId,
        setResolvedAt,
      ]
    );

    let warning = null;
    if (nextStatus === "resolved") {
      const confirmedCount = await countResolvedComplaintsWithinWindow(
        current.specialist_id,
        client
      );
      warning = await issueAutomaticWarningIfNeeded({
        specialistId: current.specialist_id,
        adminId,
        confirmedCount,
        client,
      });
    }

    await client.query("COMMIT");

    const complaint = await getComplaintById(updateResult.rows[0].id, {
      includeAdminNotes: true,
    });

    await notificationsService.createNotification({
      user_id: current.parent_id,
      type: "complaint_reviewed",
      title: "Complaint review completed",
      body:
        parentResponse ||
        (nextStatus === "resolved"
          ? "Your complaint has been reviewed and resolved by the administration."
          : "Your complaint has been reviewed by the administration."),
      related_entity_type: "complaint",
      related_entity_id: complaint.id,
    });

    return { complaint, warning };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.startComplaintReview = async ({ complaintId, adminId }) => {
  return transitionComplaintStatus({
    complaintId,
    adminId,
    expectedStatuses: ["pending"],
    nextStatus: "under_review",
    adminNotes: null,
    parentResponse: null,
    setResolvedAt: false,
  });
};

exports.resolveComplaint = async ({
  complaintId,
  adminId,
  adminNotes,
  parentResponse,
}) => {
  return transitionComplaintStatus({
    complaintId,
    adminId,
    expectedStatuses: ["under_review"],
    nextStatus: "resolved",
    adminNotes,
    parentResponse,
    setResolvedAt: true,
  });
};

exports.rejectComplaint = async ({
  complaintId,
  adminId,
  adminNotes,
  parentResponse,
}) => {
  return transitionComplaintStatus({
    complaintId,
    adminId,
    expectedStatuses: ["pending", "under_review"],
    nextStatus: "rejected",
    adminNotes,
    parentResponse,
    setResolvedAt: false,
  });
};

exports.getSpecialistComplaintsSummary = async (specialistId) => {
  const resolvedCount = await countResolvedComplaintsWithinWindow(specialistId);
  const warningsResult = await pool.query(
    `SELECT *
     FROM specialist_warnings
     WHERE specialist_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [specialistId]
  );

  return {
    specialist_id: specialistId,
    confirmed_complaints_last_90_days: resolvedCount,
    admin_attention_required:
      resolvedCount >= ATTENTION_THRESHOLD && resolvedCount < WARNING_THRESHOLD,
    warning_threshold_reached: resolvedCount >= WARNING_THRESHOLD,
    warnings: warningsResult.rows,
  };
};

exports.COMPLAINT_CATEGORIES = COMPLAINT_CATEGORIES;
exports.ATTENTION_THRESHOLD = ATTENTION_THRESHOLD;
exports.WARNING_THRESHOLD = WARNING_THRESHOLD;
