const pool = require("../../database/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatSessionRequest = (row) => ({
  id: row.id,
  patient_id: row.patient_id,
  parent_id: row.parent_id,
  specialist_id: row.specialist_id,
  reason: row.reason,
  reason_other_text: row.reason_other_text,
  preferred_date: row.preferred_date,
  preferred_time_period: row.preferred_time_period,
  notes: row.notes,
  status: row.status,
  rejection_reason: row.rejection_reason,
  approved_session_id: row.approved_session_id,
  reviewed_at: row.reviewed_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
  patient_name: row.patient_name,
  parent_name: row.parent_name,
  specialist_name: row.specialist_name,
});

const ENRICHED_SELECT = `
  SELECT
    sr.*,
    p.full_name AS patient_name,
    parent_u.full_name AS parent_name,
    specialist_u.full_name AS specialist_name
  FROM session_requests sr
  JOIN patients p ON p.id = sr.patient_id
  JOIN users parent_u ON parent_u.id = sr.parent_id
  JOIN users specialist_u ON specialist_u.id = sr.specialist_id
`;

const getPatientById = async (patientId) => {
  const result = await pool.query(
    `SELECT id FROM patients WHERE id = $1`,
    [patientId]
  );

  return result.rows[0] || null;
};

const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, role, full_name FROM users WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
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

const hasPendingRequest = async (parentId, patientId, specialistId) => {
  const result = await pool.query(
    `SELECT 1
     FROM session_requests
     WHERE parent_id = $1
       AND patient_id = $2
       AND specialist_id = $3
       AND status = 'pending'
     LIMIT 1`,
    [parentId, patientId, specialistId]
  );

  return result.rows.length > 0;
};

const getSessionRequestById = async (requestId) => {
  const result = await pool.query(
    `${ENRICHED_SELECT}
     WHERE sr.id = $1`,
    [requestId]
  );

  return result.rows[0] ? formatSessionRequest(result.rows[0]) : null;
};

const createSessionRequest = async ({
  parentId,
  patientId,
  specialistId,
  reason,
  reasonOtherText,
  preferredDate,
  preferredTimePeriod,
  notes,
}) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    throw createError("Patient not found", 404);
  }

  const specialist = await getUserById(specialistId);

  if (!specialist) {
    throw createError("Specialist not found", 404);
  }

  if (specialist.role !== "specialist") {
    throw createError("The selected user is not a specialist", 403);
  }

  const isLinked = await isParentLinkedToPatient(parentId, patientId);

  if (!isLinked) {
    throw createError(
      "You are not authorized to request a session for this patient",
      403
    );
  }

  const isAssigned = await isSpecialistAssignedToPatient(specialistId, patientId);

  if (!isAssigned) {
    throw createError(
      "The selected specialist is not assigned to this patient",
      403
    );
  }

  const hasPending = await hasPendingRequest(parentId, patientId, specialistId);

  if (hasPending) {
    throw createError(
      "A pending session request already exists for this patient and specialist",
      409
    );
  }

  try {
    const insertResult = await pool.query(
      `INSERT INTO session_requests (
         patient_id,
         parent_id,
         specialist_id,
         reason,
         reason_other_text,
         preferred_date,
         preferred_time_period,
         notes
       )
       VALUES ($1, $2, $3, $4::session_request_reason, $5, $6, $7::preferred_time_period, $8)
       RETURNING id`,
      [
        patientId,
        parentId,
        specialistId,
        reason,
        reasonOtherText,
        preferredDate,
        preferredTimePeriod,
        notes,
      ]
    );

    return getSessionRequestById(insertResult.rows[0].id);
  } catch (error) {
    if (error.code === "23505") {
      throw createError(
        "A pending session request already exists for this patient and specialist",
        409
      );
    }

    throw error;
  }
};

const listParentRequests = async (parentId, status) => {
  const result = await pool.query(
    `${ENRICHED_SELECT}
     WHERE sr.parent_id = $1
       AND ($2::session_request_status IS NULL OR sr.status = $2::session_request_status)
     ORDER BY sr.created_at DESC`,
    [parentId, status || null]
  );

  return result.rows.map(formatSessionRequest);
};

const listSpecialistInbox = async (specialistId, status) => {
  const result = await pool.query(
    `${ENRICHED_SELECT}
     WHERE sr.specialist_id = $1
       AND ($2::session_request_status IS NULL OR sr.status = $2::session_request_status)
     ORDER BY
       CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END,
       sr.created_at DESC`,
    [specialistId, status || null]
  );

  return result.rows.map(formatSessionRequest);
};

const approveSessionRequest = async ({
  requestId,
  specialistId,
  scheduledAt,
  durationMinutes,
  locationOrLink,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const lockResult = await client.query(
      `SELECT *
       FROM session_requests
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );

    if (lockResult.rows.length === 0) {
      throw createError("Session request not found", 404);
    }

    const request = lockResult.rows[0];

    if (request.specialist_id !== specialistId) {
      throw createError(
        "You are not authorized to approve this session request",
        403
      );
    }

    if (request.status !== "pending") {
      throw createError("This session request has already been processed", 409);
    }

    const sessionResult = await client.query(
      `INSERT INTO sessions (
         patient_id,
         specialist_id,
         scheduled_at,
         duration_minutes,
         location_or_link
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        request.patient_id,
        request.specialist_id,
        scheduledAt,
        durationMinutes ?? 45,
        locationOrLink ?? null,
      ]
    );

    const session = sessionResult.rows[0];

    const updateResult = await client.query(
      `UPDATE session_requests
       SET status = 'approved'::session_request_status,
           approved_session_id = $1,
           reviewed_at = now(),
           updated_at = now()
       WHERE id = $2
         AND status = 'pending'::session_request_status
       RETURNING id`,
      [session.id, requestId]
    );

    if (updateResult.rows.length === 0) {
      throw createError("This session request has already been processed", 409);
    }

    await client.query("COMMIT");

    const enrichedRequest = await getSessionRequestById(requestId);

    return {
      request: enrichedRequest,
      session,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const rejectSessionRequest = async ({
  requestId,
  specialistId,
  rejectionReason,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const lockResult = await client.query(
      `SELECT *
       FROM session_requests
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );

    if (lockResult.rows.length === 0) {
      throw createError("Session request not found", 404);
    }

    const request = lockResult.rows[0];

    if (request.specialist_id !== specialistId) {
      throw createError(
        "You are not authorized to reject this session request",
        403
      );
    }

    if (request.status !== "pending") {
      throw createError("This session request has already been processed", 409);
    }

    const updateResult = await client.query(
      `UPDATE session_requests
       SET status = 'rejected'::session_request_status,
           rejection_reason = $1,
           reviewed_at = now(),
           updated_at = now()
       WHERE id = $2
         AND status = 'pending'::session_request_status
       RETURNING id`,
      [rejectionReason, requestId]
    );

    if (updateResult.rows.length === 0) {
      throw createError("This session request has already been processed", 409);
    }

    await client.query("COMMIT");

    return getSessionRequestById(requestId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createSessionRequest,
  listParentRequests,
  listSpecialistInbox,
  approveSessionRequest,
  rejectSessionRequest,
};
