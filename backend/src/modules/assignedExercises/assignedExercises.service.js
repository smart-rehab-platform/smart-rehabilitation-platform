const pool = require("../../database/db");
const { createNotification } = require("../notifications/notifications.service");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ALLOWED_FREQUENCIES = new Set(["daily", "weekly", "one_time"]);

const isSpecialistAssignedToPatient = async (client, specialistId, patientId) => {
  const result = await client.query(
    `SELECT 1
     FROM patient_specialists
     WHERE specialist_id = $1
       AND patient_id = $2
     LIMIT 1`,
    [specialistId, patientId]
  );

  return result.rows.length > 0;
};

const parseDateOnly = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw createError(`${fieldName} must be a valid date (YYYY-MM-DD).`, 400);
  }

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw createError(`${fieldName} must be a valid date (YYYY-MM-DD).`, 400);
  }

  return text;
};

const todayUtcDateString = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const translateDbError = (error) => {
  if (error?.statusCode) {
    return error;
  }

  if (error?.code === "22P02") {
    return createError("Invalid assignment value provided.", 400);
  }

  if (error?.code === "23503") {
    return createError(
      "Patient, exercise, or treatment plan was not found.",
      404
    );
  }

  if (error?.code === "23505") {
    return createError(
      "This exercise is already assigned with the same schedule.",
      409
    );
  }

  return error;
};

/**
 * Creates an assigned exercise after authorization and relation checks.
 *
 * @param {object} db - pg Pool-like object with connect()
 * @param {object} data - request body fields
 * @param {string} assignedBy - authenticated user id (never from body)
 * @param {{ id?: string, role?: string }} actor - authenticated user
 */
const createAssignedExerciseWithDb = async (
  db,
  data,
  assignedBy,
  actor = {}
) => {
  const exerciseId = String(data.exercise_id || "").trim();
  const planId = String(data.plan_id || "").trim();
  const patientId = String(data.patient_id || "").trim();
  const role = String(actor.role || "").trim().toLowerCase();

  if (!exerciseId || !planId || !patientId) {
    throw createError(
      "exercise_id, plan_id, and patient_id are required",
      400
    );
  }

  let frequency = data.frequency;
  if (frequency === undefined || frequency === null || frequency === "") {
    frequency = "daily";
  } else {
    frequency = String(frequency).trim().toLowerCase();
  }

  if (!ALLOWED_FREQUENCIES.has(frequency)) {
    throw createError(
      "frequency must be one of: daily, weekly, one_time.",
      400
    );
  }

  const startDate = parseDateOnly(data.start_date, "start_date");
  const dueDate = parseDateOnly(data.due_date, "due_date");
  const effectiveStartDate = startDate || todayUtcDateString();

  if (dueDate && dueDate < effectiveStartDate) {
    throw createError("Due date cannot be before the start date.", 400);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const patientResult = await client.query(
      `SELECT id
       FROM patients
       WHERE id = $1`,
      [patientId]
    );

    if (!patientResult.rows[0]) {
      throw createError("Patient not found.", 404);
    }

    if (role === "specialist") {
      const linked = await isSpecialistAssignedToPatient(
        client,
        assignedBy,
        patientId
      );
      if (!linked) {
        throw createError("You do not have access to this patient.", 403);
      }
    }

    const exerciseResult = await client.query(
      `SELECT id
       FROM exercises
       WHERE id = $1`,
      [exerciseId]
    );

    if (!exerciseResult.rows[0]) {
      throw createError("Exercise not found.", 404);
    }

    const planResult = await client.query(
      `SELECT id, patient_id, status
       FROM treatment_plans
       WHERE id = $1`,
      [planId]
    );

    const plan = planResult.rows[0];
    if (!plan) {
      throw createError("Treatment plan not found.", 404);
    }

    if (String(plan.patient_id) !== patientId) {
      throw createError(
        "The treatment plan does not belong to this patient.",
        400
      );
    }

    if (String(plan.status).toLowerCase() !== "active") {
      throw createError(
        "An active treatment plan is required before assigning an exercise.",
        409
      );
    }

    const duplicateResult = await client.query(
      `SELECT id
       FROM assigned_exercises
       WHERE patient_id = $1
         AND plan_id = $2
         AND exercise_id = $3
         AND frequency = $4::exercise_frequency
         AND start_date = $5::date
         AND due_date IS NOT DISTINCT FROM $6::date
         AND is_active = TRUE
       LIMIT 1`,
      [
        patientId,
        planId,
        exerciseId,
        frequency,
        effectiveStartDate,
        dueDate
      ]
    );

    if (duplicateResult.rows[0]) {
      throw createError(
        "This exercise is already assigned with the same schedule.",
        409
      );
    }

    const insertResult = await client.query(
      `INSERT INTO assigned_exercises
         (exercise_id, plan_id, patient_id, assigned_by, frequency, start_date, due_date)
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5::exercise_frequency,
         COALESCE($6::date, CURRENT_DATE),
         $7::date
       )
       RETURNING *`,
      [
        exerciseId,
        planId,
        patientId,
        assignedBy,
        frequency,
        startDate,
        dueDate
      ]
    );

    await client.query("COMMIT");
    return insertResult.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {
      // ignore rollback failures
    }
    throw translateDbError(error);
  } finally {
    client.release();
  }
};

const notifyGuardiansOfNewAssignment = async (assignment, assignedBy) => {
  if (!assignment?.id || !assignment?.patient_id || !assignment?.exercise_id) {
    return;
  }

  try {
    const contextResult = await pool.query(
      `SELECT DISTINCT pg.parent_id,
              p.full_name AS patient_name,
              e.title AS exercise_title
       FROM patient_guardians pg
       JOIN patients p ON p.id = pg.patient_id
       JOIN exercises e ON e.id = $2
       WHERE pg.patient_id = $1`,
      [assignment.patient_id, assignment.exercise_id]
    );

    if (!contextResult.rows.length) {
      return;
    }

    const patientName =
      String(contextResult.rows[0].patient_name || "").trim() || "Your child";
    const exerciseTitle =
      String(contextResult.rows[0].exercise_title || "").trim() || "a new exercise";
    const title = "New Exercise Assigned";
    const body = `${patientName} has a new exercise: ${exerciseTitle}.`;
    const notified = new Set();

    for (const row of contextResult.rows) {
      const parentId = String(row.parent_id || "").trim();
      if (!parentId || parentId === String(assignedBy)) {
        continue;
      }
      if (notified.has(parentId)) {
        continue;
      }
      notified.add(parentId);

      try {
        await createNotification({
          user_id: parentId,
          type: "exercise_reminder",
          title,
          body,
          related_entity_type: "assigned_exercise",
          related_entity_id: assignment.id,
        });
      } catch (error) {
        console.error(
          "[notifications] Failed to notify guardian of exercise assignment:",
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "[notifications] Failed to load guardians for exercise assignment:",
      error.message
    );
  }
};

const createAssignedExercise = async (data, assignedBy, actor = {}) => {
  const assignment = await createAssignedExerciseWithDb(
    pool,
    data,
    assignedBy,
    actor
  );
  await notifyGuardiansOfNewAssignment(assignment, assignedBy);
  return assignment;
};

const getAllAssignedExercises = async () => {
  const result = await pool.query(
    `SELECT ae.*,
            e.title AS exercise_title,
            e.instructions,
            p.full_name AS patient_name,
            u.full_name AS assigned_by_name
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     JOIN patients p ON ae.patient_id = p.id
     JOIN users u ON ae.assigned_by = u.id
     ORDER BY ae.created_at DESC`
  );

  return result.rows;
};

const getAssignedExerciseById = async (id) => {
  const result = await pool.query(
    `SELECT ae.*,
            e.title AS exercise_title,
            e.description AS exercise_description,
            e.description,
            e.instructions,
            e.instruction_media_url,
            c.name AS category_name,
            p.full_name AS patient_name,
            u.full_name AS assigned_by_name
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     LEFT JOIN exercise_categories c ON e.category_id = c.id
     JOIN patients p ON ae.patient_id = p.id
     JOIN users u ON ae.assigned_by = u.id
     WHERE ae.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateAssignedExercise = async (id, data) => {
  const {
    frequency,
    start_date,
    due_date,
    is_active
  } = data;

  const result = await pool.query(
    `UPDATE assigned_exercises
SET frequency = COALESCE($1::exercise_frequency, frequency),         start_date = COALESCE($2, start_date),
         due_date = COALESCE($3, due_date),
         is_active = COALESCE($4, is_active)
     WHERE id = $5
     RETURNING *`,
    [frequency, start_date, due_date, is_active, id]
  );

  return result.rows[0];
};

const deleteAssignedExercise = async (id) => {
  const result = await pool.query(
    `DELETE FROM assigned_exercises
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

/**
 * Soft-deactivates an assignment (is_active = false).
 * Preserves the assignment row and all related submissions/reviews/speech data.
 * Specialists may only deactivate assignments for patients they are linked to.
 *
 * @param {string} id
 * @param {{ id?: string, role?: string }} [actor]
 */
const deactivateAssignedExercise = async (id, actor = {}) => {
  const role = String(actor.role || "").trim().toLowerCase();
  const actorId = String(actor.id || "").trim();

  const existingResult = await pool.query(
    `SELECT id, patient_id, is_active
     FROM assigned_exercises
     WHERE id = $1`,
    [id]
  );
  const existing = existingResult.rows[0];
  if (!existing) {
    return null;
  }

  if (role === "specialist") {
    if (!actorId) {
      throw createError("You do not have access to this patient.", 403);
    }
    const linked = await isSpecialistAssignedToPatient(
      pool,
      actorId,
      existing.patient_id
    );
    if (!linked) {
      throw createError("You do not have access to this patient.", 403);
    }
  }

  if (existing.is_active === false) {
    return existing;
  }

  const result = await pool.query(
    `UPDATE assigned_exercises
     SET is_active = false
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const getPatientAssignedExercises = async (patientId) => {
  const result = await pool.query(
    `SELECT ae.*,
            e.title AS exercise_title,
            e.description,
            e.instructions,
            e.instruction_media_url,
            c.name AS category_name
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     LEFT JOIN exercise_categories c ON e.category_id = c.id
     WHERE ae.patient_id = $1
     ORDER BY ae.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

/**
 * Latest submission for an assignment is needs_retry.
 * Used to keep specialist-requested retries visible past due_date.
 */
const latestNeedsRetryExistsSql = `
  EXISTS (
    SELECT 1
    FROM exercise_submissions es
    WHERE es.assigned_exercise_id = ae.id
      AND es.status = 'needs_retry'
      AND es.submitted_at = (
        SELECT MAX(es2.submitted_at)
        FROM exercise_submissions es2
        WHERE es2.assigned_exercise_id = ae.id
      )
  )
`;

const getDailyTasks = async (patientId) => {
  const result = await pool.query(
    `SELECT ae.*,
            e.title AS exercise_title,
            e.instructions,
            e.instruction_media_url
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     WHERE ae.patient_id = $1
       AND ae.is_active = true
       AND ae.frequency = 'daily'
       AND ae.start_date <= CURRENT_DATE
       AND (
         ae.due_date IS NULL
         OR ae.due_date >= CURRENT_DATE
         OR ${latestNeedsRetryExistsSql}
       )
     ORDER BY ae.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const getWeeklyTasks = async (patientId) => {
  const result = await pool.query(
    `SELECT ae.*,
            e.title AS exercise_title,
            e.instructions,
            e.instruction_media_url
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     WHERE ae.patient_id = $1
       AND ae.is_active = true
       AND ae.frequency = 'weekly'
       AND ae.start_date <= CURRENT_DATE
       AND (
         ae.due_date IS NULL
         OR ae.due_date >= CURRENT_DATE
         OR ${latestNeedsRetryExistsSql}
       )
     ORDER BY ae.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  createAssignedExercise,
  createAssignedExerciseWithDb,
  getAllAssignedExercises,
  getAssignedExerciseById,
  updateAssignedExercise,
  deleteAssignedExercise,
  deactivateAssignedExercise,
  getPatientAssignedExercises,
  getDailyTasks,
  getWeeklyTasks
};
