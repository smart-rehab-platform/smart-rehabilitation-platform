import api from "./api";
import { getPatientById } from "./specialistPatientService";
import {
  mapSpeechAnalysisItem,
  mapSpeechProgressPoint,
  mergeSpeechAnalyses,
  resolvePatientName,
} from "../features/specialist-dashboard/utils/specialistSpeechAnalysisMappers";

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

export function friendlySpeechAnalysisError(error, action = "load") {
  const status = error?.response?.status;
  const data = error?.response?.data;
  let apiMessage = null;
  if (data && typeof data === "object") {
    const message = data.message ?? data.error;
    if (typeof message === "string" && message.trim()) {
      apiMessage = message.trim();
    }
  }
  const lowerApi = (apiMessage || "").toLowerCase();

  if (status == null && !(error instanceof Error)) {
    return action === "analyze"
      ? "Speech analysis could not be completed. Please try again."
      : "Failed to load speech analysis. Please try again.";
  }

  if (status === 401) {
    return "Please sign in to continue.";
  }
  if (status === 403) {
    return "You do not have permission to analyze this submission.";
  }
  if (status === 404) {
    if (lowerApi.includes("analysis") && !lowerApi.includes("submission not found")) {
      return "No speech analysis is available for this submission yet.";
    }
    return "The exercise submission could not be found.";
  }
  if (status === 400 || status === 422) {
    if (
      lowerApi.includes("audio") ||
      lowerApi.includes("recording") ||
      lowerApi.includes("media") ||
      lowerApi.includes("external")
    ) {
      return "This submission does not contain a supported audio recording.";
    }
    if (apiMessage && !apiMessage.includes("AxiosError")) {
      return apiMessage;
    }
    return "This submission does not contain a supported audio recording.";
  }
  if (status === 502 || status === 503 || status === 504) {
    return "The speech analysis service is currently unavailable. Please try again.";
  }

  const code = error?.code;
  const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";
  if (
    code === "ECONNABORTED" ||
    code === "ERR_NETWORK" ||
    message.includes("timeout") ||
    message.includes("network error")
  ) {
    return "Unable to connect to the analysis service. Check your connection and try again.";
  }

  if (error instanceof Error && error.message && !error.message.includes("status code")) {
    const raw = error.message.replace(/^Error:\s*/i, "").trim();
    if (
      raw &&
      !raw.includes("AxiosError") &&
      !raw.includes("Network Error") &&
      !raw.toLowerCase().includes("request failed")
    ) {
      return raw;
    }
  }

  return action === "analyze"
    ? "Speech analysis could not be completed. Please try again."
    : "Failed to load speech analysis. Please try again.";
}

async function fetchPatientAnalyses(patientId) {
  const response = await api.get(
    `/speech-analyses/patients/${encodeURIComponent(patientId)}`,
  );
  return extractList(response)
    .map((row) => mapSpeechAnalysisItem(row, { fallbackPatientId: patientId }))
    .filter(Boolean);
}

async function fetchPatientProgress(patientId) {
  const response = await api.get(
    `/speech-analyses/patients/${encodeURIComponent(patientId)}/progress`,
  );
  return extractList(response).map(mapSpeechProgressPoint).filter(Boolean);
}

export async function fetchSubmissionSpeechAnalysis(
  submissionId,
  { patientId = "", patientName = "" } = {},
) {
  const id = requireId(submissionId, "Submission id");
  try {
    const response = await api.get(
      `/speech-analyses/exercise-submissions/${encodeURIComponent(id)}`,
    );
    const map = extractMap(response);
    if (!map) {
      return null;
    }
    return mapSpeechAnalysisItem(map, {
      fallbackPatientId: patientId,
      fallbackPatientName: patientName,
    });
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function analyzeSpeechSubmission(
  submissionId,
  { patientId = "", patientName = "" } = {},
) {
  const id = requireId(submissionId, "Submission id");
  try {
    const response = await api.post(
      "/speech-analyses/analyze",
      { submission_id: id },
      { timeout: 120000 },
    );
    const map = extractMap(response);
    if (!map) {
      throw new Error("Invalid speech analysis response");
    }
    return mapSpeechAnalysisItem(map, {
      fallbackPatientId: patientId,
      fallbackPatientName: patientName,
    });
  } catch (error) {
    throw new Error(friendlySpeechAnalysisError(error, "analyze"), { cause: error });
  }
}

export async function loadSpecialistSpeechAnalysisBundle(patientId, submissionId = null) {
  const scopedPatientId = requireId(patientId, "Patient id");
  const scopedSubmissionId =
    typeof submissionId === "string" && submissionId.trim()
      ? submissionId.trim()
      : null;

  try {
    const [analyses, progressItems, patientRow, submissionAnalysis] = await Promise.all([
      fetchPatientAnalyses(scopedPatientId),
      fetchPatientProgress(scopedPatientId),
      getPatientById(scopedPatientId),
      scopedSubmissionId
        ? fetchSubmissionSpeechAnalysis(scopedSubmissionId, {
            patientId: scopedPatientId,
          })
        : Promise.resolve(null),
    ]);

    if (!patientRow) {
      throw new Error("Patient not found.");
    }

    const patientName = resolvePatientName(patientRow);
    const mergedAnalyses = mergeSpeechAnalyses(analyses, submissionAnalysis);
    const latestAnalysis = mergedAnalyses[0] || null;

    let selectedAnalysis = null;
    if (scopedSubmissionId) {
      selectedAnalysis =
        mergedAnalyses.find((item) => item.submissionId === scopedSubmissionId) ||
        submissionAnalysis;
    }
    selectedAnalysis = selectedAnalysis || latestAnalysis;

    return {
      patientId: scopedPatientId,
      submissionId: scopedSubmissionId,
      patientName,
      analyses: mergedAnalyses,
      latestAnalysis,
      progressItems,
      selectedAnalysis,
      submissionAnalysis,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Patient not found.") {
      throw error;
    }
    throw new Error(friendlySpeechAnalysisError(error, "load"), { cause: error });
  }
}

export async function refreshSpeechAnalysisLists(patientId, extraAnalysis = null) {
  const scopedPatientId = requireId(patientId, "Patient id");
  const [analyses, progressItems] = await Promise.all([
    fetchPatientAnalyses(scopedPatientId),
    fetchPatientProgress(scopedPatientId),
  ]);
  const mergedAnalyses = mergeSpeechAnalyses(analyses, extraAnalysis);
  return {
    analyses: mergedAnalyses,
    progressItems,
    latestAnalysis: mergedAnalyses[0] || extraAnalysis || null,
  };
}
