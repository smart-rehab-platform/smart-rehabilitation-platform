const pool = require("../../database/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatFeedback = (row) => ({
  id: row.id,
  specialist_id: row.specialist_id,
  parent_id: row.parent_id,
  patient_id: row.patient_id,
  treatment_plan_id: row.treatment_plan_id,
  rating: row.rating,
  comment: row.comment,
  created_at: row.created_at,
  patient_name: row.patient_name,
  parent_name: row.parent_name
});

const getTreatmentPlanById = async (treatmentPlanId) => {
  const result = await pool.query(
    `SELECT id, patient_id, specialist_id, status, title
     FROM treatment_plans
     WHERE id = $1`,
    [treatmentPlanId]
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

const hasExistingFeedback = async (parentId, patientId, treatmentPlanId) => {
  const result = await pool.query(
    `SELECT 1
     FROM specialist_feedback
     WHERE parent_id = $1
       AND patient_id = $2
       AND treatment_plan_id = $3
     LIMIT 1`,
    [parentId, patientId, treatmentPlanId]
  );

  return result.rows.length > 0;
};

const submitFeedback = async ({
  parentId,
  patientId,
  treatmentPlanId,
  rating,
  comment
}) => {
  const plan = await getTreatmentPlanById(treatmentPlanId);

  if (!plan) {
    throw createError("Treatment plan not found", 404);
  }

  if (plan.patient_id !== patientId) {
    throw createError("patient_id does not match the treatment plan", 400);
  }

  if (plan.status !== "completed") {
    throw createError("You can only rate a completed treatment plan.", 400);
  }

  const isLinked = await isParentLinkedToPatient(parentId, patientId);
  if (!isLinked) {
    throw createError(
      "You are not authorized to submit feedback for this patient",
      403
    );
  }

  const alreadySubmitted = await hasExistingFeedback(
    parentId,
    patientId,
    treatmentPlanId
  );
  if (alreadySubmitted) {
    throw createError("Feedback already submitted.", 409);
  }

  try {
    const result = await pool.query(
      `INSERT INTO specialist_feedback (
         specialist_id,
         parent_id,
         patient_id,
         treatment_plan_id,
         rating,
         comment
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        plan.specialist_id,
        parentId,
        patientId,
        treatmentPlanId,
        rating,
        comment || null
      ]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw createError("Feedback already submitted.", 409);
    }
    throw error;
  }
};

const checkFeedback = async ({ parentId, treatmentPlanId }) => {
  const plan = await getTreatmentPlanById(treatmentPlanId);

  if (!plan) {
    throw createError("Treatment plan not found", 404);
  }

  const isLinked = await isParentLinkedToPatient(parentId, plan.patient_id);
  if (!isLinked) {
    throw createError(
      "You are not authorized to check feedback for this treatment plan",
      403
    );
  }

  const exists = await hasExistingFeedback(
    parentId,
    plan.patient_id,
    treatmentPlanId
  );

  return { hasFeedback: exists };
};

const getSpecialistFeedback = async (specialistId) => {
  const result = await pool.query(
    `SELECT
       sf.id,
       sf.specialist_id,
       sf.parent_id,
       sf.patient_id,
       sf.treatment_plan_id,
       sf.rating,
       sf.comment,
       sf.created_at,
       p.full_name AS patient_name,
       u.full_name AS parent_name
     FROM specialist_feedback sf
     JOIN patients p ON p.id = sf.patient_id
     JOIN users u ON u.id = sf.parent_id
     WHERE sf.specialist_id = $1
     ORDER BY sf.created_at DESC`,
    [specialistId]
  );

  return result.rows.map(formatFeedback);
};

const getSpecialistFeedbackSummary = async (specialistId) => {
  const aggregateResult = await pool.query(
    `SELECT
       COUNT(*)::int AS total_feedback,
       ROUND(AVG(rating)::numeric, 1) AS average_rating
     FROM specialist_feedback
     WHERE specialist_id = $1`,
    [specialistId]
  );

  const breakdownResult = await pool.query(
    `SELECT rating, COUNT(*)::int AS count
     FROM specialist_feedback
     WHERE specialist_id = $1
     GROUP BY rating`,
    [specialistId]
  );

  const ratingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  for (const row of breakdownResult.rows) {
    ratingBreakdown[row.rating] = row.count;
  }

  const aggregate = aggregateResult.rows[0] || {
    total_feedback: 0,
    average_rating: null
  };

  return {
    average_rating:
      aggregate.total_feedback > 0
        ? Number(aggregate.average_rating)
        : null,
    total_feedback: aggregate.total_feedback,
    rating_breakdown: ratingBreakdown
  };
};

module.exports = {
  submitFeedback,
  checkFeedback,
  getSpecialistFeedback,
  getSpecialistFeedbackSummary
};
