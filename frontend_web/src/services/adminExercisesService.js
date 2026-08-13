import api from "./api";

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

function requireId(value, label) {
  const id = typeof value === "string" ? value.trim() : "";

  if (!id) {
    throw new Error(`${label} is required.`);
  }

  return id;
}

export async function loadAdminExercises() {
  try {
    const response = await api.get("/exercises");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load exercises.");
  }
}

export async function loadAdminExerciseDetails(exerciseId) {
  const id = requireId(exerciseId, "Exercise id");

  try {
    const response = await api.get(`/exercises/${encodeURIComponent(id)}`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to load exercise details.");
  }
}

export async function loadExerciseCategories() {
  try {
    const response = await api.get("/exercise-categories");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load exercise categories.");
  }
}

export async function createAdminExercise(payload) {
  try {
    const response = await api.post("/exercises", payload);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to create exercise.");
  }
}

export async function updateAdminExercise(exerciseId, payload) {
  const id = requireId(exerciseId, "Exercise id");

  try {
    const response = await api.put(`/exercises/${encodeURIComponent(id)}`, payload);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to update exercise.");
  }
}

export async function uploadAdminExerciseMedia(file) {
  if (!(file instanceof File)) {
    throw new Error("A file is required for upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/uploads/exercise-media", formData);
    const data = extractData(response);
    const url = data?.url ?? data?.file_url ?? data?.fileUrl;

    if (typeof url !== "string" || !url.trim()) {
      throw new Error("Upload failed: missing media URL.");
    }

    return url.trim();
  } catch (error) {
    throwServiceError(error, "Failed to upload exercise media.");
  }
}

export async function deleteAdminExercise(exerciseId) {
  const id = requireId(exerciseId, "Exercise id");

  try {
    const response = await api.delete(`/exercises/${encodeURIComponent(id)}`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to delete exercise.");
  }
}
