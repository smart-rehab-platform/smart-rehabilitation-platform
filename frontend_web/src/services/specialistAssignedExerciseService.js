import api from "./api";

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

function extractList(response) {
  const payload = response?.data;
  const data = payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && Array.isArray(data.items)) {
    return data.items;
  }
  if (data && typeof data === "object" && Array.isArray(data.rows)) {
    return data.rows;
  }
  return [];
}

function requireId(value, label) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id) {
    throw new Error(`${label} is required.`);
  }
  return id;
}

function readApiMessage(error) {
  const apiMessage = error?.response?.data?.message;
  return typeof apiMessage === "string" && apiMessage.trim()
    ? apiMessage.trim()
    : "";
}

function throwAssignedExerciseError(error, fallbackMessage) {
  const status = error?.response?.status;
  const apiMessage = readApiMessage(error);

  if (status === 401) {
    throw new Error("Please sign in to continue.");
  }
  if (status === 403) {
    throw new Error(apiMessage || "You do not have permission to assign this exercise.");
  }
  if (status === 404) {
    throw new Error(apiMessage || "Exercise, patient, or treatment plan was not found.");
  }
  if (status === 409) {
    throw new Error(apiMessage || "This exercise may already be assigned.");
  }
  if (status === 400) {
    throw new Error(apiMessage || "Invalid assignment details. Check exercise, plan, and dates.");
  }
  if (apiMessage) {
    throw new Error(apiMessage);
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

export async function createAssignedExercise(payload) {
  try {
    const response = await api.post("/assigned-exercises", payload);
    const row = extractMap(response);
    if (!row) {
      throw new Error("Assignment returned no data");
    }
    return row;
  } catch (error) {
    throwAssignedExerciseError(error, "Failed to assign exercise. Please try again.");
  }
}

/**
 * Loads a single assigned exercise by id (Flutter specialist assigned-exercise details).
 * @param {string} assignedExerciseId
 * @returns {Promise<Record<string, unknown>|null>}
 */
export async function getAssignedExerciseById(assignedExerciseId) {
  const id = requireId(assignedExerciseId, "Assigned exercise id");

  try {
    const response = await api.get(`/assigned-exercises/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwAssignedExerciseError(error, "Failed to load assigned exercise.");
  }
}

/**
 * Loads submissions for an assigned exercise (newest first from API).
 * @param {string} assignedExerciseId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function getAssignedExerciseSubmissions(assignedExerciseId) {
  const id = requireId(assignedExerciseId, "Assigned exercise id");

  try {
    const response = await api.get(
      `/assigned-exercises/${encodeURIComponent(id)}/submissions`,
    );
    return extractList(response);
  } catch (error) {
    throwAssignedExerciseError(error, "Failed to load assignment submissions.");
  }
}

/**
 * Soft-deactivates an assignment (does not delete library exercise or history).
 * @param {string} assignedExerciseId
 * @returns {Promise<Record<string, unknown>|null>}
 */
export async function deactivateAssignedExercise(assignedExerciseId) {
  const id = requireId(assignedExerciseId, "Assigned exercise id");

  try {
    const response = await api.patch(
      `/assigned-exercises/${encodeURIComponent(id)}/deactivate`,
    );
    return extractMap(response);
  } catch (error) {
    throwAssignedExerciseError(error, "Failed to deactivate assigned exercise.");
  }
}
