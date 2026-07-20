const crypto = require("crypto");
const pool = require("../../database/db");
const {
  getRefreshTokenExpiresAt,
} = require("../../config/authCookies");
const { generateAccessToken } = require("./auth.tokens");

const REFRESH_TOKEN_INVALID_MESSAGE = "Refresh token is missing or invalid";

const createHttpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const formatAuthUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  profile_image_url: user.profile_image_url,
  is_email_verified: user.is_email_verified,
});

const validateRefreshUser = (user) => {
  if (!user) {
    throw createHttpError(REFRESH_TOKEN_INVALID_MESSAGE, 401);
  }

  if (!user.is_active) {
    throw createHttpError("Your account has been disabled.", 403);
  }

  if (!user.is_email_verified) {
    throw createHttpError("Please verify your email before logging in.", 403);
  }

  return user;
};

const fetchUserById = async (client, userId) => {
  const result = await client.query(
    `SELECT id, full_name, email, phone, role, is_active, is_email_verified, profile_image_url
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};

const createRefreshTokenRecord = async (userId, client = pool) => {
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);
  const expiresAt = getRefreshTokenExpiresAt();

  await client.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return { rawToken, expiresAt };
};

const findRefreshTokenForUpdate = async (client, tokenHash) => {
  const result = await client.query(
    `SELECT id, user_id, token_hash, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = $1
     LIMIT 1
     FOR UPDATE`,
    [tokenHash]
  );

  return result.rows[0] || null;
};

const revokeRefreshTokenById = async (client, tokenId) => {
  await client.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1
       AND revoked_at IS NULL`,
    [tokenId]
  );
};

const revokeRefreshTokenByHash = async (tokenHash) => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL`,
    [tokenHash]
  );
};

const assertRefreshTokenRecordIsUsable = (record) => {
  if (!record) {
    throw createHttpError(REFRESH_TOKEN_INVALID_MESSAGE, 401);
  }

  if (record.revoked_at) {
    throw createHttpError(REFRESH_TOKEN_INVALID_MESSAGE, 401);
  }

  if (new Date(record.expires_at) <= new Date()) {
    throw createHttpError(REFRESH_TOKEN_INVALID_MESSAGE, 401);
  }
};

const rotateRefreshToken = async (rawRefreshToken) => {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const record = await findRefreshTokenForUpdate(client, tokenHash);
    assertRefreshTokenRecordIsUsable(record);

    const user = validateRefreshUser(
      await fetchUserById(client, record.user_id)
    );

    await revokeRefreshTokenById(client, record.id);

    const { rawToken: newRawRefreshToken } = await createRefreshTokenRecord(
      user.id,
      client
    );

    await client.query("COMMIT");

    const accessToken = generateAccessToken(user);

    return {
      accessToken,
      rawRefreshToken: newRawRefreshToken,
      user: formatAuthUser(user),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const logoutRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    return;
  }

  await revokeRefreshTokenByHash(hashRefreshToken(rawRefreshToken));
};

const cleanupExpiredRefreshTokens = async () => {
  await pool.query("DELETE FROM refresh_tokens WHERE expires_at < NOW()");
};

module.exports = {
  REFRESH_TOKEN_INVALID_MESSAGE,
  generateRefreshToken,
  hashRefreshToken,
  createRefreshTokenRecord,
  rotateRefreshToken,
  logoutRefreshToken,
  revokeRefreshTokenByHash,
  cleanupExpiredRefreshTokens,
  formatAuthUser,
};
