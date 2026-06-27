const pool = require("../../database/db");

const createParentProfile = async (userId, data) => {
  const { relationship_notes, address } = data;

  const result = await pool.query(
    `INSERT INTO parent_profiles
     (user_id, relationship_notes, address)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, relationship_notes, address]
  );

  return result.rows[0];
};

const getAllParents = async () => {
  const result = await pool.query(`
    SELECT
      pp.id,
      u.id AS user_id,
      u.full_name,
      u.email,
      u.phone,
      pp.relationship_notes,
      pp.address,
      pp.created_at,
      pp.updated_at
    FROM users u
    LEFT JOIN parent_profiles pp ON pp.user_id = u.id
    WHERE u.role = 'parent'
    ORDER BY u.full_name
  `);

  return result.rows;
};

const getParentById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      pp.*,
      u.full_name,
      u.email,
      u.phone
    FROM parent_profiles pp
    JOIN users u ON pp.user_id = u.id
    WHERE pp.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const updateParentProfile = async (id, data) => {
  const { relationship_notes, address } = data;

  const result = await pool.query(
    `
    UPDATE parent_profiles
    SET relationship_notes = $1,
        address = $2
    WHERE id = $3
    RETURNING *
    `,
    [relationship_notes, address, id]
  );

  return result.rows[0];
};

const getParentPatients = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      p.*
    FROM patient_guardians pg
    JOIN patients p ON pg.patient_id = p.id
    WHERE pg.parent_id = $1
    ORDER BY p.full_name
    `,
    [parentId]
  );

  return result.rows;
};

module.exports = {
  createParentProfile,
  getAllParents,
  getParentById,
  updateParentProfile,
  getParentPatients,
};