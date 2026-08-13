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

export async function loadAdminAiCenter() {
  try {
    const response = await api.get("/dashboard/admin/ai-center");
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to load AI Center.");
  }
}
