import api from "./api";
import {
  mapApprovedSessionSummary,
  mapSessionRequestList,
  mapSpecialistSessionDetails,
  normalizeSessionRequestStatus,
} from "../features/specialist-dashboard/utils/specialistSessionMappers";

function extractList(response) {
  const payload = response?.data;
  const data = payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
  return Array.isArray(data) ? data : [];
}

function extractMap(response) {
  const payload = response?.data;
  const data = payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
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
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;
  if (status === 401) {
    throw new Error("Please sign in to continue.");
  }
  if (status === 403) {
    throw new Error("You do not have access to this resource.");
  }
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

async function fetchSpecialistSessionRows(specialistUserId) {
  const response = await api.get(
    `/specialists/${encodeURIComponent(specialistUserId)}/sessions`,
  );
  const rows = extractList(response);
  if (rows.length > 0) {
    return rows;
  }

  try {
    const fallbackResponse = await api.get("/dashboard/specialist/upcoming-sessions");
    return extractList(fallbackResponse);
  } catch {
    return rows;
  }
}

async function fetchApprovedSessionDetails(sessionId) {
  try {
    const response = await api.get(`/sessions/${encodeURIComponent(sessionId)}`);
    return extractMap(response);
  } catch {
    return null;
  }
}

async function enrichSessionRequestsWithApprovedSessions(requests) {
  const enriched = await Promise.allSettled(
    requests.map(async (request) => {
      if (normalizeSessionRequestStatus(request.status) !== "approved" || !request.approvedSessionId) {
        return request;
      }

      const sessionRow = await fetchApprovedSessionDetails(request.approvedSessionId);
      const approvedSession = mapApprovedSessionSummary(sessionRow);
      return approvedSession
        ? { ...request, approvedSession }
        : request;
    }),
  );

  return enriched.map((result, index) => (
    result.status === "fulfilled" ? result.value : requests[index]
  ));
}

export async function loadSpecialistSessions(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");

  try {
    const rows = await fetchSpecialistSessionRows(id);
    return mapSpecialistSessionDetails(rows);
  } catch (error) {
    throwServiceError(error, "Failed to load sessions.");
  }
}

export async function loadSpecialistSessionRequestsInbox() {
  try {
    const response = await api.get("/session-requests/inbox");
    const requests = mapSessionRequestList(extractList(response));
    return enrichSessionRequestsWithApprovedSessions(requests);
  } catch (error) {
    if (error?.response?.status === 401) {
      const authError = new Error("Please sign in to view session requests.");
      authError.cause = error;
      throw authError;
    }
    throwServiceError(error, "Failed to load session requests.");
  }
}

export async function createSpecialistSession(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Session payload is required.");
  }

  try {
    const response = await api.post("/sessions", payload);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to create session.");
  }
}
