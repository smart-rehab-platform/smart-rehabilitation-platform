import { formatAdminDateLabel } from "./adminCaseRequestsMappers";

const EMPTY_AI_CENTER = {
  speechTotal: 0,
  speechAverageScore: 0,
  recommendationsTotal: 0,
  reportsTotal: 0,
  pendingRecommendations: 0,
  patientsNeedingAttention: [],
  latestSpeechAnalyses: [],
  latestRecommendations: [],
  latestReports: [],
};

function readInt(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readString(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function readId(value) {
  return readString(value);
}

function mapList(value, mapper) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapper).filter(Boolean);
}

export function formatSpeechScoreValue(value) {
  const numeric = readNumber(value);
  if (numeric == null) {
    return "—";
  }

  return numeric.toFixed(2);
}

export function formatRecommendationTypeLabel(value) {
  const normalized = readString(value)?.toLowerCase();

  switch (normalized) {
    case "exercise_suggestion":
      return "Exercise suggestion";
    case "plan_adjustment":
      return "Plan adjustment";
    default:
      return readString(value) ?? "Recommendation";
  }
}

export function formatRecommendationStatusLabel(value) {
  const normalized = readString(value)?.toLowerCase();

  switch (normalized) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "approved":
      return "Approved";
    case "completed":
      return "Completed";
    default:
      return readString(value) ?? "Pending";
  }
}

export function getRecommendationStatusTone(value) {
  const normalized = readString(value)?.toLowerCase();

  switch (normalized) {
    case "accepted":
    case "approved":
    case "completed":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
}

export function formatReportTypeLabel(value) {
  const normalized = readString(value)?.toLowerCase();

  switch (normalized) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    default:
      return readString(value) ?? "Report";
  }
}

function mapPatientNeedingAttention(patient) {
  if (!patient || typeof patient !== "object") {
    return null;
  }

  const id = readId(patient.id ?? patient.patient_id ?? patient.patientId);
  if (!id) {
    return null;
  }

  return {
    id,
    fullName: readString(patient.full_name ?? patient.fullName) ?? "Patient",
  };
}

function mapLatestSpeechAnalysis(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const patientId = readId(record.patient_id ?? record.patientId);
  if (!patientId) {
    return null;
  }

  const analyzedAtLabel = formatAdminDateLabel(record.analyzed_at ?? record.analyzedAt) ?? "Recently";

  return {
    id: readId(record.id),
    patientId,
    patientName: readString(record.patient_name ?? record.patientName) ?? "Patient",
    analyzedAtLabel,
    detailLabel: analyzedAtLabel,
  };
}

function mapLatestRecommendation(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const patientId = readId(record.patient_id ?? record.patientId);
  if (!patientId) {
    return null;
  }

  const typeLabel = formatRecommendationTypeLabel(record.type);
  const status = readString(record.status) ?? "pending";
  const statusLabel = formatRecommendationStatusLabel(status);

  return {
    id: readId(record.id),
    patientId,
    patientName: readString(record.patient_name ?? record.patientName) ?? "Patient",
    typeLabel,
    status,
    statusLabel,
    statusTone: getRecommendationStatusTone(status),
    detailLabel: typeLabel,
  };
}

function mapLatestReport(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const patientId = readId(record.patient_id ?? record.patientId);
  const typeLabel = formatReportTypeLabel(record.type);
  const generatedAtLabel = formatAdminDateLabel(record.generated_at ?? record.generatedAt) ?? "Recently";

  return {
    id: readId(record.id),
    patientId,
    patientName: readString(record.patient_name ?? record.patientName) ?? "Patient",
    typeLabel,
    generatedAtLabel,
    detailLabel: `${typeLabel} • ${generatedAtLabel}`,
  };
}

export function mapAdminAiCenter(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_AI_CENTER };
  }

  const speech = raw.speech && typeof raw.speech === "object" ? raw.speech : {};
  const recommendations = raw.recommendations && typeof raw.recommendations === "object"
    ? raw.recommendations
    : {};
  const reports = raw.reports && typeof raw.reports === "object" ? raw.reports : {};
  const usageStatistics = raw.usage_statistics && typeof raw.usage_statistics === "object"
    ? raw.usage_statistics
    : {};

  return {
    speechTotal: readInt(speech.total) ?? 0,
    speechAverageScore: readNumber(speech.average_score ?? speech.averageScore) ?? 0,
    recommendationsTotal: readInt(recommendations.total) ?? 0,
    reportsTotal: readInt(reports.total) ?? 0,
    pendingRecommendations: readInt(usageStatistics.pending_recommendations) ?? 0,
    patientsNeedingAttention: mapList(raw.patients_needing_attention, mapPatientNeedingAttention),
    latestSpeechAnalyses: mapList(speech.latest, mapLatestSpeechAnalysis),
    latestRecommendations: mapList(recommendations.latest, mapLatestRecommendation),
    latestReports: mapList(reports.latest, mapLatestReport),
  };
}
