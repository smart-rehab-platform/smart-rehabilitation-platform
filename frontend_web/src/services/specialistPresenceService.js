import api from "./api";

function extractData(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
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

/**
 * @param {string} userId
 */
export async function getUserPresence(userId) {
  if (typeof userId !== "string" || !userId.trim()) {
    throw new Error("User id is required.");
  }

  try {
    const response = await api.get(`/presence/users/${encodeURIComponent(userId.trim())}`);
    const data = extractData(response);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch (error) {
    throwServiceError(error, "Failed to load presence.");
  }
}
