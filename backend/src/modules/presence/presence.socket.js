const jwt = require("jsonwebtoken");
const pool = require("../../database/db");
const presenceService = require("./presence.service");

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT id, full_name, email, role, is_active
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (!result.rows[0]) {
      return next(new Error("Unauthorized"));
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};

const initPresenceSocket = (io) => {
  presenceService.setIo(io);

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    try {
      await presenceService.handleSocketConnect(userId, socket.id);
    } catch (error) {
      console.error("[presence] connect handler error:", error.message);
      socket.disconnect(true);
      return;
    }

    socket.on("disconnect", async () => {
      try {
        await presenceService.handleSocketDisconnect(socket.id);
      } catch (error) {
        console.error("[presence] disconnect handler error:", error.message);
      }
    });
  });
};

module.exports = {
  initPresenceSocket
};
