import api from "./api";
import { getPatientById, loadSpecialistPatients } from "./specialistPatientService";
import {
  buildEditTreatmentPlanBundle,
  mapPatientPickerItem,
  mapTreatmentPlanList,
} from "../features/specialist-dashboard/utils/specialistTreatmentPlanMappers";
import { mapPatientProfile } from "../features/specialist-dashboard/utils/specialistPatientMappers";

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
    throw new Error("Patient or treatment plan not found.");
  }
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

function buildPatientNameMap(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const item = mapPatientPickerItem(row);
    if (item) {
      map.set(item.id, item.name);
    }
  });
  return map;
}

async function loadAssignedPatientContext(specialistUserId) {
  const rows = await loadSpecialistPatients(specialistUserId);
  const assignedIds = new Set(
    rows.map((row) => String(row?.id || row?._id || "").trim()).filter(Boolean),
  );
  const patientNameMap = buildPatientNameMap(rows);
  const patients = rows.map(mapPatientPickerItem).filter(Boolean);
  return { assignedIds, patientNameMap, patients };
}

async function fetchAllTreatmentPlans() {
  const response = await api.get("/treatment-plans");
  return extractList(response);
}

export async function loadSpecialistScopedTreatmentPlans(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");
  const { assignedIds, patientNameMap } = await loadAssignedPatientContext(id);
  const rows = await fetchAllTreatmentPlans();
  return mapTreatmentPlanList(rows, {
    patientNameMap,
    specialistUserId: id,
    assignedIds,
  });
}

export async function loadSpecialistAssignedPatients(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");
  const { patients } = await loadAssignedPatientContext(id);
  return patients;
}

export async function fetchTreatmentPlanById(planId) {
  const id = requireId(planId, "Treatment plan id");
  try {
    const response = await api.get(`/treatment-plans/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throwServiceError(error, "Failed to load treatment plan.");
  }
}

export async function fetchTreatmentPlanGoals(planId) {
  const id = requireId(planId, "Treatment plan id");
  try {
    const response = await api.get(`/goals/treatment-plans/${encodeURIComponent(id)}/goals`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load goals.");
  }
}

export async function fetchGoalProgress(goalId) {
  const id = requireId(goalId, "Goal id");
  try {
    const response = await api.get(`/goals/goals/${encodeURIComponent(id)}/progress`);
    return extractList(response);
  } catch {
    return [];
  }
}

export async function loadEditTreatmentPlanBundle(specialistUserId, planId) {
  const specialist = requireId(specialistUserId, "Specialist user id");
  const id = requireId(planId, "Treatment plan id");
  const { assignedIds } = await loadAssignedPatientContext(specialist);

  const planRow = await fetchTreatmentPlanById(id);
  if (!planRow) {
    return { bundle: null, unauthorized: false };
  }

  const patientId = String(planRow.patient_id || planRow.patientId || "").trim();
  const planSpecialistId = String(planRow.specialist_id || planRow.specialistId || "").trim();

  if (!assignedIds.has(patientId)) {
    return { bundle: null, unauthorized: true };
  }

  if (planSpecialistId && planSpecialistId !== specialist) {
    return { bundle: null, unauthorized: true };
  }

  const bundle = await buildEditTreatmentPlanBundle(planRow, {
    getTreatmentPlanGoalsFn: fetchTreatmentPlanGoals,
    getGoalProgressFn: fetchGoalProgress,
  });

  if (bundle && patientId) {
    try {
      const patientRow = await getPatientById(patientId);
      const patient = mapPatientProfile(patientRow);
      if (patient?.profileImageUrl) {
        bundle.patientProfileImageUrl = patient.profileImageUrl;
      }
    } catch {
      // Profile image is optional; initials fallback remains when unavailable.
    }
  }

  return { bundle, unauthorized: false };
}

export async function updateTreatmentPlan(planId, payload) {
  const id = requireId(planId, "Treatment plan id");
  try {
    const response = await api.put(`/treatment-plans/${encodeURIComponent(id)}`, payload);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to save treatment plan. Please try again.");
  }
}

export async function createTreatmentPlan(payload) {
  try {
    const response = await api.post("/treatment-plans", payload);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to create treatment plan. Please try again.");
  }
}

export async function verifyPatientAssignment(specialistUserId, patientId) {
  const specialist = requireId(specialistUserId, "Specialist user id");
  const scopedPatientId = requireId(patientId, "Patient id");
  const { assignedIds } = await loadAssignedPatientContext(specialist);
  return assignedIds.has(scopedPatientId);
}
