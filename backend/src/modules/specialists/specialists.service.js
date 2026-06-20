const pool = require("../../database/db");

const createSpecialistProfile = async (userId, data) => {
  const {
    specialization,
    license_number,
    bio,
    years_of_experience,
  } = data;

  const result = await pool.query(
    `INSERT INTO specialist_profiles
    (user_id, specialization, license_number, bio, years_of_experience)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      userId,
      specialization,
      license_number,
      bio,
      years_of_experience,
    ]
  );

  return result.rows[0];
};

const getAllSpecialists = async () => {
  const result = await pool.query(`
    SELECT
      sp.*,
      u.full_name,
      u.email,
      u.phone
    FROM specialist_profiles sp
    JOIN users u ON sp.user_id = u.id
    ORDER BY u.full_name
  `);

  return result.rows;
};

const getSpecialistById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      sp.*,
      u.full_name,
      u.email,
      u.phone
    FROM specialist_profiles sp
    JOIN users u ON sp.user_id = u.id
    WHERE sp.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const updateSpecialistProfile = async (id, data) => {
  const {
    specialization,
    license_number,
    bio,
    years_of_experience,
  } = data;

  const result = await pool.query(
    `
    UPDATE specialist_profiles
    SET specialization = $1,
        license_number = $2,
        bio = $3,
        years_of_experience = $4
    WHERE id = $5
    RETURNING *
    `,
    [
      specialization,
      license_number,
      bio,
      years_of_experience,
      id,
    ]
  );

  return result.rows[0];
};

const getSpecialistPatients = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT
      p.*
    FROM patient_specialists ps
    JOIN patients p ON ps.patient_id = p.id
    WHERE ps.specialist_id = $1
    ORDER BY p.full_name
    `,
    [specialistId]
  );

  return result.rows;
};

module.exports = {
  createSpecialistProfile,
  getAllSpecialists,
  getSpecialistById,
  updateSpecialistProfile,
  getSpecialistPatients,
};