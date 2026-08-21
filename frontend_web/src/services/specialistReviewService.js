import api from "./api";
import { resolveUploadedAssetUrl } from "./apiConfig";
import { getPatientById, loadSpecialistPatients } from "./specialistPatientService";
import {
  mapExerciseReviewRecord,
  mapReviewSubmissionDetail,
  mapSubmissionMediaItem,
} from "../features/specialist-dashboard/utils/specialistReviewMappers";
import { mapPendingReviewRow } from "../features/specialist-dashboard/utils/specialistPreviewMappers";
import { mapSpecialistPatientList } from "../features/specialist-dashboard/utils/specialistPatientMappers";

function extractData(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
}

function extractList(response) {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

function extractMap(response) {
  const data = extractData(response);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return null;
}

function requireId(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

export async function loadSpecialistAllPendingReviews(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");
  try {
    const [response, patientRows] = await Promise.all([
      api.get(`/specialists/${encodeURIComponent(id)}/pending-reviews`),
      loadSpecialistPatients(id),
    ]);
    const rows = extractList(response);
    const patientAvatarById = new Map(
      mapSpecialistPatientList(patientRows).map((patient) => [
        patient.id,
        patient.profileImageUrl ?? null,
      ]),
    );

    return rows
      .map((row) => mapPendingReviewRow(row, { patientAvatarById }))
      .filter(Boolean)
      .sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0));
  } catch (error) {
    throwServiceError(error, "Failed to load pending reviews.");
  }
}

function readPatientDisplayName(patientRow) {
  if (!patientRow || typeof patientRow !== "object") {
    return "";
  }
  for (const key of ["full_name", "fullName", "name", "patient_name", "patientName"]) {
    const value = patientRow[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function needsPatientNameLookup(patientName) {
  const normalized = (patientName || "").trim();
  return !normalized || normalized.toLowerCase() === "patient";
}

export async function loadReviewExerciseBundle(submissionId) {
  const id = requireId(submissionId, "Submission id");
  try {
    const [submissionResponse, mediaResponse, reviewResponse] = await Promise.all([
      api.get(`/exercise-submissions/${encodeURIComponent(id)}`),
      api.get(`/exercise-submissions/${encodeURIComponent(id)}/media`),
      api.get(`/exercise-submissions/${encodeURIComponent(id)}/review`).catch((error) => {
        if (error?.response?.status === 404) {
          return { data: { success: false, data: null } };
        }
        throw error;
      }),
    ]);

    const submissionMap = extractMap(submissionResponse);
    if (!submissionMap) {
      throw new Error("Submission not found.");
    }

    let submission = mapReviewSubmissionDetail(submissionMap);
    if (!submission) {
      throw new Error("Submission not found.");
    }

    // Submission detail API includes patient_id but not patient_name; resolve via patient profile.
    if (submission.patientId && needsPatientNameLookup(submission.patientName)) {
      try {
        const patientRow = await getPatientById(submission.patientId);
        const resolvedName = readPatientDisplayName(patientRow);
        submission = {
          ...submission,
          patientName: resolvedName || "Unknown patient",
        };
      } catch {
        submission = {
          ...submission,
          patientName: "Unknown patient",
        };
      }
    }

    const mediaRows = extractList(mediaResponse);
    const reviewMap = extractMap(reviewResponse);

    return {
      submission,
      media: mediaRows.map(mapSubmissionMediaItem).filter(Boolean),
      existingReview: reviewMap ? mapExerciseReviewRecord(reviewMap) : null,
    };
  } catch (error) {
    throwServiceError(error, "Failed to load submission.");
  }
}

export async function createExerciseReview(submissionId, { specialistId, performanceRating, feedback, requiresRetry }) {
  const id = requireId(submissionId, "Submission id");
  try {
    const response = await api.post(`/exercise-submissions/${encodeURIComponent(id)}/review`, {
      specialist_id: requireId(specialistId, "Specialist id"),
      performance_rating: performanceRating,
      feedback: feedback ?? "",
      requires_retry: requiresRetry === true,
    });
    return mapExerciseReviewRecord(extractMap(response));
  } catch (error) {
    throwServiceError(error, "Failed to submit review.");
  }
}

export async function updateExerciseReview(reviewId, { performanceRating, feedback, requiresRetry }) {
  const id = requireId(reviewId, "Review id");
  try {
    const response = await api.put(`/exercise-reviews/${encodeURIComponent(id)}`, {
      performance_rating: performanceRating,
      feedback: feedback ?? "",
      requires_retry: requiresRetry === true,
    });
    return mapExerciseReviewRecord(extractMap(response));
  } catch (error) {
    throwServiceError(error, "Failed to update review.");
  }
}

export { resolveUploadedAssetUrl };
