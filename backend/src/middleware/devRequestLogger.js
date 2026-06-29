const os = require("os");

const isDev = process.env.NODE_ENV !== "production";

const getLanAddresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }

  return addresses;
};

const devRequestLogger = (req, res, next) => {
  if (!isDev) {
    return next();
  }

  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  console.log(`[http] ${req.method} ${req.originalUrl} from ${clientIp}`);

  return next();
};

module.exports = {
  devRequestLogger,
  getLanAddresses
};
