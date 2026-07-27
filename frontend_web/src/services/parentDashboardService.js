import api from "./api";

/**
 * Extracts the primary payload from standard API success responses.
 * @param {import('axios').AxiosResponse} response
 * @returns {unknown}
 */
function extractData(response) {
  const payload = response?.data;

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload ?? null;
}

/**
 * @param {import('axios').AxiosResponse} response
 * @returns {Array<Record<string, unknown>>}
 */
function extractList(response) {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {import('axios').AxiosResponse} response
 * @returns {Record<string, unknown>|null}
 */
function extractMap(response) {
  const data = extractData(response);

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }

  return null;
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string}
 */
function requireId(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

/**
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {never}
 */
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
 * Loads parent dashboard overview counts for the authenticated parent.
 * Uses the parent id from the auth token on the backend.
 * @returns {Promise<Record<string, unknown>|null>} Overview object (e.g. children_count).
 */
export async function getOverview() {
  try {
    const response = await api.get("/dashboard/parent/overview");
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load parent dashboard overview.");
  }
}

/**
 * Loads children (patients) linked to a parent user account.
 * @param {string} parentUserId Authenticated parent user id.
 * @returns {Promise<Array<Record<string, unknown>>>} Linked patient records.
 */
export async function getChildren(parentUserId) {
  const id = requireId(parentUserId, "Parent user id");

  try {
    const response = await api.get(`/parents/${encodeURIComponent(id)}/patients`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load linked children.");
  }
}

/**
 * Loads progress snapshots for all children linked to the authenticated parent.
 * @returns {Promise<Array<Record<string, unknown>>>} Children progress rows.
 */
export async function getChildrenProgress() {
  try {
    const response = await api.get("/dashboard/parent/children-progress");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load children progress.");
  }
}

/**
 * Loads active assigned exercises (tasks) across all of the parent's children.
 * @returns {Promise<Array<Record<string, unknown>>>} Assigned exercise/task rows.
 */
export async function getTasks() {
  try {
    const response = await api.get("/dashboard/parent/tasks");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load parent dashboard tasks.");
  }
}

/**
 * Loads reports across all of the parent's children.
 * @returns {Promise<Array<Record<string, unknown>>>} Report rows.
 */
export async function getReports() {
  try {
    const response = await api.get("/dashboard/parent/reports");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load parent dashboard reports.");
  }
}

/**
 * Loads a single report by id.
 * @param {string} reportId
 */
export async function getReportById(reportId) {
  const id = requireId(reportId, "Report id");

  try {
    const response = await api.get(`/reports/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load report details.");
  }
}

/**
 * Loads therapy sessions for a parent user (all linked children).
 * @param {string} parentUserId Authenticated parent user id.
 * @returns {Promise<Array<Record<string, unknown>>>} Session rows.
 */
export async function getSessions(parentUserId) {
  const id = requireId(parentUserId, "Parent user id");

  try {
    const response = await api.get(`/parents/${encodeURIComponent(id)}/sessions`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load parent sessions.");
  }
}

/**
 * Loads specialists assigned to a patient (for session requests).
 * @param {string} patientId
 */
export async function getPatientSpecialists(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/specialists`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient specialists.");
  }
}

/**
 * Loads a single session by id.
 * @param {string} sessionId
 */
export async function getSessionById(sessionId) {
  const id = requireId(sessionId, "Session id");

  try {
    const response = await api.get(`/sessions/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load session details.");
  }
}

/**
 * Creates a parent session request.
 * @param {Record<string, unknown>} body
 */
export async function createSessionRequest(body) {
  try {
    const response = await api.post("/session-requests", body);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to submit session request.");
  }
}

/**
 * Loads the authenticated parent's session requests.
 * @param {{ status?: string }} [options]
 */
export async function getMySessionRequests(options = {}) {
  try {
    const params = options.status ? { status: options.status } : undefined;
    const response = await api.get("/session-requests/mine", { params });
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load session requests.");
  }
}

/**
 * Loads progress snapshots for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Progress snapshot rows.
 */
export async function getPatientProgress(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/progress`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient progress.");
  }
}

/**
 * Loads the latest improvement percentage metrics for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Record<string, unknown>|null>} Improvement percentage payload.
 */
export async function getPatientImprovement(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/improvement-percentage`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient improvement percentage.");
  }
}

/**
 * Loads daily progress snapshots for a single patient.
 * @param {string} patientId Selected child/patient id.
 */
export async function getPatientProgressDaily(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/progress/daily`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load daily progress.");
  }
}

/**
 * Loads weekly progress snapshots for a single patient.
 * @param {string} patientId Selected child/patient id.
 */
export async function getPatientProgressWeekly(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/progress/weekly`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load weekly progress.");
  }
}

/**
 * Loads monthly progress snapshots for a single patient.
 * @param {string} patientId Selected child/patient id.
 */
export async function getPatientProgressMonthly(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/progress/monthly`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load monthly progress.");
  }
}

/**
 * Loads aggregate performance metrics for a single patient.
 * @param {string} patientId Selected child/patient id.
 */
export async function getPatientPerformanceMetrics(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/performance-metrics`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load performance metrics.");
  }
}

/**
 * Loads today's assigned tasks for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Daily task rows.
 */
export async function getPatientDailyTasks(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/daily-tasks`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient daily tasks.");
  }
}

/**
 * Loads weekly assigned tasks for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Weekly task rows.
 */
export async function getPatientWeeklyTasks(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/weekly-tasks`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient weekly tasks.");
  }
}

/**
 * Loads all assigned exercises for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Assigned exercise rows.
 */
export async function getPatientAssignedExercises(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/assigned-exercises`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient assigned exercises.");
  }
}

/**
 * Loads reports for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Report rows.
 */
export async function getPatientReports(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/reports`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient reports.");
  }
}

/**
 * Loads specialist reviews/feedback for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Review rows.
 */
export async function getPatientReviews(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/reviews`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient reviews.");
  }
}

/**
 * Loads a single assigned exercise by id (exercise details).
 * @param {string} assignedExerciseId Assigned exercise id.
 * @returns {Promise<Record<string, unknown>|null>} Assigned exercise row with joined exercise fields.
 */
export async function getAssignedExerciseById(assignedExerciseId) {
  const id = requireId(assignedExerciseId, "Assigned exercise id");

  try {
    const response = await api.get(`/assigned-exercises/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load exercise details.");
  }
}

/**
 * Loads exercise submissions for a single patient.
 * @param {string} patientId Selected child/patient id.
 * @returns {Promise<Array<Record<string, unknown>>>} Submission rows.
 */
export async function getPatientSubmissions(patientId) {
  const id = requireId(patientId, "Patient id");

  try {
    const response = await api.get(`/patients/${encodeURIComponent(id)}/submissions`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load patient submissions.");
  }
}

/**
 * @param {import('axios').AxiosResponse} response
 * @returns {string|null}
 */
function readEntityId(response) {
  const row = extractMap(response);
  if (!row) {
    return null;
  }

  const id = row.id ?? row._id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/**
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {Error}
 */
function mapSubmissionWorkflowError(error, fallbackMessage) {
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;
  const lowerApi = typeof apiMessage === "string" ? apiMessage.toLowerCase() : "";

  if (status === 401) {
    return new Error("Session expired. Please sign in again.");
  }

  if (status === 403) {
    return new Error("Permission denied.");
  }

  if (
    status === 413
    || lowerApi.includes("too large")
    || lowerApi.includes("maximum allowed size")
  ) {
    return new Error("File exceeds 50 MB.");
  }

  if (status === 400 || status === 415) {
    if (
      lowerApi.includes("unsupported")
      || lowerApi.includes("type")
      || lowerApi.includes("allowed")
    ) {
      return new Error("Unsupported file type.");
    }

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return new Error(apiMessage.trim());
    }

    return new Error("Unsupported file type.");
  }

  if (
    error?.code === "ECONNABORTED"
    || (typeof error?.message === "string" && error.message.toLowerCase().includes("timeout"))
  ) {
    return new Error("Network timeout. Please try again.");
  }

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return new Error(apiMessage.trim());
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error(fallbackMessage);
}

/**
 * Creates an exercise submission for an assigned exercise.
 * @param {{ assignedExerciseId: string, parentNotes?: string|null }} payload
 * @returns {Promise<string>} New submission id.
 */
export async function createExerciseSubmission(payload) {
  const assignedExerciseId = requireId(payload?.assignedExerciseId, "Assigned exercise id");
  const body = { assigned_exercise_id: assignedExerciseId };

  if (typeof payload?.parentNotes === "string" && payload.parentNotes.trim()) {
    body.parent_notes = payload.parentNotes.trim();
  }

  try {
    const response = await api.post("/exercise-submissions", body);
    const submissionId = readEntityId(response);

    if (!submissionId) {
      throw new Error("Invalid submission response.");
    }

    return submissionId;
  } catch (error) {
    throw mapSubmissionWorkflowError(error, "Submission failed.");
  }
}

/**
 * Uploads parent submission media (image, video, or audio).
 * @param {File} file Browser file selected by the parent.
 * @returns {Promise<string>} Uploaded file URL.
 */
export async function uploadExerciseSubmissionMedia(file) {
  if (!(file instanceof File)) {
    throw new Error("A file is required for upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/uploads/exercise-submission-media", formData);
    const data = extractMap(response);
    const url = data?.url ?? data?.file_url ?? data?.fileUrl;

    if (typeof url !== "string" || !url.trim()) {
      throw new Error("Upload failed.");
    }

    return url.trim();
  } catch (error) {
    throw mapSubmissionWorkflowError(error, "Upload failed.");
  }
}

/**
 * Attaches uploaded media to an exercise submission.
 * @param {string} submissionId Submission id from createExerciseSubmission.
 * @param {{ mediaType: "image"|"video"|"audio", fileUrl: string, durationSeconds?: number|null }} payload
 */
export async function attachMediaToExerciseSubmission(submissionId, payload) {
  const id = requireId(submissionId, "Submission id");
  const mediaType = payload?.mediaType;
  const fileUrl = typeof payload?.fileUrl === "string" ? payload.fileUrl.trim() : "";

  if (!mediaType || !["image", "video", "audio"].includes(mediaType)) {
    throw new Error("Unsupported file type.");
  }

  if (!fileUrl) {
    throw new Error("Upload failed.");
  }

  const body = {
    media_type: mediaType,
    file_url: fileUrl,
  };

  if (
    payload?.durationSeconds != null
    && Number.isFinite(payload.durationSeconds)
    && payload.durationSeconds >= 0
  ) {
    body.duration_seconds = Math.round(payload.durationSeconds);
  }

  try {
    const response = await api.post(
      `/exercise-submissions/${encodeURIComponent(id)}/media`,
      body,
    );
    return extractMap(response);
  } catch (error) {
    throw mapSubmissionWorkflowError(error, "Submission failed.");
  }
}

/**
 * Loads all notifications for a user.
 * @param {string} userId Authenticated user id.
 * @returns {Promise<Array<Record<string, unknown>>>} Notification rows.
 */
export async function getNotifications(userId) {
  const id = requireId(userId, "User id");

  try {
    const response = await api.get(`/users/${encodeURIComponent(id)}/notifications`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load notifications.");
  }
}

/**
 * Loads unread notifications for a user.
 * @param {string} userId Authenticated user id.
 * @returns {Promise<Array<Record<string, unknown>>>} Unread notification rows.
 */
export async function getUnreadNotifications(userId) {
  const id = requireId(userId, "User id");

  try {
    const response = await api.get(`/users/${encodeURIComponent(id)}/notifications/unread`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load unread notifications.");
  }
}

/**
 * Marks a single notification as read.
 * @param {string} notificationId Notification id.
 */
export async function markNotificationAsRead(notificationId) {
  const id = requireId(notificationId, "Notification id");

  try {
    const response = await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return response.data?.data ?? response.data;
  } catch (error) {
    throwServiceError(error, "Failed to mark notification as read.");
  }
}

/**
 * Marks all notifications as read for the authenticated user.
 * @returns {Promise<Array<Record<string, unknown>>>} Updated notification rows.
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await api.patch("/notifications/read-all");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to mark all notifications as read.");
  }
}

const parentDashboardService = {
  getOverview,
  getChildren,
  getChildrenProgress,
  getTasks,
  getReports,
  getReportById,
  getSessions,
  getPatientSpecialists,
  getSessionById,
  createSessionRequest,
  getMySessionRequests,
  getPatientProgress,
  getPatientImprovement,
  getPatientProgressDaily,
  getPatientProgressWeekly,
  getPatientProgressMonthly,
  getPatientPerformanceMetrics,
  getPatientDailyTasks,
  getPatientWeeklyTasks,
  getPatientAssignedExercises,
  getPatientReports,
  getPatientReviews,
  getPatientSubmissions,
  getAssignedExerciseById,
  createExerciseSubmission,
  uploadExerciseSubmissionMedia,
  attachMediaToExerciseSubmission,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default parentDashboardService;
