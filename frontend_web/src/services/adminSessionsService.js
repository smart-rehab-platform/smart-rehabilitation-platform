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

export async function loadAdminSessions() {
  try {
    const response = await api.get("/sessions");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load sessions.");
  }
}

export async function updateAdminSession(sessionId, payload) {
  const id = requireId(sessionId, "Session id");

  try {
    const response = await api.put(`/sessions/${encodeURIComponent(id)}`, payload);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to update session.");
  }
}

export async function completeAdminSession(sessionId) {
  const id = requireId(sessionId, "Session id");

  try {
    const response = await api.patch(`/sessions/${encodeURIComponent(id)}/complete`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to complete session.");
  }
}

export async function cancelAdminSession(sessionId, payload = {}) {
  const id = requireId(sessionId, "Session id");

  try {
    const response = await api.patch(
      `/sessions/${encodeURIComponent(id)}/cancel`,
      payload,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to cancel session.");
  }
}

export async function markAdminSessionNoShow(sessionId) {
  const id = requireId(sessionId, "Session id");

  try {
    const response = await api.patch(`/sessions/${encodeURIComponent(id)}/no-show`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to mark session as no show.");
  }
}
