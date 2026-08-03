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

function extractMap(response) {
  const data = extractData(response);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return null;
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

export async function getCurrentUserProfile() {
  try {
    const response = await api.get("/auth/me");
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load profile.");
  }
}

export async function getParentProfiles() {
  try {
    const response = await api.get("/parents");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load parent profile.");
  }
}

/**
 * @param {{ full_name: string, phone?: string|null }} payload
 */
export async function updateUserProfile(payload) {
  try {
    const response = await api.put("/users/profile/me", payload);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update profile.");
  }
}

/**
 * @param {{ address?: string|null, relationship_notes?: string|null }} payload
 */
export async function createParentProfile(payload) {
  try {
    const response = await api.post("/parents/profile", payload);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to create parent profile.");
  }
}

/**
 * @param {string} profileId
 * @param {{ address?: string|null, relationship_notes?: string|null }} payload
 */
export async function updateParentProfile(profileId, payload) {
  try {
    const response = await api.put(
      `/parents/${encodeURIComponent(profileId)}/profile`,
      payload,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update parent profile.");
  }
}

/**
 * @param {File} file
 */
export async function uploadProfileImage(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/users/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to upload profile image.");
  }
}
