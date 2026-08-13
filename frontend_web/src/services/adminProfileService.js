import api from "./api";

function extractData(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
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

/**
 * Uploads the authenticated Admin's profile photo.
 * Backend updates users.profile_image_url and returns the updated user.
 *
 * @param {File} file
 */
export async function uploadAdminProfileImage(file) {
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
