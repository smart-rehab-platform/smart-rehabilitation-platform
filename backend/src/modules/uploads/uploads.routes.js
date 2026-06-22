const express = require("express");
const multer = require("multer");
const uploadsController = require("./uploads.controller");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-")
    );
  }
});

const upload = multer({ storage });

router.post(
  "/profile-image",
  upload.single("file"),
  uploadsController.uploadProfileImage
);

router.post(
  "/exercise-media",
  upload.single("file"),
  uploadsController.uploadExerciseMedia
);

router.post(
  "/message-attachment",
  upload.single("file"),
  uploadsController.uploadMessageAttachment
);

router.post(
  "/resource",
  upload.single("file"),
  uploadsController.uploadResource
);

router.post(
  "/report",
  upload.single("file"),
  uploadsController.uploadReport
);

module.exports = router;