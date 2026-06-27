const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../database/db");

const registerUser = async (data) => {
  const { full_name, email, password, phone, role, profile_image_url } = data;

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, profile_image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, phone, role, profile_image_url, created_at`,
    [full_name, email, passwordHash, phone, role, profile_image_url || null]
  );

  return result.rows[0];
};

const loginUser = async (email, password) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      profile_image_url: user.profile_image_url
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};