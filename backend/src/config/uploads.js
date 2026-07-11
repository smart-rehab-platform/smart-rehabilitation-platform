const path = require("path");
const fs = require("fs");

const backendRoot = path.resolve(__dirname, "..", "..");
const uploadsRoot = path.join(backendRoot, "uploads");
const reportsUploadDir = path.join(uploadsRoot, "reports");

const ensureUploadDirs = () => {
  fs.mkdirSync(uploadsRoot, { recursive: true });
  fs.mkdirSync(reportsUploadDir, { recursive: true });
};

module.exports = {
  backendRoot,
  uploadsRoot,
  reportsUploadDir,
  ensureUploadDirs,
};
