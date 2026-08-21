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
