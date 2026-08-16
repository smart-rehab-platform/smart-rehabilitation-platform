import { resolveUploadedAssetUrl } from "../../../services/apiConfig";

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readNumber(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readBoolean(record, keys) {
  if (!record || typeof record !== "object") {
    return false;
  }
  for (const key of keys) {
    const value = record[key];
    if (value === true || value === false) {
      return value;
    }
  }
  return false;
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatReviewSubmittedLabel(dateValue) {
  const date = parseDateValue(dateValue);
  if (!date) {
    return "Recently submitted";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatReviewStatusLabel(status) {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "reviewed") {
    return "Reviewed";
  }
  if (normalized === "needs_retry") {
    return "Needs retry";
  }
  return "Pending";
}

export function reviewStatusTone(status) {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "reviewed") {
    return "success";
  }
  if (normalized === "needs_retry") {
    return "warning";
  }
  return "success";
}

export function performanceRatingToStarRating(performanceRating) {
  const value = performanceRating ?? 0;
  return Math.max(1, Math.min(5, Math.round(value / 2)));
}

export function starRatingToPerformanceRating(starRating) {
  return Math.max(1, Math.min(5, starRating)) * 2;
}

export function mapReviewSubmissionDetail(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const submittedAt = parseDateValue(row.submitted_at ?? row.submittedAt);
  const status = readString(row, ["status"]) || "pending";
  const statusLabel = formatReviewStatusLabel(status);
  const nestedPatient =
    row.patient && typeof row.patient === "object" && !Array.isArray(row.patient)
      ? row.patient
      : null;
  const patientName =
    readString(row, ["patient_name", "patientName", "child_name", "childName"]) ||
    readString(nestedPatient, ["full_name", "fullName", "name"]) ||
    "Patient";
  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]) ||
      readString(nestedPatient, ["id", "_id"]),
    patientName,
    exerciseTitle: readString(row, ["exercise_title", "exerciseTitle", "title"]) || "Exercise",
    status,
    statusLabel,
    statusTone: reviewStatusTone(status),
    submittedAt,
    submittedAtLabel: formatReviewSubmittedLabel(submittedAt),
    parentNotes: readString(row, ["parent_notes", "parentNotes"]) || null,
  };
}

function mediaTypeLabel(mediaType) {
  const normalized = (mediaType || "").trim().toLowerCase();
  if (normalized === "video") {
    return "Video";
  }
  if (normalized === "audio") {
    return "Audio";
  }
  if (normalized === "image") {
    return "Image";
  }
  return mediaType || "File";
}

function fileNameFromUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }
  const parts = fileUrl.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

export function mapSubmissionMediaItem(row) {
  const id = readString(row, ["id", "_id"]);
  const rawUrl = readString(row, ["file_url", "fileUrl"]);
  const resolvedUrl = resolveUploadedAssetUrl(rawUrl);
  if (!id || !resolvedUrl) {
    return null;
  }
  const mediaType = readString(row, ["media_type", "mediaType"]) || "image";
  const createdAt = parseDateValue(row.created_at ?? row.createdAt);
  return {
    id,
    mediaType,
    mediaTypeLabel: mediaTypeLabel(mediaType),
    fileUrl: resolvedUrl,
    fileName: fileNameFromUrl(rawUrl),
    durationSeconds: readNumber(row, ["duration_seconds", "durationSeconds"]),
    createdAt,
    createdAtLabel: formatReviewSubmittedLabel(createdAt),
  };
}

export function mapExerciseReviewRecord(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const performanceRating = readNumber(row, ["performance_rating", "performanceRating"]) ?? 0;
  return {
    id,
    submissionId: readString(row, ["submission_id", "submissionId"]),
    performanceRating,
    starRating: Math.max(1, Math.min(5, Math.round(performanceRating / 2))),
    feedback: readString(row, ["feedback"]),
    requiresRetry: readBoolean(row, ["requires_retry", "requiresRetry"]),
    reviewedAt: parseDateValue(row.reviewed_at ?? row.reviewedAt),
  };
}
