import api from "./api";
import {
  mapExerciseCategoryList,
  mapExerciseItem,
  mapExerciseList,
} from "../features/specialist-dashboard/utils/specialistExerciseMappers";

function extractList(response) {
  const payload = response?.data;
  const data = payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
  return Array.isArray(data) ? data : [];
}

function extractMap(response) {
  const payload = response?.data;
  const data = payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
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

const GENERIC_EXERCISE_SERVER_ERROR =
  "Something went wrong while processing the exercise request.";

function readApiMessage(error) {
  const apiMessage = error?.response?.data?.message;
  return typeof apiMessage === "string" && apiMessage.trim()
    ? apiMessage.trim()
    : "";
}

function throwServiceError(error, fallbackMessage) {
  const status = error?.response?.status;
  const apiMessage = readApiMessage(error);
  if (status === 401) {
    throw new Error("Please sign in to continue.");
  }
  if (status === 403) {
    throw new Error(apiMessage || "You do not have access to this resource.");
  }
  if (status === 404) {
    throw new Error("Exercise not found.");
  }
  if (apiMessage && apiMessage !== GENERIC_EXERCISE_SERVER_ERROR) {
    throw new Error(apiMessage);
  }
  if (error instanceof Error && error.message && error.message !== GENERIC_EXERCISE_SERVER_ERROR) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

function readUploadedMediaUrl(data) {
  if (!data || typeof data !== "object") {
    return "";
  }
  const value = data.url ?? data.file_url ?? data.fileUrl;
  return typeof value === "string" ? value.trim() : "";
}

export async function loadSpecialistExercises() {
  try {
    const response = await api.get("/exercises");
    return mapExerciseList(extractList(response));
  } catch (error) {
    throwServiceError(error, "Failed to load exercises.");
  }
}

export async function loadSpecialistExerciseById(exerciseId) {
  const id = requireId(exerciseId, "Exercise id");
  try {
    const response = await api.get(`/exercises/${encodeURIComponent(id)}`);
    const row = extractMap(response);
    return row ? mapExerciseItem(row) : null;
  } catch (error) {
    throwServiceError(error, "Failed to load exercise.");
  }
}

export async function loadExerciseCategories() {
  try {
    const response = await api.get("/exercise-categories");
    return mapExerciseCategoryList(extractList(response));
  } catch (error) {
    throwServiceError(error, "Failed to load categories.");
  }
}

export async function createSpecialistExercise(payload) {
  try {
    const response = await api.post("/exercises", payload);
    const row = extractMap(response);
    if (!row) {
      throw new Error("Exercise create returned no data");
    }
    const mapped = mapExerciseItem(row);
    if (!mapped) {
      throw new Error("Exercise create returned no data");
    }
    return mapped;
  } catch (error) {
    throwServiceError(error, "Failed to create exercise.");
  }
}

export async function updateSpecialistExercise(exerciseId, payload) {
  const id = requireId(exerciseId, "Exercise id");
  try {
    const response = await api.put(`/exercises/${encodeURIComponent(id)}`, payload);
    const row = extractMap(response);
    return row ? mapExerciseItem(row) : null;
  } catch (error) {
    throwServiceError(error, "Failed to save exercise changes.");
  }
}

export async function uploadExerciseInstructionMedia(file, { onProgress } = {}) {
  if (!(file instanceof File)) {
    throw new Error("Unable to read the selected file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/uploads/exercise-media", formData, {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return;
        }
        onProgress(event.loaded / event.total);
      },
    });
    const url = readUploadedMediaUrl(extractMap(response));
    if (!url) {
      throw new Error("Invalid upload response: missing file URL");
    }
    return url;
  } catch (error) {
    throwServiceError(error, "Failed to upload instructional media.");
  }
}
