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

export async function fetchPatientSpecialists(patientId) {
  try {
    const response = await api.get(`/patients/${encodeURIComponent(patientId)}/specialists`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load assigned specialists.");
  }
}

export async function fetchPatientGuardians(patientId) {
  try {
    const response = await api.get(`/patients/${encodeURIComponent(patientId)}/guardians`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load linked parents.");
  }
}

export async function assignPatientSpecialist(patientId, payload) {
  try {
    const response = await api.post(
      `/patients/${encodeURIComponent(patientId)}/specialists`,
      payload,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to assign specialist.");
  }
}

export async function linkPatientGuardian(patientId, payload) {
  try {
    const response = await api.post(
      `/patients/${encodeURIComponent(patientId)}/guardians`,
      payload,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to link parent.");
  }
}

export async function unlinkPatientSpecialist(patientId, specialistId) {
  try {
    const response = await api.delete(
      `/patients/${encodeURIComponent(patientId)}/specialists/${encodeURIComponent(specialistId)}`,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to unlink specialist.");
  }
}

export async function unlinkPatientGuardian(patientId, guardianId) {
  try {
    const response = await api.delete(
      `/patients/${encodeURIComponent(patientId)}/guardians/${encodeURIComponent(guardianId)}`,
    );
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to unlink parent.");
  }
}
