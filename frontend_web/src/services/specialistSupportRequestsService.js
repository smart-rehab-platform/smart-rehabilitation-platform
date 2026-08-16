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
  const id = typeof value === "string" ? value.trim() : "";
  if (!id) {
    throw new Error(`${label} is required.`);
  }
  return id;
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const message = typeof apiMessage === "string" && apiMessage.trim()
    ? apiMessage.trim()
    : (error instanceof Error && error.message ? error.message : fallbackMessage);

  const serviceError = new Error(message);
  if (error?.response?.status) {
    serviceError.status = error.response.status;
  }
  if (error?.response?.data?.code) {
    serviceError.code = error.response.data.code;
  }
  throw serviceError;
}

function readQueryValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function buildListQuery(filters = {}) {
  const params = {};
  const status = readQueryValue(filters.status);
  const category = readQueryValue(filters.category);

  if (status) params.status = status;
  if (category) params.category = category;

  return params;
}

/** POST /support-requests */
export async function createSpecialistSupportRequest(body) {
  try {
    const response = await api.post("/support-requests", body);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to submit support request.");
  }
}

/** GET /support-requests/my */
export async function loadSpecialistSupportRequests(filters = {}) {
  try {
    const response = await api.get("/support-requests/my", {
      params: buildListQuery(filters),
    });
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load support requests.");
  }
}

/** GET /support-requests/:id */
export async function loadSpecialistSupportRequestDetails(requestId) {
  try {
    const id = requireId(requestId, "Support request id");
    const response = await api.get(`/support-requests/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load support request details.");
  }
}

/** POST /support-requests/:id/messages */
export async function replyToSpecialistSupportRequest(requestId, body) {
  try {
    const id = requireId(requestId, "Support request id");
    const response = await api.post(
      `/support-requests/${encodeURIComponent(id)}/messages`,
      body,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to send reply.");
  }
}

/** POST /uploads/support-request-attachment */
export async function uploadSupportRequestAttachment(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/uploads/support-request-attachment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to upload attachment.");
  }
}
