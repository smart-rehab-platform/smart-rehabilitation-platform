const pool = require("../../database/db");

const createExerciseCategory = async (data) => {
  const { name, description } = data;

  const result = await pool.query(
    `INSERT INTO exercise_categories
     (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [name, description]
  );

  return result.rows[0];
};

const getExerciseCategories = async () => {
  const result = await pool.query(
    `SELECT *
     FROM exercise_categories
     ORDER BY name ASC`
  );

  return result.rows;
};

const updateExerciseCategory = async (id, data) => {
  const { name, description } = data;

  const result = await pool.query(
    `UPDATE exercise_categories
     SET
       name = COALESCE($1, name),
       description = COALESCE($2, description)
     WHERE id = $3
     RETURNING *`,
    [name, description, id]
  );

  return result.rows[0];
};

const deleteExerciseCategory = async (id) => {
  const result = await pool.query(
    `DELETE FROM exercise_categories
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};
const createExercise = async (data, userId) => {
  const {
    category_id,
    title,
    description,
    instructions,
    instruction_media_url
  } = data;

  const result = await pool.query(
    `INSERT INTO exercises
     (
       category_id,
       title,
       description,
       instructions,
       instruction_media_url,
       created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      category_id,
      title,
      description,
      instructions,
      instruction_media_url,
      userId
    ]
  );

  return result.rows[0];
};

const getAllExercises = async () => {
  const result = await pool.query(
    `SELECT
        e.*,
        c.name AS category_name,
        u.full_name AS created_by_name
     FROM exercises e
     LEFT JOIN exercise_categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.created_by = u.id
     ORDER BY e.created_at DESC`
  );

  return result.rows;
};

const getExerciseById = async (id) => {
  const result = await pool.query(
    `SELECT
        e.*,
        c.name AS category_name,
        u.full_name AS created_by_name
     FROM exercises e
     LEFT JOIN exercise_categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.created_by = u.id
     WHERE e.id = $1`,
    [id]
  );

  return result.rows[0];
};

const getExercisesByCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT
        e.*,
        c.name AS category_name,
        u.full_name AS created_by_name
     FROM exercises e
     LEFT JOIN exercise_categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.created_by = u.id
     WHERE e.category_id = $1
     ORDER BY e.created_at DESC`,
    [categoryId]
  );

  return result.rows;
};

const updateExercise = async (id, data) => {
  const {
    category_id,
    title,
    description,
    instructions,
    instruction_media_url
  } = data;

  const result = await pool.query(
    `UPDATE exercises
     SET
       category_id = COALESCE($1, category_id),
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       instructions = COALESCE($4, instructions),
       instruction_media_url = COALESCE($5, instruction_media_url),
       updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [
      category_id,
      title,
      description,
      instructions,
      instruction_media_url,
      id
    ]
  );

  return result.rows[0];
};

const deleteExercise = async (id) => {
  const result = await pool.query(
    `DELETE FROM exercises
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createExerciseCategory,
  getExerciseCategories,
  updateExerciseCategory,
  deleteExerciseCategory,
  createExercise,
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  updateExercise,
  deleteExercise
};