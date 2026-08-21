const pool = require("../../database/db");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");

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
      profile_image_url,
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

  if (!result.rows[0]) {
    return null;
  }

  const user = result.rows[0];
  await notifyAllAdmins({
    title: isActive ? "User activated" : "User deactivated",
    body: `${user.full_name} was ${isActive ? "activated" : "deactivated"}.`,
    related_entity_type: "user",
    related_entity_id: user.id,
  });

  return user;
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

const updateUserById = async (id, data) => {
  const { full_name, phone, role, is_active } = data;

  const result = await pool.query(
    `UPDATE users
     SET
       full_name = COALESCE($1, full_name),
       phone = COALESCE($2, phone),
       role = COALESCE($3, role),
       is_active = COALESCE($4, is_active)
     WHERE id = $5
     RETURNING id, full_name, email, phone, role, is_active, updated_at`,
    [full_name, phone, role, is_active, id]
  );

  return result.rows[0];
};
const deleteUserById = async (id) => {
  const existing = await getUserById(id);
  if (!existing) {
    return null;
  }

  const result = await pool.query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id, full_name, email`,
    [id]
  );

  if (result.rows[0]) {
    await notifyAllAdmins({
      title: "User deleted",
      body: `${existing.full_name} was deleted from the system.`,
      related_entity_type: "user",
      related_entity_id: existing.id,
    });
  }

  return result.rows[0];
};
const updateProfileImage = async (
  userId,
  imageUrl
) => {
  const result = await pool.query(
    `UPDATE users
     SET profile_image_url = $1
     WHERE id = $2
     RETURNING id,
               full_name,
               email,
               role,
               profile_image_url`,
    [imageUrl, userId]
  );

  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateMyProfile,
  updateUserById,
  deleteUserById,
  updateProfileImage
};

