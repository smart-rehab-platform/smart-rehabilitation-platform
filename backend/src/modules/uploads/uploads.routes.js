const express = require("express");
const multer = require("multer");
const uploadsController = require("./uploads.controller");
const authenticate = require("../../middleware/auth.middleware");
const { uploadsRoot, reportsUploadDir } = require("../../config/uploads");
const {
  isAllowedMessageAttachment,
  MAX_FILE_SIZE_BYTES,
} = require("../../config/messageAttachments");

const router = express.Router();

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
    },
  });

const upload = multer({ storage: createStorage(uploadsRoot) });
const uploadReport = multer({ storage: createStorage(reportsUploadDir) });
const uploadMessageAttachment = multer({
  storage: createStorage(uploadsRoot),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedMessageAttachment(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }

    const error = new Error(
      "Unsupported file type. Allowed: images, audio, PDF, and MP4/MOV video."
    );
    error.statusCode = 400;
    cb(error);
  },
});

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
  authenticate,
  (req, res, next) => {
    uploadMessageAttachment.single("file")(req, res, (err) => {
      if (err) {
        return uploadsController.handleUploadError(res, err);
      }
      next();
    });
  },
  uploadsController.uploadMessageAttachment
);

router.post(
  "/resource",
  upload.single("file"),
  uploadsController.uploadResource
);

router.post(
  "/report",
  uploadReport.single("file"),
  uploadsController.uploadReport
);

module.exports = router;
