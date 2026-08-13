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

export async function getSpecialistProfiles() {
  try {
    const response = await api.get("/specialists");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load specialist profile.");
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
 * @param {{ specialization?: string|null, license_number?: string|null, bio?: string|null, years_of_experience?: number|null }} payload
 */
export async function createSpecialistProfile(payload) {
  try {
    const response = await api.post("/specialists/profile", payload);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to create specialist profile.");
  }
}

/**
 * @param {string} profileId specialist_profiles.id
 * @param {{ specialization?: string|null, license_number?: string|null, bio?: string|null, years_of_experience?: number|null }} payload
 */
export async function updateSpecialistProfile(profileId, payload) {
  try {
    const response = await api.put(
      `/specialists/${encodeURIComponent(profileId)}/profile`,
      payload,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update specialist profile.");
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
