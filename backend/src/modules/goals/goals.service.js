const pool = require("../../database/db");

const createGoal = async (planId, data) => {
  const {
    term,
    title,
    description,
    target_date,
    target_value
  } = data;

  const result = await pool.query(
    `INSERT INTO goals
     (plan_id, term, title, description, target_date, target_value)
     VALUES ($1, $2::goal_term, $3, $4, $5, $6)
     RETURNING *`,
    [planId, term, title, description, target_date, target_value]
  );

  return result.rows[0];
};

const getPlanGoals = async (planId) => {
  const result = await pool.query(
    `SELECT *
     FROM goals
     WHERE plan_id = $1
     ORDER BY created_at DESC`,
    [planId]
  );

  return result.rows;
};

const getGoalById = async (id) => {
  const result = await pool.query(
    `SELECT
        g.*,
        tp.title AS treatment_plan_title
     FROM goals g
     JOIN treatment_plans tp ON g.plan_id = tp.id
     WHERE g.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateGoal = async (id, data) => {
  const {
    term,
    title,
    description,
    target_date,
    target_value,
    is_achieved
  } = data;

  const result = await pool.query(
    `UPDATE goals
     SET
       term = COALESCE($1::goal_term, term),
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       target_date = COALESCE($4, target_date),
       target_value = COALESCE($5, target_value),
       is_achieved = COALESCE($6, is_achieved)
     WHERE id = $7
     RETURNING *`,
    [term, title, description, target_date, target_value, is_achieved, id]
  );

  return result.rows[0];
};

const deleteGoal = async (id) => {
  const result = await pool.query(
    `DELETE FROM goals
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const achieveGoal = async (id) => {
  const result = await pool.query(
    `UPDATE goals
     SET is_achieved = true
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

const createGoalProgress = async (goalId, data) => {
  const {
    recorded_at,
    completion_percentage,
    notes
  } = data;

  const result = await pool.query(
    `INSERT INTO goal_progress
     (goal_id, recorded_at, completion_percentage, notes)
     VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4)
     RETURNING *`,
    [goalId, recorded_at, completion_percentage, notes]
  );

  return result.rows[0];
};

const getGoalProgress = async (goalId) => {
  const result = await pool.query(
    `SELECT *
     FROM goal_progress
     WHERE goal_id = $1
     ORDER BY recorded_at DESC, created_at DESC`,
    [goalId]
  );

  return result.rows;
};

module.exports = {
  createGoal,
  getPlanGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  achieveGoal,
  createGoalProgress,
  getGoalProgress
};