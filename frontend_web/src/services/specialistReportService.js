import api from "./api";
import {
  AI_REPORT_TYPES,
  buildAiReportGeneratePayload,
  resolveAiReportGeneratePath,
} from "../features/specialist-dashboard/utils/specialistAiReportGeneration";
import { buildRegularReportCreatePayload } from "../features/specialist-dashboard/utils/specialistRegularReportCreation";
import {
  buildPatientNameMap,
  mapAiReportDetail,
  mapAiReportRow,
  mapRegularReportDetail,
  mapRegularReportRow,
  sortReportsNewestFirst,
} from "../features/specialist-dashboard/utils/specialistReportMappers";
import { loadSpecialistPatients } from "./specialistPatientService";

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
  const apiMessage = error?.response?.status === 404
    ? null
    : error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

async function fetchRegularReports() {
  const response = await api.get("/reports");
  return extractList(response);
}

async function fetchAiReports() {
  try {
    const response = await api.get("/ai/reports");
    return extractList(response);
  } catch {
    return [];
  }
}

async function fetchPatientRegularReports(patientId) {
  const response = await api.get(`/patients/${encodeURIComponent(patientId)}/reports`);
  return extractList(response);
}

async function fetchPatientAiReports(patientId) {
  try {
    const response = await api.get(`/patients/${encodeURIComponent(patientId)}/ai-reports`);
    return extractList(response);
  } catch {
    try {
      const aiRows = await fetchAiReports();
      return aiRows.filter((row) => {
        const rowPatientId = String(row?.patient_id || row?.patientId || "").trim();
        return rowPatientId === patientId;
      });
    } catch {
      return [];
    }
  }
}

export async function loadAssignedPatientContext(specialistUserId) {
  const rows = await loadSpecialistPatients(specialistUserId);
  const assignedIds = new Set(
    rows.map((row) => String(row?.id || row?._id || row?.patient_id || row?.patientId || "").trim())
      .filter(Boolean),
  );
  const patientNameMap = buildPatientNameMap(rows);
  return { assignedIds, patientNameMap, patientRows: rows };
}

export async function loadSpecialistScopedReports(specialistUserId) {
  const id = requireId(specialistUserId, "Specialist user id");
  const { assignedIds, patientNameMap } = await loadAssignedPatientContext(id);

  const [regularRows, aiRows] = await Promise.all([
    fetchRegularReports(),
    fetchAiReports(),
  ]);

  const regular = regularRows
    .map((row) => mapRegularReportRow(row, patientNameMap))
    .filter(Boolean)
    .filter((report) => assignedIds.has(report.patientId));

  const ai = aiRows
    .map((row) => mapAiReportRow(row, patientNameMap))
    .filter(Boolean)
    .filter((report) => assignedIds.has(report.patientId));

  return sortReportsNewestFirst([...regular, ...ai]);
}

export async function loadPatientScopedReports(specialistUserId, patientId) {
  const specialist = requireId(specialistUserId, "Specialist user id");
  const scopedPatientId = requireId(patientId, "Patient id");
  const { assignedIds, patientNameMap } = await loadAssignedPatientContext(specialist);

  if (!assignedIds.has(scopedPatientId)) {
    throw new Error("Patient not found or not assigned to you.");
  }

  const patientName = patientNameMap.get(scopedPatientId) || "Patient";

  const [regularRows, aiRows] = await Promise.all([
    fetchPatientRegularReports(scopedPatientId),
    fetchPatientAiReports(scopedPatientId),
  ]);

  const regular = regularRows
    .map((row) => mapRegularReportRow({ ...row, patient_name: row.patient_name || patientName }, patientNameMap))
    .filter(Boolean);

  const ai = aiRows
    .map((row) => mapAiReportRow({ ...row, patient_name: row.patient_name || patientName }, patientNameMap))
    .filter(Boolean);

  return sortReportsNewestFirst([...regular, ...ai]);
}

export async function loadReportDetail(reportId, isAiReport) {
  const id = requireId(reportId, "Report id");
  try {
    const path = isAiReport
      ? `/ai/reports/${encodeURIComponent(id)}`
      : `/reports/${encodeURIComponent(id)}`;
    const response = await api.get(path);
    const row = extractMap(response);
    if (!row) {
      throw new Error(isAiReport ? "AI report not found." : "Report not found.");
    }
    return isAiReport ? mapAiReportDetail(row) : mapRegularReportDetail(row);
  } catch (error) {
    if (error?.response?.status === 404) {
      const notFound = new Error(isAiReport ? "AI report not found." : "Report not found.");
      notFound.cause = error;
      throw notFound;
    }
    throwServiceError(error, "Failed to load report.");
  }
}

async function postGenerateAiReport({ reportType, patientId, periodStart, periodEnd, language }) {
  const path = resolveAiReportGeneratePath(reportType);
  if (!path) {
    throw new Error("Report type must be weekly or monthly.");
  }

  const { reportType: _reportType, ...body } = buildAiReportGeneratePayload({
    patientId,
    reportType,
    periodStart,
    periodEnd,
    language,
  });

  try {
    const response = await api.post(path, body);
    const row = extractMap(response);
    if (!row) {
      throw new Error("Invalid AI report generation response.");
    }
    return mapAiReportDetail(row) ?? mapAiReportRow(row);
  } catch (error) {
    throwServiceError(error, "Failed to generate AI report.");
  }
}

export async function generateAiWeeklyReport({ patientId, periodStart, periodEnd, language }) {
  return postGenerateAiReport({
    reportType: AI_REPORT_TYPES.WEEKLY,
    patientId,
    periodStart,
    periodEnd,
    language,
  });
}

export async function generateAiMonthlyReport({ patientId, periodStart, periodEnd, language }) {
  return postGenerateAiReport({
    reportType: AI_REPORT_TYPES.MONTHLY,
    patientId,
    periodStart,
    periodEnd,
    language,
  });
}

export async function generateAiReport({ reportType, patientId, periodStart, periodEnd, language }) {
  if (reportType === AI_REPORT_TYPES.MONTHLY) {
    return generateAiMonthlyReport({ patientId, periodStart, periodEnd, language });
  }
  return generateAiWeeklyReport({ patientId, periodStart, periodEnd, language });
}

/** Creates a regular report via POST /reports. Does not generate PDF or run AI. */
export async function createRegularReport({ patientId, reportType, title, summary }) {
  const body = buildRegularReportCreatePayload({
    patientId,
    reportType,
    title,
    summary,
  });

  try {
    const response = await api.post("/reports", body);
    const row = extractMap(response);
    if (!row) {
      throw new Error("Invalid report creation response.");
    }
    return mapRegularReportDetail(row) ?? mapRegularReportRow(row);
  } catch (error) {
    throwServiceError(error, "Failed to create report.");
  }
}

export async function exportReportPdf(reportId, isAiReport) {
  const id = requireId(reportId, "Report id");
  try {
    const path = isAiReport
      ? `/ai/reports/${encodeURIComponent(id)}/export-pdf`
      : `/reports/${encodeURIComponent(id)}/export-pdf`;
    const response = await api.post(path);
    const envelope = extractMap(response);
    const reportMap = envelope?.report && typeof envelope.report === "object"
      ? envelope.report
      : envelope;
    if (reportMap) {
      return isAiReport ? mapAiReportDetail(reportMap) : mapRegularReportDetail(reportMap);
    }
    return loadReportDetail(id, isAiReport);
  } catch (error) {
    throwServiceError(error, "Failed to generate PDF.");
  }
}

/** Discard an AI report awaiting specialist review (DELETE /ai/reports/:id). */
export async function discardAiReport(reportId) {
  const id = requireId(reportId, "Report id");
  try {
    const response = await api.delete(`/ai/reports/${encodeURIComponent(id)}`);
    const data = extractMap(response);
    return data?.id || id;
  } catch (error) {
    throwServiceError(error, "Failed to discard AI report.");
  }
}
