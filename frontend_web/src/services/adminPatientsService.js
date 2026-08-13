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

export async function fetchAdminPatients() {
  try {
    const response = await api.get("/dashboard/admin/patients");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patients.");
  }
}

export async function fetchCaseCategories() {
  try {
    const response = await api.get("/case-categories");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load case categories.");
  }
}
