const pool = require("../../database/db");

const createAssignedExercise = async (data, assignedBy) => {
  const {
    exercise_id,
    plan_id,
    patient_id,
    frequency,
    start_date,
    due_date
  } = data;

  const result = await pool.query(
  `INSERT INTO assigned_exercises
   (exercise_id, plan_id, patient_id, assigned_by, frequency, start_date, due_date)
   VALUES ($1, $2, $3, $4, COALESCE($5::exercise_frequency, 'daily'::exercise_frequency), COALESCE($6, CURRENT_DATE), $7)
   RETURNING *`,
  [exercise_id, plan_id, patient_id, assignedBy, frequency, start_date, due_date]
);

  return result.rows[0];
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
            e.instructions,
            p.full_name AS patient_name,
            u.full_name AS assigned_by_name
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
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

const deactivateAssignedExercise = async (id) => {
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
            e.instruction_media_url
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     WHERE ae.patient_id = $1
     ORDER BY ae.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

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
       AND (ae.due_date IS NULL OR ae.due_date >= CURRENT_DATE)
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
       AND (ae.due_date IS NULL OR ae.due_date >= CURRENT_DATE)
     ORDER BY ae.created_at DESC`,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  createAssignedExercise,
  getAllAssignedExercises,
  getAssignedExerciseById,
  updateAssignedExercise,
  deleteAssignedExercise,
  deactivateAssignedExercise,
  getPatientAssignedExercises,
  getDailyTasks,
  getWeeklyTasks
};