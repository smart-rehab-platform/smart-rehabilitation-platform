const pool = require("../../database/db");

const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT
      id,
      full_name,
      email,
      phone,
      role,
      is_active,
      is_email_verified,
      created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT
      id,
      full_name,
      email,
      phone,
      role,
      is_active,
      is_email_verified,
      profile_image_url,
      created_at,
      updated_at
    FROM users
    WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};
const updateUserStatus = async (id, isActive) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = $1
     WHERE id = $2
     RETURNING id, full_name, email, role, is_active, updated_at`,
    [isActive, id]
  );

  return result.rows[0];
};

const updateMyProfile = async (userId, data) => {
  const { full_name, phone, profile_image_url } = data;

  const result = await pool.query(
    `UPDATE users
     SET
       full_name = COALESCE($1, full_name),
       phone = COALESCE($2, phone),
       profile_image_url = COALESCE($3, profile_image_url)
     WHERE id = $4
     RETURNING id, full_name, email, phone, role, profile_image_url, updated_at`,
    [full_name, phone, profile_image_url, userId]
  );

  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateMyProfile
};
