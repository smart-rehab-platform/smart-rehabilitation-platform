const multer = require("multer");
const path = require("path");
const { uploadsRoot } = require("../config/uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsRoot);
  },

  filename: (_req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage
});

module.exports = upload;