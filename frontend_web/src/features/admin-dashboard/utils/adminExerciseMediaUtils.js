export const EXERCISE_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const EXERCISE_TITLE_MAX = 200;

export const EXERCISE_TEXT_MAX = 10000;

export const EXERCISE_MEDIA_ACCEPT = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp3",
  ".mpeg",
  ".m4a",
  ".wav",
  ".aac",
  ".pdf",
  ".mp4",
  ".mov",
].join(",");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
]);

const EXTENSION_MIME_FALLBACK = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".mpeg": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

/**
 * Classifies instruction media URLs or filenames.
 * @param {string|null|undefined} url
 */
export function guessInstructionMediaKind(url) {
  if (!url || typeof url !== "string") {
    return "unknown";
  }

  const lower = url.toLowerCase();

  if (
    lower.includes(".mp4")
    || lower.includes(".mov")
    || lower.includes(".webm")
    || lower.includes("video")
  ) {
    return "video";
  }

  if (
    lower.includes(".mp3")
    || lower.includes(".m4a")
    || lower.includes(".wav")
    || lower.includes(".aac")
    || lower.includes(".ogg")
    || lower.includes("audio")
  ) {
    return "audio";
  }

  if (lower.includes(".pdf")) {
    return "pdf";
  }

  if (
    lower.includes(".jpg")
    || lower.includes(".jpeg")
    || lower.includes(".png")
    || lower.includes(".webp")
    || lower.includes("image")
  ) {
    return "image";
  }

  return "unknown";
}

/**
 * @param {string|null|undefined} url
 */
export function resolveExerciseMediaFilename(url) {
  if (!url || typeof url !== "string") {
    return "Media file";
  }

  const normalized = url.trim().replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return "Media file";
  }

  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
}

function resolveMimeType(mimetype, filename) {
  const normalized = String(mimetype || "").toLowerCase().trim();

  if (normalized && ALLOWED_MIME_TYPES.has(normalized)) {
    return normalized;
  }

  const extension = filename.includes(".")
    ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
    : "";

  return EXTENSION_MIME_FALLBACK[extension] ?? null;
}

/**
 * @param {File|null|undefined} file
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateExerciseMediaFile(file) {
  if (!(file instanceof File)) {
    return { ok: false, message: "Please choose a file to upload." };
  }

  if (file.size > EXERCISE_MEDIA_MAX_BYTES) {
    return { ok: false, message: "File is too large. Maximum allowed size is 50 MB." };
  }

  const resolvedMime = resolveMimeType(file.type, file.name);
  if (!resolvedMime) {
    return {
      ok: false,
      message: "Unsupported instructional media type. Allowed: images, audio, PDF, and MP4/MOV video.",
    };
  }

  return { ok: true };
}

/**
 * @param {number} bytes
 */
export function formatExerciseMediaFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @param {File} file
 */
export function getExerciseMediaFileKind(file) {
  return guessInstructionMediaKind(file.name || file.type);
}
