export const EXERCISE_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const EXERCISE_MEDIA_EMPTY_MESSAGE =
  "No media selected. Images, audio, PDF, and MP4/MOV video are supported (max 50 MB).";

export const EXERCISE_MEDIA_UNSUPPORTED_MESSAGE =
  "Unsupported media type. Use image, audio, PDF, or MP4/MOV video.";

export const EXERCISE_MEDIA_SIZE_MESSAGE = "File is too large. Maximum size is 50 MB.";

export const EXERCISE_MEDIA_REMOVAL_PENDING_MESSAGE =
  "Instructional media will be removed when you save.";

export const ALLOWED_EXERCISE_MEDIA_MIME_TYPES = new Set([
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
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

export const EXERCISE_MEDIA_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/aac",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
].join(",");

export function inferExerciseMediaMimeType(filename, mimeType = "") {
  const normalizedMime = typeof mimeType === "string" ? mimeType.toLowerCase().trim() : "";
  if (normalizedMime && ALLOWED_EXERCISE_MEDIA_MIME_TYPES.has(normalizedMime)) {
    return normalizedMime;
  }

  const lower = typeof filename === "string" ? filename.toLowerCase() : "";
  const extension = lower.includes(".") ? `.${lower.split(".").pop()}` : "";
  return EXTENSION_MIME_FALLBACK[extension] ?? null;
}

export function guessExerciseMediaKind(source) {
  const value = typeof source === "string" ? source.toLowerCase() : "";
  if (
    value.includes(".mp4")
    || value.includes(".mov")
    || value.includes("video/")
    || value.includes("video")
  ) {
    return "video";
  }
  if (
    value.includes(".mp3")
    || value.includes(".m4a")
    || value.includes(".wav")
    || value.includes(".aac")
    || value.includes("audio/")
    || value.includes("audio")
  ) {
    return "audio";
  }
  if (value.includes(".pdf") || value.includes("application/pdf")) {
    return "pdf";
  }
  if (
    value.includes(".jpg")
    || value.includes(".jpeg")
    || value.includes(".png")
    || value.includes(".webp")
    || value.includes("image/")
    || value.includes("image")
  ) {
    return "image";
  }
  return "unknown";
}

export function getExerciseMediaFilename(source) {
  if (typeof source !== "string" || !source.trim()) {
    return null;
  }
  const trimmed = source.trim();
  const withoutQuery = trimmed.split("?")[0];
  const parts = withoutQuery.split("/");
  const basename = parts[parts.length - 1];
  return basename || trimmed;
}

export function formatExerciseMediaFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes) || bytes < 0) {
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

export function getExerciseMediaTypeLabel(kind) {
  switch (kind) {
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "pdf":
      return "PDF";
    default:
      return "File";
  }
}

export function validateExerciseMediaFile(file) {
  if (!(file instanceof File)) {
    return "Unable to read the selected file.";
  }

  const resolvedMime = inferExerciseMediaMimeType(file.name, file.type);
  if (!resolvedMime || !ALLOWED_EXERCISE_MEDIA_MIME_TYPES.has(resolvedMime)) {
    return EXERCISE_MEDIA_UNSUPPORTED_MESSAGE;
  }

  if (file.size > EXERCISE_MEDIA_MAX_BYTES) {
    return EXERCISE_MEDIA_SIZE_MESSAGE;
  }

  return null;
}

export function describeExerciseMediaSelection(file) {
  const resolvedMime = inferExerciseMediaMimeType(file.name, file.type);
  const kind = guessExerciseMediaKind(`${file.name} ${resolvedMime ?? ""}`);
  return {
    filename: file.name,
    mimeType: resolvedMime,
    kind,
    typeLabel: getExerciseMediaTypeLabel(kind),
    sizeLabel: formatExerciseMediaFileSize(file.size),
  };
}

export function describeExerciseMediaUrl(url) {
  const filename = getExerciseMediaFilename(url);
  const kind = guessExerciseMediaKind(url);
  return {
    filename,
    kind,
    typeLabel: getExerciseMediaTypeLabel(kind),
  };
}
