import api from "./api";
import { fetchAdminUsers } from "./adminUsersService";

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
  const specialistId = readQueryValue(filters.specialist_id ?? filters.specialistId);
  const from = readQueryValue(filters.from);
  const to = readQueryValue(filters.to);
  const page = readQueryValue(filters.page);
  const limit = readQueryValue(filters.limit);

  if (status) params.status = status;
  if (category) params.category = category;
  if (specialistId) params.specialist_id = specialistId;
  if (from) params.from = from;
  if (to) params.to = to;
  if (page) params.page = Number(page);
  if (limit) params.limit = Number(limit);

  return params;
}

/** GET /admin/support-requests */
export async function loadAdminSupportRequests(filters = {}) {
  try {
    const response = await api.get("/admin/support-requests", {
      params: buildListQuery(filters),
    });
    const data = extractData(response);

    if (data && typeof data === "object" && !Array.isArray(data)) {
      return {
        items: Array.isArray(data.items) ? data.items : [],
        pagination: data.pagination ?? null,
      };
    }

    return {
      items: Array.isArray(data) ? data : [],
      pagination: null,
    };
  } catch (error) {
    throwServiceError(error, "Failed to load support requests.");
  }
}

/** GET /admin/support-requests/:id */
export async function loadAdminSupportRequestDetails(requestId) {
  try {
    const id = requireId(requestId, "Support request id");
    const response = await api.get(`/admin/support-requests/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load support request details.");
  }
}

/** POST /admin/support-requests/:id/messages */
export async function replyToAdminSupportRequest(requestId, body) {
  try {
    const id = requireId(requestId, "Support request id");
    const response = await api.post(
      `/admin/support-requests/${encodeURIComponent(id)}/messages`,
      body,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to send reply.");
  }
}

/** PATCH /admin/support-requests/:id/status */
export async function updateAdminSupportRequestStatus(requestId, status) {
  try {
    const id = requireId(requestId, "Support request id");
    const response = await api.patch(
      `/admin/support-requests/${encodeURIComponent(id)}/status`,
      { status },
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update support request status.");
  }
}

/** Specialist filter options via GET /users */
export async function loadAdminSupportRequestSpecialists() {
  try {
    const users = await fetchAdminUsers();
    return Array.isArray(users) ? users : [];
  } catch (error) {
    throwServiceError(error, "Failed to load specialists.");
  }
}

export { uploadSupportRequestAttachment } from "./specialistSupportRequestsService";
