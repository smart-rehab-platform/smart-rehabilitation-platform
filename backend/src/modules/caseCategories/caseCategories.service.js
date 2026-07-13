const pool = require("../../database/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isUniqueViolation = (error) => error?.code === "23505";

const formatCategory = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  is_active: row.is_active,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();

  return trimmed.length > 0 ? trimmed : null;
};

const getSpecialistUser = async (specialistId, client = pool) => {
  const result = await client.query(
    `SELECT id, role, is_active, full_name, email, phone, profile_image_url
     FROM users
     WHERE id = $1`,
    [specialistId]
  );

  return result.rows[0] || null;
};

const assertSpecialistUser = async (specialistId, client = pool) => {
  const user = await getSpecialistUser(specialistId, client);

  if (!user) {
    throw createError("Specialist not found", 404);
  }

  if (user.role !== "specialist") {
    throw createError("The selected user is not a specialist", 400);
  }

  return user;
};

const findCategoryById = async (categoryId, client = pool) => {
  const result = await client.query(
    `SELECT *
     FROM case_categories
     WHERE id = $1`,
    [categoryId]
  );

  return result.rows[0] || null;
};

const findDuplicateCategoryName = async (name, excludeId = null, client = pool) => {
  const params = [name.trim()];
  let sql = `
    SELECT id
    FROM case_categories
    WHERE lower(trim(name)) = lower(trim($1))
  `;

  if (excludeId) {
    params.push(excludeId);
    sql += ` AND id <> $2`;
  }

  sql += ` LIMIT 1`;

  const result = await client.query(sql, params);

  return result.rows[0] || null;
};

const listCategories = async ({ includeInactive = false } = {}) => {
  const result = await pool.query(
  includeInactive
    ? `SELECT *
       FROM case_categories
       ORDER BY name ASC`
    : `SELECT *
       FROM case_categories
       WHERE is_active = TRUE
       ORDER BY name ASC`
  );

  return result.rows.map(formatCategory);
};

const getCategoryById = async (categoryId, { allowInactive = false } = {}) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }

  if (!allowInactive && !category.is_active) {
    throw createError("Category not found", 404);
  }

  return formatCategory(category);
};

const createCategory = async ({ name, description }) => {
  const trimmedName = name.trim();
  const normalizedDescription = normalizeText(description);

  const duplicate = await findDuplicateCategoryName(trimmedName);

  if (duplicate) {
    throw createError("A category with this name already exists", 409);
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_categories (name, description, is_active)
       VALUES ($1, $2, TRUE)
       RETURNING *`,
      [trimmedName, normalizedDescription]
    );

    return formatCategory(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError("A category with this name already exists", 409);
    }

    throw error;
  }
};

const updateCategory = async (categoryId, { name, description, is_active: isActive }) => {
  const existing = await findCategoryById(categoryId);

  if (!existing) {
    throw createError("Category not found", 404);
  }

  if (name !== undefined) {
    const trimmedName = name.trim();
    const duplicate = await findDuplicateCategoryName(trimmedName, categoryId);

    if (duplicate) {
      throw createError("A category with this name already exists", 409);
    }
  }

  const nextName = name !== undefined ? name.trim() : existing.name;
  const nextDescription =
    description !== undefined ? normalizeText(description) : existing.description;
  const nextIsActive =
    isActive !== undefined ? isActive : existing.is_active;

  try {
    const result = await pool.query(
      `UPDATE case_categories
       SET name = $1,
           description = $2,
           is_active = $3
       WHERE id = $4
       RETURNING *`,
      [nextName, nextDescription, nextIsActive, categoryId]
    );

    return formatCategory(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError("A category with this name already exists", 409);
    }

    throw error;
  }
};

const getSpecialistCategories = async (
  specialistId,
  { includeInactiveCategories = false } = {}
) => {
  await assertSpecialistUser(specialistId);

  const result = await pool.query(
    `SELECT cc.*
     FROM specialist_case_categories scc
     JOIN case_categories cc ON cc.id = scc.category_id
     WHERE scc.specialist_id = $1
       ${includeInactiveCategories ? "" : "AND cc.is_active = TRUE"}
     ORDER BY cc.name ASC`,
    [specialistId]
  );

  return result.rows.map(formatCategory);
};

const replaceSpecialistCategories = async (specialistId, categoryIds) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await assertSpecialistUser(specialistId, client);

    if (categoryIds.length > 0) {
      const categoriesResult = await client.query(
        `SELECT id, is_active
         FROM case_categories
         WHERE id = ANY($1::uuid[])`,
        [categoryIds]
      );

      if (categoriesResult.rows.length !== categoryIds.length) {
        throw createError("One or more categories were not found", 400);
      }

      const inactiveCategory = categoriesResult.rows.find((row) => !row.is_active);

      if (inactiveCategory) {
        throw createError("Inactive categories cannot be assigned to specialists", 400);
      }
    }

    await client.query(
      `DELETE FROM specialist_case_categories
       WHERE specialist_id = $1`,
      [specialistId]
    );

    for (const categoryId of categoryIds) {
      await client.query(
        `INSERT INTO specialist_case_categories (specialist_id, category_id)
         VALUES ($1, $2)`,
        [specialistId, categoryId]
      );
    }

    await client.query("COMMIT");

    return getSpecialistCategories(specialistId, {
      includeInactiveCategories: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (isUniqueViolation(error)) {
      throw createError("Duplicate specialist category assignment", 409);
    }

    throw error;
  } finally {
    client.release();
  }
};

const listMatchingSpecialists = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }

  if (!category.is_active) {
    throw createError(
      "Inactive categories cannot be used for specialist matching",
      409
    );
  }

  const result = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.phone,
       u.profile_image_url,
       sp.specialization,
       sp.license_number,
       sp.years_of_experience,
       sp.bio,
       cc.id AS category_id,
       cc.name AS category_name,
       (
         SELECT COUNT(*)::int
         FROM patient_specialists ps
         WHERE ps.specialist_id = u.id
       ) AS active_cases_count
     FROM users u
     INNER JOIN specialist_profiles sp ON sp.user_id = u.id
     INNER JOIN specialist_case_categories scc ON scc.specialist_id = u.id
     INNER JOIN case_categories cc ON cc.id = scc.category_id
     WHERE cc.id = $1
       AND u.role = 'specialist'
       AND u.is_active = TRUE
       AND cc.is_active = TRUE
     ORDER BY active_cases_count ASC,
              sp.years_of_experience DESC NULLS LAST,
              u.full_name ASC`,
    [categoryId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    profile_image_url: row.profile_image_url,
    specialization: row.specialization,
    license_number: row.license_number,
    years_of_experience: row.years_of_experience,
    bio: row.bio,
    category_id: row.category_id,
    category_name: row.category_name,
    active_cases_count: row.active_cases_count,
  }));
};

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  getSpecialistCategories,
  replaceSpecialistCategories,
  listMatchingSpecialists,
};
