const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../../database/db");
const {
  buildPasswordResetLink,
  buildVerificationLink,
  sendPasswordResetEmail,
  sendEmailVerificationEmail
} = require("./auth.email");

const PASSWORD_RESET_WINDOW_HOURS = 1;
const EMAIL_VERIFICATION_WINDOW_HOURS = 24;

const GENERIC_PASSWORD_RESET_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";
const GENERIC_VERIFICATION_MESSAGE =
  "If an account with that email exists, a verification email has been sent.";

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateSecureToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const addHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

const createPasswordResetToken = async (userId) => {
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = addHours(PASSWORD_RESET_WINDOW_HOURS);

  await pool.query(
    "DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL",
    [userId]
  );

  await pool.query(
    `INSERT INTO password_resets (user_id, token, expires_at, used_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, hashedToken, expiresAt, null]
  );

  return rawToken;
};

const createEmailVerificationToken = async (userId) => {
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = addHours(EMAIL_VERIFICATION_WINDOW_HOURS);

  await pool.query(
    "DELETE FROM email_verifications WHERE user_id = $1 AND verified_at IS NULL",
    [userId]
  );

  await pool.query(
    `INSERT INTO email_verifications (user_id, token, expires_at, verified_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, hashedToken, expiresAt, null]
  );

  return rawToken;
};

const sendVerificationEmailForUser = async (user) => {
  const verificationToken = await createEmailVerificationToken(user.id);
  const verificationLink = buildVerificationLink(verificationToken);

  try {
    await sendEmailVerificationEmail({
      email: user.email,
      fullName: user.full_name,
      verificationLink
    });
  } catch (error) {
    console.error(
      "[auth.email] Failed to send verification email:",
      error.message
    );
  }
};

const registerUser = async (data) => {
  const { full_name, email, password, phone, role, profile_image_url } = data;

  if (role === "admin") {
    throw createHttpError(
      "Admin accounts cannot be created through registration."
    );
  }

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
     RETURNING id, full_name, email, phone, role, profile_image_url, is_email_verified, created_at`,
    [full_name, email, passwordHash, phone, role, profile_image_url || null]
  );

  const user = result.rows[0];
  sendVerificationEmailForUser(user).catch((error) => {
    console.error(
      "[auth.email] Background verification email failed:",
      error.message
    );
  });

  return user;
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

  if (!user.is_active) {
    throw createHttpError("Your account has been disabled.", 403);
  }

  if (!user.is_email_verified) {
    throw createHttpError("Please verify your email before logging in.", 403);
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
      phone: user.phone,
      profile_image_url: user.profile_image_url,
      is_email_verified: user.is_email_verified
    }
  };
};

const forgotPassword = async (email) => {
  const result = await pool.query(
    "SELECT id, full_name, email FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return GENERIC_PASSWORD_RESET_MESSAGE;
  }

  const user = result.rows[0];
  const resetToken = await createPasswordResetToken(user.id);
  const resetLink = buildPasswordResetLink(resetToken);

  try {
    await sendPasswordResetEmail({
      email: user.email,
      fullName: user.full_name,
      resetLink
    });
  } catch (error) {
    console.error(
      "[auth.email] Failed to send password reset email:",
      error.message
    );
  }

  return GENERIC_PASSWORD_RESET_MESSAGE;
};

const resetPassword = async (token, newPassword) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hashedToken = hashToken(token);

    const resetResult = await client.query(
      `SELECT id, user_id
       FROM password_resets
       WHERE token = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       LIMIT 1
       FOR UPDATE`,
      [hashedToken]
    );

    if (resetResult.rows.length === 0) {
      throw createHttpError("Reset token is invalid or has expired.");
    }

    const resetRecord = resetResult.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await client.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, resetRecord.user_id]
    );

    await client.query(
      `UPDATE password_resets
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [resetRecord.user_id]
    );

    await client.query("COMMIT");

    return "Password reset successfully.";
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const sendVerification = async (email) => {
  const result = await pool.query(
    "SELECT id, full_name, email, is_email_verified FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return GENERIC_VERIFICATION_MESSAGE;
  }

  const user = result.rows[0];

  if (user.is_email_verified) {
    return GENERIC_VERIFICATION_MESSAGE;
  }

  await sendVerificationEmailForUser(user);
  return GENERIC_VERIFICATION_MESSAGE;
};

const verifyEmail = async (token) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hashedToken = hashToken(token);

    const verificationResult = await client.query(
      `SELECT id, user_id
       FROM email_verifications
       WHERE token = $1
         AND verified_at IS NULL
         AND expires_at > NOW()
       LIMIT 1
       FOR UPDATE`,
      [hashedToken]
    );

    if (verificationResult.rows.length === 0) {
      throw createHttpError("Verification token is invalid or has expired.");
    }

    const verificationRecord = verificationResult.rows[0];

    await client.query(
      "UPDATE users SET is_email_verified = TRUE WHERE id = $1",
      [verificationRecord.user_id]
    );

    await client.query(
      `UPDATE email_verifications
       SET verified_at = NOW()
       WHERE user_id = $1 AND verified_at IS NULL`,
      [verificationRecord.user_id]
    );

    await client.query("COMMIT");

    return "Email verified successfully. You can now sign in.";
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendVerification,
  verifyEmail
};