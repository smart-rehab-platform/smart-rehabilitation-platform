const pool = require("../../database/db");

const createTreatmentPlan = async (data, userId) => {
  const {
    patient_id,
    based_on_assessment_id,
    title,
    start_date,
    end_date
  } = data;

  const result = await pool.query(
    `INSERT INTO treatment_plans
     (
       patient_id,
       specialist_id,
       based_on_assessment_id,
       title,
       start_date,
       end_date
     )
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      patient_id,
      userId,
      based_on_assessment_id,
      title,
      start_date,
      end_date
    ]
  );

  return result.rows[0];
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
const updateTreatmentPlan = async (id, data, userId) => {
  const {
    based_on_assessment_id,
    title,
    status,
    start_date,
    end_date,
    change_summary
  } = data;

  const result = await pool.query(
    `UPDATE treatment_plans
     SET
       based_on_assessment_id = COALESCE($1, based_on_assessment_id),
       title = COALESCE($2, title),
       status = COALESCE($3::plan_status, status),
       start_date = COALESCE($4, start_date),
       end_date = COALESCE($5, end_date),
       updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [based_on_assessment_id, title, status, start_date, end_date, id]
  );

  if (result.rows[0]) {
    await pool.query(
      `INSERT INTO treatment_plan_revisions
       (plan_id, edited_by, change_summary)
       VALUES ($1, $2, $3)`,
      [
        id,
        userId,
        change_summary || "Treatment plan updated"
      ]
    );
  }

  return result.rows[0];
};

const deleteTreatmentPlan = async (id, userId) => {
  const result = await pool.query(
    `DELETE FROM treatment_plans
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const archiveTreatmentPlan = async (id, userId) => {
  const result = await pool.query(
    `UPDATE treatment_plans
     SET status = 'archived',
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (result.rows[0]) {
    await pool.query(
      `INSERT INTO treatment_plan_revisions
       (plan_id, edited_by, change_summary)
       VALUES ($1, $2, $3)`,
      [id, userId, "Treatment plan archived"]
    );
  }

  return result.rows[0];
};

const completeTreatmentPlan = async (id, userId) => {
  const result = await pool.query(
    `UPDATE treatment_plans
     SET status = 'completed',
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (result.rows[0]) {
    await pool.query(
      `INSERT INTO treatment_plan_revisions
       (plan_id, edited_by, change_summary)
       VALUES ($1, $2, $3)`,
      [id, userId, "Treatment plan completed"]
    );
  }

  return result.rows[0];
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
  getTreatmentPlanRevisions
};