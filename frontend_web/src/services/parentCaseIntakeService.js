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

function requireId(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
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

export async function getCaseCategories() {
  try {
    const response = await api.get("/case-categories");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load case categories.");
  }
}

export async function getMyCaseRequests() {
  try {
    const response = await api.get("/case-intake-requests/mine");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load case requests.");
  }
}

export async function getCaseRequestById(requestId) {
  const id = requireId(requestId, "Request id");
  try {
    const response = await api.get(`/case-intake-requests/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load case request.");
  }
}

export async function createCaseRequest(body) {
  try {
    const response = await api.post("/case-intake-requests", body);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to submit case request.");
  }
}

export async function updateCaseRequest(requestId, body) {
  const id = requireId(requestId, "Request id");
  try {
    const response = await api.patch(`/case-intake-requests/${encodeURIComponent(id)}`, body);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update case request.");
  }
}

export async function uploadCaseRequestChildImage(file) {
  if (!(file instanceof File)) {
    throw new Error("An image file is required.");
  }

  const formData = new FormData();
  formData.append("child_image", file);

  try {
    const response = await api.post("/uploads/case-request-child-image", formData);
    const data = extractMap(response);
    const url = data?.url ?? data?.file_url ?? data?.fileUrl;

    if (typeof url !== "string" || !url.trim()) {
      throw new Error("Image upload failed.");
    }

    return url.trim();
  } catch (error) {
    throwServiceError(error, "Failed to upload child photo.");
  }
}

const parentCaseIntakeService = {
  getCaseCategories,
  getMyCaseRequests,
  getCaseRequestById,
  createCaseRequest,
  updateCaseRequest,
  uploadCaseRequestChildImage,
};

export default parentCaseIntakeService;
