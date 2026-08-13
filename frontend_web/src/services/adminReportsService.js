import api from "./api";

function extractData(response) {
  const payload = response?.data;

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload ?? null;
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const message = typeof apiMessage === "string" && apiMessage.trim()
    ? apiMessage.trim()
    : (error instanceof Error && error.message
      ? error.message
      : fallbackMessage);

  const serviceError = new Error(message);
  if (error?.response?.status) {
    serviceError.status = error.response.status;
  }
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    serviceError.code = apiMessage.trim();
  }
  throw serviceError;
}

function requireId(value, label) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id) {
    throw new Error(`${label} is required.`);
  }
  return id;
}

function requireAiFlag(isAiReport) {
  if (typeof isAiReport !== "boolean") {
    throw new Error("Report source (isAiReport) is required.");
  }
  return isAiReport;
}

function extractListRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

/**
 * GET /reports
 * @returns {Promise<object[]>}
 */
export async function loadAdminRegularReports() {
  try {
    const response = await api.get("/reports");
    return extractListRows(extractData(response));
  } catch (error) {
    throwServiceError(error, "Failed to load reports.");
  }
}

/**
 * GET /ai/reports
 * @returns {Promise<object[]>}
 */
export async function loadAdminAiReports() {
  try {
    const response = await api.get("/ai/reports");
    return extractListRows(extractData(response));
  } catch (error) {
    throwServiceError(error, "Failed to load AI reports.");
  }
}

/**
 * GET /reports/:id or GET /ai/reports/:id
 * @param {string} reportId
 * @param {boolean} isAiReport
 */
export async function loadAdminReportDetails(reportId, isAiReport) {
  const id = requireId(reportId, "Report id");
  const ai = requireAiFlag(isAiReport);
  const path = ai ? `/ai/reports/${encodeURIComponent(id)}` : `/reports/${encodeURIComponent(id)}`;

  try {
    const response = await api.get(path);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to load report details.");
  }
}

/**
 * POST /reports/:id/export-pdf or POST /ai/reports/:id/export-pdf
 * Returns backend `data` envelope: `{ report, pdf_url }`.
 * @param {string} reportId
 * @param {boolean} isAiReport
 */
export async function exportAdminReportPdf(reportId, isAiReport) {
  const id = requireId(reportId, "Report id");
  const ai = requireAiFlag(isAiReport);
  const path = ai
    ? `/ai/reports/${encodeURIComponent(id)}/export-pdf`
    : `/reports/${encodeURIComponent(id)}/export-pdf`;

  try {
    const response = await api.post(path);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to export report PDF.");
  }
}
