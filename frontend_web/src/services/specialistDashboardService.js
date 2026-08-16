import api from "./api";
import { buildSpecialistOverviewKpis } from "../features/specialist-dashboard/utils/specialistDashboardMappers";
import {
  buildSpecialistPatientProgressList,
  mapPendingReviewPreview,
} from "../features/specialist-dashboard/utils/specialistPreviewMappers";
import { mapSpecialistSessionRows } from "../features/specialist-dashboard/utils/specialistScheduleUtils";

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

async function fetchSpecialistSessions(specialistUserId) {
  const response = await api.get(
    `/specialists/${encodeURIComponent(specialistUserId)}/sessions`,
  );
  return extractList(response);
}

async function fetchSpecialistPendingReviews(specialistUserId) {
  const response = await api.get(
    `/specialists/${encodeURIComponent(specialistUserId)}/pending-reviews`,
  );
  return extractList(response);
}

export async function fetchSpecialistPendingReviewRows(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");
  return fetchSpecialistPendingReviews(id);
}

async function fetchSpecialistPatients(specialistUserId) {
  const response = await api.get(
    `/specialists/${encodeURIComponent(specialistUserId)}/patients`,
  );
  return extractList(response);
}

async function fetchProgressSnapshots() {
  const response = await api.get("/progress-snapshots");
  return extractList(response);
}

/**
 * Loads Specialist dashboard KPI counts for the authenticated specialist.
 * Mirrors Flutter specialist_dashboard_repository aggregation.
 * @param {string} specialistUserId Authenticated specialist user id
 */
export async function loadSpecialistDashboardOverview(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");

  try {
    const [activeCasesResponse, pendingReviewsResponse, sessions, treatmentPlansResponse] =
      await Promise.all([
        api.get("/dashboard/specialist/active-cases"),
        api.get(`/specialists/${encodeURIComponent(id)}/pending-reviews`),
        fetchSpecialistSessions(id),
        api.get("/treatment-plans"),
      ]);

    return buildSpecialistOverviewKpis({
      specialistUserId: id,
      activeCases: extractList(activeCasesResponse),
      pendingReviews: extractList(pendingReviewsResponse),
      sessions,
      treatmentPlans: extractList(treatmentPlansResponse),
    });
  } catch (error) {
    throwServiceError(error, "Failed to load specialist dashboard overview.");
  }
}

/**
 * Loads scheduled specialist sessions for the weekly schedule card.
 * @param {string} specialistUserId Authenticated specialist user id
 */
export async function loadSpecialistScheduleSessions(specialistUserId, context = {}) {
  const id = requireId(specialistUserId, "Specialist user id");
  const locale = context.locale === "ar" ? "ar" : "en";

  try {
    const rows = await fetchSpecialistSessions(id);
    return mapSpecialistSessionRows(rows, locale);
  } catch (error) {
    throwServiceError(error, "Failed to load specialist schedule.");
  }
}

/**
 * Loads pending review preview rows for the authenticated specialist.
 * @param {string} specialistUserId
 */
export async function loadSpecialistPendingReviews(specialistUserId, context = {}) {
  const id = requireId(specialistUserId, "Specialist user id");

  try {
    const rows = await fetchSpecialistPendingReviews(id);
    return mapPendingReviewPreview(rows, { limit: 4, ...context });
  } catch (error) {
    throwServiceError(error, "Failed to load pending reviews.");
  }
}

/**
 * Loads patient progress rows for assigned patients.
 * @param {string} specialistUserId
 * @param {{ limit?: number|null }} [options]
 */
export async function loadSpecialistPatientProgress(specialistUserId, options = {}) {
  const id = requireId(specialistUserId, "Specialist user id");

  try {
    const [patients, snapshots] = await Promise.all([
      fetchSpecialistPatients(id),
      fetchProgressSnapshots(),
    ]);

    return buildSpecialistPatientProgressList(patients, snapshots, options);
  } catch (error) {
    throwServiceError(error, "Failed to load patient progress.");
  }
}

/**
 * Loads recent patient progress preview rows for assigned patients.
 * @param {string} specialistUserId
 */
export async function loadSpecialistRecentProgress(specialistUserId) {
  return loadSpecialistPatientProgress(specialistUserId, { limit: 4 });
}
