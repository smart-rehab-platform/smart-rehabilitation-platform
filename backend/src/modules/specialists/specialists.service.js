const pool = require("../../database/db");

const VERIFICATION_STATUSES = Object.freeze(["pending", "approved", "rejected"]);

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const insertSpecialistProfile = async (userId, data, client = pool) => {
  const {
    specialization,
    license_number,
    bio,
    years_of_experience,
    verification_status = "pending",
  } = data;

  const result = await client.query(
    `INSERT INTO specialist_profiles
    (user_id, specialization, license_number, bio, years_of_experience, verification_status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      userId,
      specialization,
      license_number,
      bio,
      years_of_experience,
      verification_status,
    ]
  );

  return result.rows[0];
};

const createSpecialistProfile = async (userId, data) => {
  return insertSpecialistProfile(userId, {
    ...data,
    verification_status: data?.verification_status || "pending",
  });
};

const getVerificationStatusByUserId = async (userId, client = pool) => {
  const result = await client.query(
    `SELECT verification_status
     FROM specialist_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0]?.verification_status || null;
};

const updateSpecialistVerificationByUserId = async (userId, status) => {
  if (!VERIFICATION_STATUSES.includes(status)) {
    throw createHttpError("Status must be approved or rejected.", 400);
  }

  if (status === "pending") {
    throw createHttpError("Status must be approved or rejected.", 400);
  }

  const userResult = await pool.query(
    `SELECT id, role, full_name, email
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw createHttpError("Specialist not found.", 404);
  }

  if (user.role !== "specialist") {
    throw createHttpError("User is not a specialist.", 400);
  }

  const result = await pool.query(
    `UPDATE specialist_profiles
     SET verification_status = $1,
         updated_at = NOW()
     WHERE user_id = $2
     RETURNING *`,
    [status, userId]
  );

  if (!result.rows[0]) {
    throw createHttpError("Specialist profile not found.", 404);
  }

  return {
    ...result.rows[0],
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
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
  VERIFICATION_STATUSES,
  insertSpecialistProfile,
  createSpecialistProfile,
  getVerificationStatusByUserId,
  updateSpecialistVerificationByUserId,
  getAllSpecialists,
  getSpecialistById,
  updateSpecialistProfile,
  getSpecialistPatients,
};
