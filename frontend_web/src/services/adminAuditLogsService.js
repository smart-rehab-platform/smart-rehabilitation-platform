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

function readQueryValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildAuditLogQuery(filters = {}) {
  const params = {};
  const userId = readQueryValue(filters.user_id);
  const action = readQueryValue(filters.action);
  const entityName = readQueryValue(filters.entity_name);
  const dateFrom = readQueryValue(filters.date_from);
  const dateTo = readQueryValue(filters.date_to);

  if (userId) {
    params.user_id = userId;
  }

  if (action) {
    params.action = action;
  }

  if (entityName) {
    params.entity_name = entityName;
  }

  if (dateFrom) {
    params.date_from = dateFrom;
  }

  if (dateTo) {
    params.date_to = dateTo;
  }

  return params;
}

export async function loadAdminAuditLogs(filters = {}) {
  try {
    const response = await api.get("/audit-logs", {
      params: buildAuditLogQuery(filters),
    });
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load audit logs.");
  }
}
