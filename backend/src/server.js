require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { getSocketIoCorsOptions } = require("./config/cors");
const pool = require("./database/db");
const { initPresenceSocket } = require("./modules/presence/presence.socket");
const presenceService = require("./modules/presence/presence.service");
const { startSessionReminderJob } = require("./jobs/sessionReminder.job");
const { getLanAddresses } = require("./middleware/devRequestLogger");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const ensurePresenceColumns = async () => {
  await pool.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT FALSE"
  );
  await pool.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ"
  );
};

const server = http.createServer(app);

const io = new Server(server, {
  cors: getSocketIoCorsOptions(),
});

initPresenceSocket(io);

pool
  .query("SELECT 1")
  .then(async () => {
    console.log("Database Connected");

    await ensurePresenceColumns();
    await presenceService.resetAllUsersOffline();
    startSessionReminderJob();

    server.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`Local:   http://localhost:${PORT}`);
      console.log(`Network: http://127.0.0.1:${PORT}`);

      const lanAddresses = getLanAddresses();
      if (lanAddresses.length > 0) {
        for (const address of lanAddresses) {
          console.log(`LAN:     http://${address}:${PORT}`);
        }
      } else {
        console.log("LAN:     no external IPv4 address detected");
      }

      console.log(`Socket.IO ready on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });
