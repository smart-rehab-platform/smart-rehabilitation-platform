const pool = require("../../database/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const statusTransitionError = (targetStatus) => {
  const messages = {
    completed: "Only scheduled sessions can be marked as completed.",
    cancelled: "Only scheduled sessions can be cancelled.",
    no_show: "Only scheduled sessions can be marked as no show."
  };

  return createError(
    messages[targetStatus] || "Only scheduled sessions can change status.",
    400
  );
};

const createSession = async (data) => {
  const {
    patient_id,
    specialist_id,
    scheduled_at,
    duration_minutes,
    location_or_link
  } = data;

  const result = await pool.query(
    `INSERT INTO sessions
     (patient_id, specialist_id, scheduled_at, duration_minutes, location_or_link)
     VALUES ($1, $2, $3, COALESCE($4, 45), $5)
     RETURNING *`,
    [patient_id, specialist_id, scheduled_at, duration_minutes, location_or_link]
  );

  return result.rows[0];
};

const getAllSessions = async () => {
  const result = await pool.query(
    `SELECT s.*,
            p.full_name AS patient_name,
            u.full_name AS specialist_name
     FROM sessions s
     JOIN patients p ON s.patient_id = p.id
     JOIN users u ON s.specialist_id = u.id
     ORDER BY s.scheduled_at DESC`
  );

  return result.rows;
};

const getSessionById = async (id) => {
  const result = await pool.query(
    `SELECT s.*,
            p.full_name AS patient_name,
            u.full_name AS specialist_name
     FROM sessions s
     JOIN patients p ON s.patient_id = p.id
     JOIN users u ON s.specialist_id = u.id
     WHERE s.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateSessionDetails = async (
  id,
  { scheduled_at, duration_minutes, location_or_link, cancellation_reason }
) => {
  const result = await pool.query(
    `UPDATE sessions
     SET scheduled_at = COALESCE($1, scheduled_at),
         duration_minutes = COALESCE($2, duration_minutes),
         location_or_link = COALESCE($3, location_or_link),
         cancellation_reason = COALESCE($4, cancellation_reason),
         updated_at = now()
     WHERE id = $5
     RETURNING *`,
    [scheduled_at, duration_minutes, location_or_link, cancellation_reason, id]
  );

  return result.rows[0];
};

const updateSession = async (id, data) => {
  const {
    scheduled_at,
    duration_minutes,
    location_or_link,
    cancellation_reason,
    status
  } = data;

  const wantsStatusChange = status !== undefined && status !== null;

  if (!wantsStatusChange) {
    const updated = await updateSessionDetails(id, {
      scheduled_at,
      duration_minutes,
      location_or_link,
      cancellation_reason
    });
    return updated || null;
  }

  const currentResult = await pool.query(
    `SELECT id, status FROM sessions WHERE id = $1`,
    [id]
  );
  const current = currentResult.rows[0];
  if (!current) {
    return null;
  }

  // Same status: allow detail edits without mutating status.
  if (status === current.status) {
    return updateSessionDetails(id, {
      scheduled_at,
      duration_minutes,
      location_or_link,
      cancellation_reason
    });
  }

  if (current.status !== "scheduled") {
    throw statusTransitionError(status);
  }

  // Race-safe status change: only succeeds while still scheduled.
  const result = await pool.query(
    `UPDATE sessions
     SET scheduled_at = COALESCE($1, scheduled_at),
         duration_minutes = COALESCE($2, duration_minutes),
         location_or_link = COALESCE($3, location_or_link),
         cancellation_reason = COALESCE($4, cancellation_reason),
         status = $5::session_status,
         updated_at = now()
     WHERE id = $6 AND status = 'scheduled'
     RETURNING *`,
    [
      scheduled_at,
      duration_minutes,
      location_or_link,
      cancellation_reason,
      status,
      id
    ]
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  throw statusTransitionError(status);
};

const deleteSession = async (id) => {
  const result = await pool.query(
    `DELETE FROM sessions
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const updateSessionStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE sessions
     SET status = $1::session_status,
         updated_at = now()
     WHERE id = $2 AND status = 'scheduled'
     RETURNING *`,
    [status, id]
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  const existing = await pool.query(
    `SELECT id, status FROM sessions WHERE id = $1`,
    [id]
  );
  if (!existing.rows[0]) {
    return null;
  }

  throw statusTransitionError(status);
};

const cancelSession = async (id, cancellationReason) => {
  const result = await pool.query(
    `UPDATE sessions
     SET status = 'cancelled'::session_status,
         cancellation_reason = COALESCE($1, cancellation_reason),
         updated_at = now()
     WHERE id = $2 AND status = 'scheduled'
     RETURNING *`,
    [cancellationReason, id]
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  const existing = await pool.query(
    `SELECT id, status FROM sessions WHERE id = $1`,
    [id]
  );
  if (!existing.rows[0]) {
    return null;
  }

  throw statusTransitionError("cancelled");
};

const getPatientSessions = async (patientId) => {
  const result = await pool.query(
    `SELECT s.*,
            p.full_name AS patient_name,
            u.full_name AS specialist_name
     FROM sessions s
     JOIN patients p ON s.patient_id = p.id
     JOIN users u ON s.specialist_id = u.id
     WHERE s.patient_id = $1
     ORDER BY s.scheduled_at DESC`,
    [patientId]
  );

  return result.rows;
};

const getSpecialistSessions = async (specialistId) => {
  const result = await pool.query(
    `SELECT s.*,
            p.full_name AS patient_name,
            u.full_name AS specialist_name
     FROM sessions s
     JOIN patients p ON s.patient_id = p.id
     JOIN users u ON s.specialist_id = u.id
     WHERE s.specialist_id = $1
     ORDER BY s.scheduled_at DESC`,
    [specialistId]
  );

  return result.rows;
};

const getParentSessions = async (parentId) => {
  const result = await pool.query(
    `SELECT s.*,
            p.full_name AS patient_name,
            u.full_name AS specialist_name
     FROM sessions s
     JOIN patients p ON s.patient_id = p.id
     JOIN users u ON s.specialist_id = u.id
     JOIN patient_guardians pg ON pg.patient_id = p.id
     WHERE pg.parent_id = $1
     ORDER BY s.scheduled_at DESC`,
    [parentId]
  );

  return result.rows;
};

module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  updateSessionStatus,
  cancelSession,
  getPatientSessions,
  getSpecialistSessions,
  getParentSessions
};
