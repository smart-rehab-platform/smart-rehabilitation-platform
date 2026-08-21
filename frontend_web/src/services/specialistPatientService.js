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

function extractMap(response) {
  const data = extractData(response);
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
  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

export async function loadSpecialistPatients(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");
  try {
    const response = await api.get(`/specialists/${encodeURIComponent(id)}/patients`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patients.");
  }
}

export async function getPatientById(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throwServiceError(error, "Failed to load patient.");
  }
}

export async function getPatientDiagnoses(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/diagnoses`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load diagnoses.");
  }
}

export async function getPatientImprovementPercentage(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/improvement-percentage`);
    return extractMap(response);
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throwServiceError(error, "Failed to load improvement percentage.");
  }
}

export async function getPatientTreatmentPlans(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/treatment-plans/patient/${encodeURIComponent(id)}`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load treatment plans.");
  }
}

export async function getTreatmentPlanGoals(planId) {
  const id = requireId(planId, "Treatment plan id");
  try {
    const response = await api.get(`/goals/treatment-plans/${encodeURIComponent(id)}/goals`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load goals.");
  }
}

export async function getGoalProgress(goalId) {
  const id = requireId(goalId, "Goal id");
  try {
    const response = await api.get(`/goals/goals/${encodeURIComponent(id)}/progress`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load goal progress.");
  }
}

export async function createTreatmentPlanGoal(planId, payload) {
  const id = requireId(planId, "Treatment plan id");
  const title = typeof payload?.title === "string" ? payload.title.trim() : "";
  if (!title) {
    throw new Error("Goal title is required.");
  }

  try {
    const response = await api.post(
      `/goals/treatment-plans/${encodeURIComponent(id)}/goals`,
      payload,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to create goal.");
  }
}

export async function updateGoal(goalId, payload) {
  const id = requireId(goalId, "Goal id");
  try {
    const response = await api.put(
      `/goals/goals/${encodeURIComponent(id)}`,
      payload,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update goal.");
  }
}

export async function createGoalProgress(goalId, payload) {
  const id = requireId(goalId, "Goal id");
  try {
    const response = await api.post(
      `/goals/goals/${encodeURIComponent(id)}/progress`,
      payload,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to update goal progress.");
  }
}

export async function achieveGoal(goalId) {
  const id = requireId(goalId, "Goal id");
  try {
    await api.patch(`/goals/goals/${encodeURIComponent(id)}/achieve`);
  } catch (error) {
    throwServiceError(error, "Failed to mark goal as achieved.");
  }
}

export async function getPatientAssignedExercises(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/assigned-exercises`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load assigned exercises.");
  }
}

export async function getPatientSubmissions(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/submissions`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load submissions.");
  }
}

export async function getSubmissionMedia(submissionId) {
  const id = requireId(submissionId, "Submission id");
  try {
    const response = await api.get(`/exercise-submissions/${encodeURIComponent(id)}/media`);
    return extractList(response);
  } catch {
    return [];
  }
}

export async function getPatientReports(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/reports`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load reports.");
  }
}

export async function getPatientNotes(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/notes`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load specialist notes.");
  }
}

export async function createPatientNote(patientId, note) {
  const id = requireId(patientId, "Patient id");
  const trimmed = typeof note === "string" ? note.trim() : "";
  if (!trimmed) {
    throw new Error("Note is required.");
  }
  try {
    const response = await api.post(`/patients/${encodeURIComponent(id)}/notes`, { note: trimmed });
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to save specialist note.");
  }
}

export async function createPatientDiagnosis(patientId, payload) {
  const id = requireId(patientId, "Patient id");
  const diagnosisTitle =
    typeof payload?.diagnosis_title === "string" ? payload.diagnosis_title.trim() : "";
  if (!diagnosisTitle) {
    throw new Error("Diagnosis title is required.");
  }

  const body = {
    diagnosis_title: diagnosisTitle,
  };

  if (typeof payload?.description === "string" && payload.description.trim()) {
    body.description = payload.description.trim();
  }

  if (typeof payload?.diagnosed_at === "string" && payload.diagnosed_at.trim()) {
    body.diagnosed_at = payload.diagnosed_at.trim();
  }

  try {
    const response = await api.post(
      `/patients/${encodeURIComponent(id)}/diagnoses`,
      body,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to save diagnosis.");
  }
}

export async function getPatientGuardians(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/guardians`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load guardians.");
  }
}

export async function getPatientFamilyPatterns(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/family-patterns`);
    return extractMap(response);
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throwServiceError(error, "Failed to load family pattern insight.");
  }
}

export async function getPatientFamilyPatternDetails(patientId) {
  const id = requireId(patientId, "Patient id");
  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/family-patterns/details`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load family pattern details.");
  }
}

export async function createSpecialistConversation({ patientId, parentId, specialistId }) {
  try {
    const response = await api.post("/conversations", {
      patient_id: requireId(patientId, "Patient id"),
      parent_id: requireId(parentId, "Parent id"),
      specialist_id: requireId(specialistId, "Specialist id"),
    });
    const map = extractMap(response);
    if (!map?.id) {
      throw new Error("Invalid conversation response.");
    }
    return map;
  } catch (error) {
    throwServiceError(error, "Failed to open conversation.");
  }
}

export async function loadSpecialistPatientDetailsBundle(patientId) {
  const id = requireId(patientId, "Patient id");

  const [
    patientMap,
    diagnosisRows,
    improvementMap,
    treatmentPlanRows,
    assignedExerciseRows,
    submissionRows,
    reportRows,
    noteRows,
  ] = await Promise.all([
    getPatientById(id),
    getPatientDiagnoses(id),
    getPatientImprovementPercentage(id),
    getPatientTreatmentPlans(id),
    getPatientAssignedExercises(id),
    getPatientSubmissions(id),
    getPatientReports(id),
    getPatientNotes(id),
  ]);

  if (!patientMap) {
    throw new Error("Patient not found.");
  }

  return {
    patientMap,
    diagnosisRows,
    improvementMap,
    treatmentPlanRows,
    assignedExerciseRows,
    submissionRows,
    reportRows,
    noteRows,
  };
}
