import api from "./api";
import {
  getPatientById,
  getPatientTreatmentPlans,
  loadSpecialistPatients,
} from "./specialistPatientService";
import {
  getRecommendationTypeApiValue,
  mapAiRecommendationsBundle,
  mapAiRecommendationList,
} from "../features/specialist-dashboard/utils/specialistAiRecommendationMappers";

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
  if (status === 403) {
    throw new Error("You do not have access to this patient.");
  }
  if (status === 404) {
    throw new Error("Patient not found.");
  }
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

async function assertAssignedPatient(specialistUserId, patientId) {
  const id = requireId(specialistUserId, "Specialist user id");
  const assignedRows = await loadSpecialistPatients(id);
  const assignedIds = new Set(
    assignedRows.map((row) => String(row?.id || row?._id || "").trim()).filter(Boolean),
  );
  if (!assignedIds.has(patientId)) {
    throw new Error("Patient not found or not assigned to you.");
  }
}

export async function loadSpecialistAiRecommendationsBundle(specialistUserId, patientId) {
  const scopedPatientId = requireId(patientId, "Patient id");
  await assertAssignedPatient(specialistUserId, scopedPatientId);

  try {
    const patientRow = await getPatientById(scopedPatientId);
    if (!patientRow) {
      throw new Error("Patient not found.");
    }

    const [planRows, recommendationResponse] = await Promise.all([
      getPatientTreatmentPlans(scopedPatientId),
      api.get(`/ai/recommendations/patient/${encodeURIComponent(scopedPatientId)}`),
    ]);

    return mapAiRecommendationsBundle({
      patientId: scopedPatientId,
      patientRow,
      planRows,
      recommendationRows: extractList(recommendationResponse),
    });
  } catch (error) {
    throwServiceError(error, "Failed to load AI recommendations.");
  }
}

export async function generateSpecialistAiRecommendation({
  specialistUserId,
  patientId,
  typeId,
  relatedPlanId = null,
}) {
  const scopedPatientId = requireId(patientId, "Patient id");
  await assertAssignedPatient(specialistUserId, scopedPatientId);

  const payload = {
    patient_id: scopedPatientId,
    type: getRecommendationTypeApiValue(typeId),
  };
  if (relatedPlanId) {
    payload.related_plan_id = relatedPlanId;
  }

  try {
    await api.post("/ai/recommendations/generate", payload);
  } catch (error) {
    throwServiceError(error, "Failed to generate recommendation.");
  }
}

export async function acceptSpecialistAiRecommendation(specialistUserId, patientId, recommendationId) {
  const id = requireId(recommendationId, "Recommendation id");
  await assertAssignedPatient(specialistUserId, patientId);

  try {
    const response = await api.patch(`/ai/recommendations/${encodeURIComponent(id)}/accept`);
    const row = extractMap(response);
    return row ? mapAiRecommendationList([row])[0] ?? null : null;
  } catch (error) {
    throwServiceError(error, "Failed to accept recommendation.");
  }
}

export async function rejectSpecialistAiRecommendation(specialistUserId, patientId, recommendationId) {
  const id = requireId(recommendationId, "Recommendation id");
  await assertAssignedPatient(specialistUserId, patientId);

  try {
    const response = await api.patch(`/ai/recommendations/${encodeURIComponent(id)}/reject`);
    const row = extractMap(response);
    return row ? mapAiRecommendationList([row])[0] ?? null : null;
  } catch (error) {
    throwServiceError(error, "Failed to reject recommendation.");
  }
}
