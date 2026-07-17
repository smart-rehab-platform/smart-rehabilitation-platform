const pool = require("../../database/db");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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

const assertPatientAccess = async (client, actor, patientId) => {
  const role = String(actor?.role || "").toLowerCase();
  if (role === "admin") {
    return;
  }
  if (role !== "specialist") {
    throw createError("You do not have permission to manage treatment plans.", 403);
  }
  const linked = await isSpecialistAssignedToPatient(client, actor.id, patientId);
  if (!linked) {
    throw createError("You do not have access to this patient.", 403);
  }
};

const findActivePlanForPatient = async (client, patientId, excludePlanId = null) => {
  const params = [patientId];
  let sql = `
    SELECT id
    FROM treatment_plans
    WHERE patient_id = $1
      AND status = 'active'
  `;
  if (excludePlanId) {
    params.push(excludePlanId);
    sql += ` AND id <> $${params.length}`;
  }
  sql += " LIMIT 1";
  const result = await client.query(sql, params);
  return result.rows[0] || null;
};

const createTreatmentPlan = async (data, actor) => {
  const {
    patient_id,
    based_on_assessment_id,
    title,
    start_date,
    end_date,
  } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const patientResult = await client.query(
      `SELECT id, full_name FROM patients WHERE id = $1`,
      [patient_id]
    );
    if (!patientResult.rows[0]) {
      throw createError("Patient not found.", 404);
    }

    await assertPatientAccess(client, actor, patient_id);

    if (based_on_assessment_id) {
      const assessmentResult = await client.query(
        `SELECT id, patient_id FROM assessments WHERE id = $1`,
        [based_on_assessment_id]
      );
      const assessment = assessmentResult.rows[0];
      if (!assessment) {
        throw createError("Assessment not found.", 404);
      }
      if (String(assessment.patient_id) !== String(patient_id)) {
        throw createError(
          "based_on_assessment_id does not belong to this patient.",
          400
        );
      }
    }

    const existingActive = await findActivePlanForPatient(client, patient_id);
    if (existingActive) {
      throw createError(
        "This patient already has an active treatment plan.",
        409
      );
    }

    const result = await client.query(
      `INSERT INTO treatment_plans
       (
         patient_id,
         specialist_id,
         based_on_assessment_id,
         title,
         start_date,
         end_date
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         COALESCE($5::date, CURRENT_DATE),
         $6::date
       )
       RETURNING *`,
      [
        patient_id,
        actor.id,
        based_on_assessment_id || null,
        title,
        start_date || null,
        end_date || null,
      ]
    );

    await client.query("COMMIT");

    const plan = result.rows[0];
    await notifyAllAdmins({
      title: "Treatment plan created",
      body: `Treatment plan "${title}" was created for patient ${
        patientResult.rows[0]?.full_name ?? "patient"
      }.`,
      related_entity_type: "treatment_plan",
      related_entity_id: plan.id,
    });

    return plan;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // ignore
    }
    if (error?.code === "23505") {
      throw createError(
        "This patient already has an active treatment plan.",
        409
      );
    }
    throw error;
  } finally {
    client.release();
  }
};

const getAllTreatmentPlans = async () => {
  const result = await pool.query(
    `SELECT
        tp.*,
        p.full_name AS patient_name,
        u.full_name AS specialist_name
     FROM treatment_plans tp
     JOIN patients p ON tp.patient_id = p.id
     JOIN users u ON tp.specialist_id = u.id
     ORDER BY tp.created_at DESC`
  );

  return result.rows;
};

const getTreatmentPlanById = async (id) => {
  const result = await pool.query(
    `SELECT
        tp.*,
        p.full_name AS patient_name,
        u.full_name AS specialist_name
     FROM treatment_plans tp
     JOIN patients p ON tp.patient_id = p.id
     JOIN users u ON tp.specialist_id = u.id
     WHERE tp.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateTreatmentPlan = async (id, data, actor) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT *
       FROM treatment_plans
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      throw createError("Treatment plan not found.", 404);
    }

    await assertPatientAccess(client, actor, existing.patient_id);

    const nextTitle =
      data.title !== undefined ? data.title : existing.title;
    const nextStatus =
      data.status !== undefined ? data.status : existing.status;
    const nextStart =
      data.start_date !== undefined ? data.start_date : existing.start_date;
    const nextEnd =
      Object.prototype.hasOwnProperty.call(data, "end_date")
        ? data.end_date
        : existing.end_date;
    const nextAssessment =
      Object.prototype.hasOwnProperty.call(data, "based_on_assessment_id")
        ? data.based_on_assessment_id
        : existing.based_on_assessment_id;

    const startText =
      nextStart instanceof Date
        ? nextStart.toISOString().slice(0, 10)
        : String(nextStart).slice(0, 10);
    const endText =
      nextEnd === null || nextEnd === undefined || nextEnd === ""
        ? null
        : nextEnd instanceof Date
          ? nextEnd.toISOString().slice(0, 10)
          : String(nextEnd).slice(0, 10);

    if (endText && startText && endText < startText) {
      throw createError("end_date cannot be before start_date.", 400);
    }

    if (
      String(nextStatus).toLowerCase() === "active" &&
      String(existing.status).toLowerCase() !== "active"
    ) {
      const otherActive = await findActivePlanForPatient(
        client,
        existing.patient_id,
        id
      );
      if (otherActive) {
        throw createError(
          "This patient already has an active treatment plan.",
          409
        );
      }
    }

    if (nextAssessment) {
      const assessmentResult = await client.query(
        `SELECT id, patient_id FROM assessments WHERE id = $1`,
        [nextAssessment]
      );
      const assessment = assessmentResult.rows[0];
      if (!assessment) {
        throw createError("Assessment not found.", 404);
      }
      if (String(assessment.patient_id) !== String(existing.patient_id)) {
        throw createError(
          "based_on_assessment_id does not belong to this patient.",
          400
        );
      }
    }

    const result = await client.query(
      `UPDATE treatment_plans
       SET
         based_on_assessment_id = $1,
         title = $2,
         status = $3::plan_status,
         start_date = $4::date,
         end_date = $5::date,
         updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [
        nextAssessment || null,
        nextTitle,
        nextStatus,
        startText,
        endText,
        id,
      ]
    );

    if (result.rows[0]) {
      await client.query(
        `INSERT INTO treatment_plan_revisions
         (plan_id, edited_by, change_summary)
         VALUES ($1, $2, $3)`,
        [
          id,
          actor.id,
          data.change_summary || "Treatment plan updated",
        ]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // ignore
    }
    if (error?.code === "23505") {
      throw createError(
        "This patient already has an active treatment plan.",
        409
      );
    }
    throw error;
  } finally {
    client.release();
  }
};

const deleteTreatmentPlan = async (id, actor) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existingResult = await client.query(
      `SELECT * FROM treatment_plans WHERE id = $1`,
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      throw createError("Treatment plan not found.", 404);
    }

    // Delete remains admin-only at route level; still verify plan exists.
    const result = await client.query(
      `DELETE FROM treatment_plans
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // ignore
    }
    throw error;
  } finally {
    client.release();
  }
};

const archiveTreatmentPlan = async (id, actor) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existingResult = await client.query(
      `SELECT * FROM treatment_plans WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      throw createError("Treatment plan not found.", 404);
    }

    await assertPatientAccess(client, actor, existing.patient_id);

    const result = await client.query(
      `UPDATE treatment_plans
       SET status = 'archived',
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows[0]) {
      await client.query(
        `INSERT INTO treatment_plan_revisions
         (plan_id, edited_by, change_summary)
         VALUES ($1, $2, $3)`,
        [id, actor.id, "Treatment plan archived"]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // ignore
    }
    throw error;
  } finally {
    client.release();
  }
};

const completeTreatmentPlan = async (id, actor) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existingResult = await client.query(
      `SELECT * FROM treatment_plans WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      throw createError("Treatment plan not found.", 404);
    }

    await assertPatientAccess(client, actor, existing.patient_id);

    const result = await client.query(
      `UPDATE treatment_plans
       SET status = 'completed',
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows[0]) {
      await client.query(
        `INSERT INTO treatment_plan_revisions
         (plan_id, edited_by, change_summary)
         VALUES ($1, $2, $3)`,
        [id, actor.id, "Treatment plan completed"]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // ignore
    }
    throw error;
  } finally {
    client.release();
  }
};

const getPatientTreatmentPlans = async (patientId) => {
  const result = await pool.query(
    `SELECT
        tp.*,
        p.full_name AS patient_name,
        u.full_name AS specialist_name
     FROM treatment_plans tp
     JOIN patients p ON tp.patient_id = p.id
     JOIN users u ON tp.specialist_id = u.id
     WHERE tp.patient_id = $1
     ORDER BY tp.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

const createTreatmentPlanRevision = async (planId, data, userId) => {
  const { change_summary } = data;

  const result = await pool.query(
    `INSERT INTO treatment_plan_revisions
     (plan_id, edited_by, change_summary)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [planId, userId, change_summary]
  );

  return result.rows[0];
};

const getTreatmentPlanRevisions = async (planId) => {
  const result = await pool.query(
    `SELECT
        r.*,
        u.full_name AS edited_by_name
     FROM treatment_plan_revisions r
     JOIN users u ON r.edited_by = u.id
     WHERE r.plan_id = $1
     ORDER BY r.created_at DESC`,
    [planId]
  );

  return result.rows;
};

module.exports = {
  createTreatmentPlan,
  getAllTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  archiveTreatmentPlan,
  completeTreatmentPlan,
  getPatientTreatmentPlans,
  createTreatmentPlanRevision,
  getTreatmentPlanRevisions,
};
