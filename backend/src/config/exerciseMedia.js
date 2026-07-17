const path = require("path");
const {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  resolveMimeType,
} = require("./messageAttachments");

/** Instructional media for the exercise library (includes PDF). */
const isAllowedExerciseMedia = (mimetype, originalname) =>
  resolveMimeType(mimetype, originalname) !== null;

/**
 * Parent exercise-submission media.
 * Matches DB media_type enum: video | audio | image (no PDF).
 */
const SUBMISSION_MEDIA_MIME_TYPES = new Set(
  [...ALLOWED_MIME_TYPES].filter((type) => type !== "application/pdf")
);

const isAllowedExerciseSubmissionMedia = (mimetype, originalname) => {
  const resolved = resolveMimeType(mimetype, originalname);
  return resolved !== null && SUBMISSION_MEDIA_MIME_TYPES.has(resolved);
};

const sanitizeUploadFilename = (originalname) => {
  const extension = path.extname(String(originalname || "")).toLowerCase();
  const safeExt = /^\.[a-z0-9]{1,10}$/i.test(extension) ? extension : "";
  const base = path
    .basename(String(originalname || "file"), extension)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 80);

  const safeBase = base || "exercise-media";
  return `${Date.now()}-${safeBase}${safeExt}`;
};

module.exports = {
  ALLOWED_EXERCISE_MEDIA_MIME_TYPES: ALLOWED_MIME_TYPES,
  ALLOWED_EXERCISE_SUBMISSION_MEDIA_MIME_TYPES: SUBMISSION_MEDIA_MIME_TYPES,
  MAX_EXERCISE_MEDIA_BYTES: MAX_FILE_SIZE_BYTES,
  isAllowedExerciseMedia,
  isAllowedExerciseSubmissionMedia,
  resolveMimeType,
  sanitizeUploadFilename,
};
