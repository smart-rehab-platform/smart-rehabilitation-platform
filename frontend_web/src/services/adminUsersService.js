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

export async function fetchAdminUsers() {
  try {
    const response = await api.get("/users");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load users.");
  }
}

export async function createAdminUser(payload) {
  try {
    const response = await api.post("/auth/register", payload);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to create user.");
  }
}

export async function updateAdminUser(id, payload) {
  try {
    const response = await api.put(`/users/${encodeURIComponent(id)}`, payload);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to update user.");
  }
}

export async function updateAdminUserStatus(id, isActive) {
  try {
    const response = await api.patch(`/users/${encodeURIComponent(id)}/status`, {
      is_active: isActive,
    });
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to update user status.");
  }
}

export async function deleteAdminUser(id) {
  try {
    const response = await api.delete(`/users/${encodeURIComponent(id)}`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to delete user.");
  }
}

export async function fetchAdminUsersPresence() {
  try {
    const response = await api.get("/presence/users");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load presence.");
  }
}
