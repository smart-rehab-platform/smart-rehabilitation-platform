import api from "./api";
import {
  buildAdminOverviewKpis,
  clampWeekOffset,
  mapRecentUser,
  mapWeeklySystemActivity,
} from "../features/admin-dashboard/utils/adminDashboardMappers";

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

/**
 * Loads admin dashboard KPI counts using the same multi-endpoint aggregation as Flutter.
 */
export async function fetchAdminOverviewKpis() {
  try {
    const [overviewResponse, usersByRoleResponse, allUsersResponse] =
      await Promise.all([
        api.get("/dashboard/admin/overview"),
        api.get("/dashboard/admin/users"),
        api.get("/users"),
      ]);

    const overviewMap = extractData(overviewResponse);
    const usersByRole = extractList(usersByRoleResponse);
    const allUsers = extractList(allUsersResponse);

    let totalPatients =
      overviewMap?.total_patients ?? overviewMap?.totalPatients ?? 0;

    let patientsList = null;
    if (!totalPatients) {
      const patientsResponse = await api.get("/patients");
      patientsList = extractList(patientsResponse);
    }

    return buildAdminOverviewKpis({
      overviewMap,
      usersByRole,
      allUsers,
      patientsList,
    });
  } catch (error) {
    throwServiceError(error, "Failed to load admin dashboard overview.");
  }
}

/**
 * Loads recent users sorted by the backend (created_at DESC), limited client-side.
 * @param {{ limit?: number }} options
 */
export async function fetchRecentUsers({ limit = 5 } = {}) {
  try {
    const response = await api.get("/users");
    const rows = extractList(response);
    const normalizedLimit = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 5;

    return rows.slice(0, normalizedLimit).map(mapRecentUser);
  } catch (error) {
    throwServiceError(error, "Failed to load recent users.");
  }
}

/**
 * Loads weekly system activity for the admin analytics chart.
 * @param {{ weekOffset?: number }} options
 */
export async function fetchWeeklySystemActivity({ weekOffset = 0 } = {}) {
  const normalizedOffset = clampWeekOffset(weekOffset);

  try {
    const response = await api.get("/dashboard/admin/weekly-system-activity", {
      params: { week_offset: normalizedOffset },
    });

    return mapWeeklySystemActivity(extractData(response), normalizedOffset);
  } catch (error) {
    throwServiceError(error, "Failed to load system activity.");
  }
}
