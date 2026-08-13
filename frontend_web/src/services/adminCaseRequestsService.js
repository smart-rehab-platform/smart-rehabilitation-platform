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

export async function fetchAdminCaseRequestsInbox(params = {}) {
  try {
    const response = await api.get("/case-intake-requests/admin/inbox", { params });
    const payload = response?.data;

    return {
      items: extractList(response),
      pagination: payload?.pagination ?? null,
    };
  } catch (error) {
    throwServiceError(error, "Failed to load case requests.");
  }
}

export async function fetchAdminCaseRequestById(requestId) {
  try {
    const response = await api.get(
      `/case-intake-requests/admin/${encodeURIComponent(requestId)}`,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to load case request.");
  }
}

export async function fetchMatchingSpecialists(requestId) {
  try {
    const response = await api.get(
      `/case-intake-requests/admin/${encodeURIComponent(requestId)}/matching-specialists`,
    );
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load matching specialists.");
  }
}

export async function assignSpecialistToCaseRequest(requestId, specialistId) {
  try {
    const response = await api.patch(
      `/case-intake-requests/admin/${encodeURIComponent(requestId)}/assign`,
      { specialist_id: specialistId },
    );
    return extractData(response) ?? response?.data ?? null;
  } catch (error) {
    throwServiceError(error, "Failed to assign specialist.");
  }
}
