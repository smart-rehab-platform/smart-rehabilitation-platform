const pool = require("../../database/db");

/** @type {Map<string, Set<string>>} */
const userSockets = new Map();

/** @type {Map<string, string>} */
const socketUsers = new Map();

/** @type {import("socket.io").Server | null} */
let ioInstance = null;

const isDev = process.env.NODE_ENV !== "production";

const logDev = (...args) => {
  if (isDev) {
    console.log("[presence]", ...args);
  }
};

const setIo = (io) => {
  ioInstance = io;
};

const getOnlineUsersCount = () => userSockets.size;

const buildPresencePayload = (row) => ({
  id: row.id,
  full_name: row.full_name,
  email: row.email,
  role: row.role,
  is_online: row.is_online,
  last_seen: row.last_seen ? new Date(row.last_seen).toISOString() : null
});

const broadcastPresence = (event, payload) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.emit(event, payload);
};

const resetAllUsersOffline = async () => {
  await pool.query(
    `UPDATE users
     SET is_online = FALSE
     WHERE is_online = TRUE`
  );

  userSockets.clear();
  socketUsers.clear();
  logDev("Reset all users offline on startup");
};

const setUserOnlineInDb = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET is_online = TRUE,
         last_seen = NULL
     WHERE id = $1
     RETURNING id, full_name, email, role, is_online, last_seen`,
    [userId]
  );

  return result.rows[0];
};

const setUserOfflineInDb = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET is_online = FALSE,
         last_seen = NOW()
     WHERE id = $1
     RETURNING id, full_name, email, role, is_online, last_seen`,
    [userId]
  );

  return result.rows[0];
};

const handleSocketConnect = async (userId, socketId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  const sockets = userSockets.get(userId);
  const wasOnline = sockets.size > 0;

  sockets.add(socketId);
  socketUsers.set(socketId, userId);

  if (!wasOnline) {
    const row = await setUserOnlineInDb(userId);
    if (row) {
      broadcastPresence("presence:user_online", {
        user_id: row.id,
        is_online: true,
        last_seen: null
      });
    }
  }

  logDev(`Socket connected user=${userId} socket=${socketId}`);
  logDev(`Online users count=${getOnlineUsersCount()}`);
};

const handleSocketDisconnect = async (socketId) => {
  const userId = socketUsers.get(socketId);
  if (!userId) {
    return;
  }

  socketUsers.delete(socketId);

  const sockets = userSockets.get(userId);
  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSockets.delete(userId);
    const row = await setUserOfflineInDb(userId);
    if (row) {
      broadcastPresence("presence:user_offline", {
        user_id: row.id,
        is_online: false,
        last_seen: row.last_seen ? new Date(row.last_seen).toISOString() : null
      });
    }
  }

  logDev(`Socket disconnected user=${userId} socket=${socketId}`);
  logDev(`Online users count=${getOnlineUsersCount()}`);
};

const getAllUsersPresence = async () => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, is_online, last_seen
     FROM users
     ORDER BY full_name ASC`
  );

  return result.rows.map(buildPresencePayload);
};

const getUserPresenceById = async (userId) => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, is_online, last_seen
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (!result.rows[0]) {
    return null;
  }

  return buildPresencePayload(result.rows[0]);
};

const getBulkUsersPresence = async (userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT id, full_name, email, role, is_online, last_seen
     FROM users
     WHERE id = ANY($1::uuid[])
     ORDER BY full_name ASC`,
    [userIds]
  );

  return result.rows.map(buildPresencePayload);
};

const isUserOnlineInMemory = (userId) => {
  const sockets = userSockets.get(userId);
  return Boolean(sockets && sockets.size > 0);
};

module.exports = {
  setIo,
  resetAllUsersOffline,
  handleSocketConnect,
  handleSocketDisconnect,
  getAllUsersPresence,
  getUserPresenceById,
  getBulkUsersPresence,
  getOnlineUsersCount,
  isUserOnlineInMemory
};
