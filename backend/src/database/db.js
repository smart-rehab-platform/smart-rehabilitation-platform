const { Pool } = require("pg");
require("dotenv").config();

const parsePoolInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parsePoolInt(process.env.DB_POOL_MAX, 10),
  idleTimeoutMillis: parsePoolInt(process.env.DB_POOL_IDLE_MS, 30000),
  connectionTimeoutMillis: parsePoolInt(process.env.DB_POOL_CONNECT_MS, 5000),
});

const isConnectionExhaustedError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "53300" ||
    message.includes("too many clients") ||
    message.includes("remaining connection slots")
  );
};

const logDatabaseError = (context, error, meta = {}) => {
  const payload = {
    context,
    code: error?.code || null,
    message: error?.message || "Unknown database error",
    poolTotal: pool.totalCount,
    poolIdle: pool.idleCount,
    poolWaiting: pool.waitingCount,
    ...meta,
  };

  if (isConnectionExhaustedError(error)) {
    console.error("[db] PostgreSQL connection pool exhausted", payload);
    return;
  }

  console.error("[db] Database query failed", payload);
};

pool.on("error", (error) => {
  logDatabaseError("idle_client", error);
});

module.exports = pool;
module.exports.isConnectionExhaustedError = isConnectionExhaustedError;
module.exports.logDatabaseError = logDatabaseError;
