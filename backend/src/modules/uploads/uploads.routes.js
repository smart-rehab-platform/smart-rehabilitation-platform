const express = require("express");
const multer = require("multer");
const uploadsController = require("./uploads.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const { uploadsRoot, reportsUploadDir } = require("../../config/uploads");
const {
  isAllowedMessageAttachment,
  isAllowedProfileImage,
  MAX_FILE_SIZE_BYTES,
  MAX_PROFILE_IMAGE_BYTES,
} = require("../../config/messageAttachments");
const {
  isAllowedExerciseSubmissionMedia,
  isAllowedExerciseMedia,
  MAX_EXERCISE_MEDIA_BYTES,
  sanitizeUploadFilename,
} = require("../../config/exerciseMedia");
const {
  isAllowedCaseRequestChildImage,
  MAX_CASE_REQUEST_CHILD_IMAGE_BYTES,
} = require("../../config/caseRequestChildImage");

const router = express.Router();

const createStorage = (destination, { sanitizeFilename = false } = {}) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      if (sanitizeFilename) {
        cb(null, sanitizeUploadFilename(file.originalname));
        return;
      }
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

const uploadExerciseMedia = multer({
  storage: createStorage(uploadsRoot, { sanitizeFilename: true }),
  limits: { fileSize: MAX_EXERCISE_MEDIA_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedExerciseMedia(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }

    const error = new Error(
      "Unsupported instructional media type. Allowed: images, audio, PDF, and MP4/MOV video."
    );
    error.statusCode = 400;
    cb(error);
  },
});

const uploadExerciseSubmissionMedia = multer({
  storage: createStorage(uploadsRoot, { sanitizeFilename: true }),
  limits: { fileSize: MAX_EXERCISE_MEDIA_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedExerciseSubmissionMedia(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }

    const error = new Error(
      "Unsupported submission media type. Allowed: images, audio, and MP4/MOV video."
    );
    error.statusCode = 400;
    cb(error);
  },
});

const uploadChildImage = multer({
  storage: createStorage(uploadsRoot, { sanitizeFilename: true }),
  limits: { fileSize: MAX_PROFILE_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedProfileImage(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }

    const error = new Error(
      "Unsupported image type. Allowed: JPG, JPEG, PNG, and WEBP."
    );
    error.statusCode = 400;
    cb(error);
  },
});

const uploadCaseRequestChildImage = multer({
  storage: createStorage(uploadsRoot, { sanitizeFilename: true }),
  limits: { fileSize: MAX_CASE_REQUEST_CHILD_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedCaseRequestChildImage(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }

    const error = new Error(
      "Unsupported image type. Allowed: JPEG, PNG, and WebP."
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
  authenticate,
  authorizeRoles("admin", "specialist"),
  (req, res, next) => {
    uploadExerciseMedia.single("file")(req, res, (err) => {
      if (err) {
        return uploadsController.handleUploadError(res, err);
      }
      next();
    });
  },
  uploadsController.uploadExerciseMedia
);

router.post(
  "/exercise-submission-media",
  authenticate,
  authorizeRoles("parent", "admin", "specialist"),
  (req, res, next) => {
    uploadExerciseSubmissionMedia.single("file")(req, res, (err) => {
      if (err) {
        return uploadsController.handleUploadError(res, err);
      }
      next();
    });
  },
  uploadsController.uploadExerciseSubmissionMedia
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
  "/child-image",
  authenticate,
  authorizeRoles("parent"),
  (req, res, next) => {
    uploadChildImage.single("image")(req, res, (err) => {
      if (err) {
        return uploadsController.handleUploadError(res, err, {
          maxSizeMessage: "Image is too large. Maximum allowed size is 10 MB.",
        });
      }
      next();
    });
  },
  uploadsController.uploadChildImage
);

router.post(
  "/case-request-child-image",
  authenticate,
  authorizeRoles("parent"),
  (req, res, next) => {
    uploadCaseRequestChildImage.single("child_image")(req, res, (err) => {
      if (err) {
        return uploadsController.handleUploadError(res, err, {
          maxSizeMessage: "Image is too large. Maximum allowed size is 5 MB.",
        });
      }
      next();
    });
  },
  uploadsController.uploadCaseRequestChildImage
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
