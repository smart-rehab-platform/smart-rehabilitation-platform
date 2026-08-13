import api from "./api";
import { fetchAdminUsers } from "./adminUsersService";

function extractData(response) {
  const payload = response?.data;

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload ?? null;
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const message = typeof apiMessage === "string" && apiMessage.trim()
    ? apiMessage.trim()
    : (error instanceof Error && error.message
      ? error.message
      : fallbackMessage);

  const serviceError = new Error(message);
  if (error?.response?.status) {
    serviceError.status = error.response.status;
  }
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    serviceError.code = apiMessage.trim();
  }
  throw serviceError;
}

function requireId(value, label) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id) {
    throw new Error(`${label} is required.`);
  }
  return id;
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

function buildComplaintsListQuery(filters = {}) {
  const params = {};

  const status = readQueryValue(filters.status);
  const category = readQueryValue(filters.category);
  const specialistId = readQueryValue(filters.specialist_id ?? filters.specialistId);
  const from = readQueryValue(filters.from);
  const to = readQueryValue(filters.to);
  const page = readQueryValue(filters.page);
  const limit = readQueryValue(filters.limit);

  if (status) {
    params.status = status;
  }
  if (category) {
    params.category = category;
  }
  if (specialistId) {
    params.specialist_id = specialistId;
  }
  if (from) {
    params.from = from;
  }
  if (to) {
    params.to = to;
  }
  if (page) {
    params.page = Number(page);
  }
  if (limit) {
    params.limit = Number(limit);
  }

  return params;
}

/**
 * GET /admin/complaints
 * @param {object} filters
 */
export async function loadAdminComplaints(filters = {}) {
  try {
    const response = await api.get("/admin/complaints", {
      params: buildComplaintsListQuery(filters),
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
    throwServiceError(error, "Failed to load complaints.");
  }
}

/**
 * GET /admin/complaints/:id
 * @param {string} complaintId
 */
export async function loadAdminComplaintDetails(complaintId) {
  try {
    const id = requireId(complaintId, "Complaint id");
    const response = await api.get(`/admin/complaints/${encodeURIComponent(id)}`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to load complaint details.");
  }
}

/**
 * PATCH /admin/complaints/:id/start-review
 * @param {string} complaintId
 */
export async function startAdminComplaintReview(complaintId) {
  try {
    const id = requireId(complaintId, "Complaint id");
    const response = await api.patch(`/admin/complaints/${encodeURIComponent(id)}/start-review`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to start complaint review.");
  }
}

/**
 * PATCH /admin/complaints/:id/resolve
 * @param {string} complaintId
 * @param {{ admin_notes: string, parent_response?: string|null }} payload
 */
export async function resolveAdminComplaint(complaintId, payload) {
  try {
    const id = requireId(complaintId, "Complaint id");
    const response = await api.patch(
      `/admin/complaints/${encodeURIComponent(id)}/resolve`,
      payload,
    );
    const data = extractData(response);

    if (data && typeof data === "object" && data.complaint) {
      return data.complaint;
    }

    return data;
  } catch (error) {
    throwServiceError(error, "Failed to resolve complaint.");
  }
}

/**
 * PATCH /admin/complaints/:id/reject
 * @param {string} complaintId
 * @param {{ admin_notes: string, parent_response?: string|null }} payload
 */
export async function rejectAdminComplaint(complaintId, payload) {
  try {
    const id = requireId(complaintId, "Complaint id");
    const response = await api.patch(
      `/admin/complaints/${encodeURIComponent(id)}/reject`,
      payload,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to reject complaint.");
  }
}

/**
 * Specialist filter options via existing GET /users.
 * Returns raw user rows (role specialist); map in mappers.
 */
export async function loadAdminComplaintSpecialists() {
  try {
    const users = await fetchAdminUsers();
    return Array.isArray(users) ? users : [];
  } catch (error) {
    throwServiceError(error, "Failed to load specialists.");
  }
}
