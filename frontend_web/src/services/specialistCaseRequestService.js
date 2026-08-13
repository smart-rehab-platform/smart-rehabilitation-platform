import api from "./api";
import {
  mapCaseCategoryList,
  mapSpecialistCaseRequestDetail,
  mapSpecialistCaseRequestList,
} from "../features/specialist-dashboard/utils/specialistCaseRequestMappers";

const BASE = "/case-intake-requests";

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

function extractPagination(response, fallback = {}) {
  const payload = response?.data;
  const pagination = payload?.pagination && typeof payload.pagination === "object"
    ? payload.pagination
    : {};
  return { ...fallback, ...pagination };
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

function requireId(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

function throwServiceError(error, fallbackMessage) {
  const status = error?.response?.status;
  if (status === 404) {
    throw new Error("Case request not found.");
  }
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
 * GET /case-intake-requests/specialist/assigned
 * Flutter: CaseIntakeRepository.fetchSpecialistAssigned
 */
export async function fetchSpecialistAssignedCaseRequests({
  page = 1,
  limit = 20,
  status,
  categoryId,
  childName,
} = {}) {
  const query = buildQuery({
    page,
    limit,
    status: status || undefined,
    category_id: categoryId || undefined,
    child_name: childName || undefined,
  });

  try {
    const response = await api.get(`${BASE}/specialist/assigned${query}`);
    const rows = extractList(response);
    const pagination = extractPagination(response, { page, limit, total: rows.length });
    const total = Number(pagination.total ?? rows.length) || 0;
    const totalPages = Number(
      pagination.total_pages
        ?? pagination.totalPages
        ?? (total === 0 ? 0 : Math.ceil(total / limit)),
    );
    const currentPage = Number(pagination.page ?? page) || page;

    return {
      items: mapSpecialistCaseRequestList(rows),
      pagination: {
        page: currentPage,
        limit: Number(pagination.limit ?? limit) || limit,
        total,
        totalPages,
        hasMore: totalPages > 0 && currentPage < totalPages,
      },
    };
  } catch (error) {
    throwServiceError(error, "Failed to load assigned case requests.");
  }
}

/**
 * GET /case-intake-requests/specialist/:id
 */
export async function fetchSpecialistCaseRequestDetail(caseRequestId) {
  const id = requireId(caseRequestId, "Case request id");
  try {
    const response = await api.get(`${BASE}/specialist/${encodeURIComponent(id)}`);
    const data = extractMap(response);
    const detail = mapSpecialistCaseRequestDetail(data);
    if (!detail) {
      throw new Error("Case request not found.");
    }
    return detail;
  } catch (error) {
    throwServiceError(error, "Failed to load case request.");
  }
}

/**
 * GET /case-categories
 */
export async function fetchCaseCategories() {
  try {
    const response = await api.get("/case-categories");
    return mapCaseCategoryList(extractList(response));
  } catch (error) {
    throwServiceError(error, "Failed to load case categories.");
  }
}

/**
 * PATCH /case-intake-requests/specialist/:id/start-assessment
 */
export async function startSpecialistCaseAssessment(caseRequestId) {
  const id = requireId(caseRequestId, "Case request id");
  try {
    const response = await api.patch(`${BASE}/specialist/${encodeURIComponent(id)}/start-assessment`);
    const detail = mapSpecialistCaseRequestDetail(extractMap(response));
    return detail || fetchSpecialistCaseRequestDetail(id);
  } catch (error) {
    throwServiceError(error, "Failed to start assessment.");
  }
}

/**
 * PATCH /case-intake-requests/specialist/:id/assessment-notes
 */
export async function updateSpecialistAssessmentNotes(caseRequestId, assessmentNotes) {
  const id = requireId(caseRequestId, "Case request id");
  try {
    const response = await api.patch(
      `${BASE}/specialist/${encodeURIComponent(id)}/assessment-notes`,
      { assessment_notes: assessmentNotes },
    );
    const detail = mapSpecialistCaseRequestDetail(extractMap(response));
    return detail || fetchSpecialistCaseRequestDetail(id);
  } catch (error) {
    throwServiceError(error, "Failed to update assessment notes.");
  }
}

/**
 * PATCH /case-intake-requests/specialist/:id/accept
 * Backend auto-converts to patient.
 */
export async function acceptSpecialistCaseRequest(caseRequestId) {
  const id = requireId(caseRequestId, "Case request id");
  try {
    const response = await api.patch(`${BASE}/specialist/${encodeURIComponent(id)}/accept`);
    const detail = mapSpecialistCaseRequestDetail(extractMap(response));
    return detail || fetchSpecialistCaseRequestDetail(id);
  } catch (error) {
    throwServiceError(error, "Failed to accept case request.");
  }
}

/**
 * PATCH /case-intake-requests/specialist/:id/reject
 */
export async function rejectSpecialistCaseRequest(caseRequestId, reason) {
  const id = requireId(caseRequestId, "Case request id");
  try {
    const response = await api.patch(
      `${BASE}/specialist/${encodeURIComponent(id)}/reject`,
      { reason },
    );
    const detail = mapSpecialistCaseRequestDetail(extractMap(response));
    return detail || fetchSpecialistCaseRequestDetail(id);
  } catch (error) {
    throwServiceError(error, "Failed to reject case request.");
  }
}
