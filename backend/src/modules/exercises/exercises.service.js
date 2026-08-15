const pool = require("../../database/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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

const assertCategoryExists = async (categoryId) => {
  const result = await pool.query(
    `SELECT id
     FROM exercise_categories
     WHERE id = $1`,
    [categoryId]
  );

  if (!result.rows[0]) {
    throw createError("Exercise category not found.", 404);
  }
};

const createExercise = async (data, userId) => {
  const {
    category_id,
    title,
    description,
    instructions,
    instruction_media_url,
    language = "en",
    expected_text = null,
    target_word = null,
    target_phoneme = null,
  } = data;

  await assertCategoryExists(category_id);

  const result = await pool.query(
    `INSERT INTO exercises
     (
       category_id,
       title,
       description,
       instructions,
       instruction_media_url,
       language,
       expected_text,
       target_word,
       target_phoneme,
       created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      category_id,
      title,
      description,
      instructions,
      instruction_media_url,
      language,
      expected_text,
      target_word,
      target_phoneme,
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

const updateExercise = async (id, data, actor = {}) => {
  const existing = await getExerciseById(id);
  if (!existing) {
    throw createError("Exercise not found.", 404);
  }

  const role = String(actor.role || "").trim().toLowerCase();
  if (role === "specialist") {
    if (String(existing.created_by || "") !== String(actor.id || "")) {
      throw createError("You can only edit exercises you created.", 403);
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "category_id")) {
    await assertCategoryExists(data.category_id);
  }

  const sets = [];
  const values = [];
  let index = 1;

  const pushField = (column, value) => {
    sets.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  };

  if (Object.prototype.hasOwnProperty.call(data, "category_id")) {
    pushField("category_id", data.category_id);
  }
  if (Object.prototype.hasOwnProperty.call(data, "title")) {
    pushField("title", data.title);
  }
  if (Object.prototype.hasOwnProperty.call(data, "description")) {
    pushField(
      "description",
      data.description === "" ? null : data.description
    );
  }
  if (Object.prototype.hasOwnProperty.call(data, "instructions")) {
    pushField(
      "instructions",
      data.instructions === "" ? null : data.instructions
    );
  }
  if (Object.prototype.hasOwnProperty.call(data, "instruction_media_url")) {
    pushField(
      "instruction_media_url",
      data.instruction_media_url === "" ? null : data.instruction_media_url
    );
  }
  if (Object.prototype.hasOwnProperty.call(data, "language")) {
    pushField("language", data.language);
  }
  if (Object.prototype.hasOwnProperty.call(data, "expected_text")) {
    pushField(
      "expected_text",
      data.expected_text === "" ? null : data.expected_text
    );
  }
  if (Object.prototype.hasOwnProperty.call(data, "target_word")) {
    pushField(
      "target_word",
      data.target_word === "" ? null : data.target_word
    );
  }
  if (Object.prototype.hasOwnProperty.call(data, "target_phoneme")) {
    pushField(
      "target_phoneme",
      data.target_phoneme === "" ? null : data.target_phoneme
    );
  }

  if (sets.length === 0) {
    throw createError("Provide at least one field to update.", 400);
  }

  sets.push("updated_at = now()");
  values.push(id);

  const result = await pool.query(
    `UPDATE exercises
     SET ${sets.join(", ")}
     WHERE id = $${index}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

const deleteExercise = async (id) => {
  const existing = await getExerciseById(id);
  if (!existing) {
    throw createError("Exercise not found.", 404);
  }

  const assigned = await pool.query(
    `SELECT id
     FROM assigned_exercises
     WHERE exercise_id = $1
     LIMIT 1`,
    [id]
  );

  if (assigned.rows[0]) {
    throw createError(
      "This exercise cannot be deleted because it has been assigned to one or more patients.",
      409
    );
  }

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
