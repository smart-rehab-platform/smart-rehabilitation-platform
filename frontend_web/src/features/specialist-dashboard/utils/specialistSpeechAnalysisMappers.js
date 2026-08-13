function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readDouble(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readDateIso(value) {
  if (value == null || value === "") {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function asMap(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const decoded = JSON.parse(raw);
      return asMap(decoded);
    } catch {
      return null;
    }
  }
  return null;
}

function readText(map, keys) {
  if (!map) {
    return null;
  }
  const value = readString(map, keys);
  return value || null;
}

function readRecommendations(map) {
  if (!map || !Array.isArray(map.recommendations)) {
    return [];
  }
  return map.recommendations
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter(Boolean);
}

export function formatSpeechScore(score) {
  if (score == null || !Number.isFinite(score)) {
    return "—";
  }
  if (score <= 1) {
    return `${Math.round(score * 100)}%`;
  }
  if (score === Math.round(score)) {
    return String(Math.round(score));
  }
  return score.toFixed(1);
}

export function formatSpeechScoreDelta(delta) {
  if (delta == null || !Number.isFinite(delta)) {
    return "—";
  }
  const sign = delta > 0 ? "+" : "";
  if (delta === Math.round(delta)) {
    return `${sign}${Math.round(delta)}`;
  }
  return `${sign}${delta.toFixed(1)}`;
}

export function formatSpeechDateTime(iso) {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

export function formatSpeechDateOnly(iso) {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSpeechChartLabel(iso) {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatSubmissionShortId(submissionId) {
  if (!submissionId || typeof submissionId !== "string") {
    return "";
  }
  return submissionId.length > 8 ? submissionId.slice(0, 8) : submissionId;
}

export function speechTrendLabel(trend) {
  switch ((trend || "").toLowerCase()) {
    case "improvement":
      return "Improving";
    case "regression":
      return "Declining";
    case "baseline":
      return "Baseline";
    case "stable":
      return "Stable";
    default:
      return trend || "—";
  }
}

export function speechTrendTone(trend) {
  switch ((trend || "").toLowerCase()) {
    case "improvement":
      return "improving";
    case "regression":
      return "declining";
    case "baseline":
      return "baseline";
    case "stable":
      return "stable";
    default:
      return "stable";
  }
}

function scoreDelta(current, previous) {
  if (current == null || previous == null) {
    return null;
  }
  return Number((current - previous).toFixed(2));
}

function inferTrend(overallChange) {
  if (overallChange == null) {
    return "stable";
  }
  if (overallChange >= 3) {
    return "improvement";
  }
  if (overallChange <= -3) {
    return "regression";
  }
  return "stable";
}

export function mapSpeechAiFeedback(raw) {
  const map = asMap(raw);
  if (!map) {
    return {
      clinicalNote: null,
      improvementSummary: null,
      recommendedAction: null,
      recommendations: [],
      treatmentAnalysis: null,
      decisionSupportReason: null,
      suggestedAction: null,
      transcriptSummary: null,
      hasContent: false,
    };
  }

  const provider = asMap(map.provider_response) || map;
  const decisionSupport = asMap(provider.decision_support || map.decision_support);
  const aiNote = asMap(map.ai_progress_note);

  const clinicalNote =
    readText(provider, ["clinical_note", "clinicalNote"]) ||
    readText(map, ["clinical_note", "clinicalNote"]) ||
    readText(aiNote, ["clinical_note", "clinicalNote"]);
  const improvementSummary =
    readText(provider, ["improvement_summary", "improvementSummary"]) ||
    readText(map, ["improvement_summary", "improvementSummary"]) ||
    readText(aiNote, ["improvement_summary", "improvementSummary"]);
  const recommendedAction =
    readText(provider, ["recommended_action", "recommendedAction"]) ||
    readText(map, ["recommended_action", "recommendedAction"]) ||
    readText(aiNote, ["recommended_action", "recommendedAction"]);
  const recommendations = [
    ...readRecommendations(provider),
    ...readRecommendations(map),
    ...readRecommendations(aiNote || {}),
  ];
  const treatmentAnalysis =
    readText(provider, ["treatment_analysis", "treatmentAnalysis"]) ||
    readText(map, ["treatment_analysis", "treatmentAnalysis"]) ||
    readText(aiNote, ["treatment_analysis", "treatmentAnalysis"]);
  const decisionSupportReason =
    readText(decisionSupport, ["reason"]) ||
    readText(asMap(map.decision_support), ["reason"]);
  const suggestedAction =
    readText(decisionSupport, ["suggested_action", "suggestedAction"]) ||
    readText(asMap(map.decision_support), ["suggested_action", "suggestedAction"]);
  const transcriptSummary =
    readText(aiNote, ["transcript_summary", "transcriptSummary"]) ||
    readText(map, ["transcript_summary", "transcriptSummary"]);

  // Dedupe recommendations while preserving order
  const uniqueRecommendations = [];
  for (const item of recommendations) {
    if (!uniqueRecommendations.includes(item)) {
      uniqueRecommendations.push(item);
    }
  }

  const hasContent = Boolean(
    clinicalNote ||
      improvementSummary ||
      recommendedAction ||
      uniqueRecommendations.length ||
      treatmentAnalysis ||
      decisionSupportReason ||
      transcriptSummary,
  );

  return {
    clinicalNote,
    improvementSummary,
    recommendedAction,
    recommendations: uniqueRecommendations,
    treatmentAnalysis,
    decisionSupportReason,
    suggestedAction,
    transcriptSummary,
    hasContent,
  };
}

export function mapSpeechComparison({ comparisonMap = null, current = null, previous = null } = {}) {
  if (comparisonMap) {
    const comparison = {
      comparedToAnalysisId: readString(comparisonMap, [
        "previous_speech_analysis_id",
        "compared_to_analysis_id",
        "comparedToAnalysisId",
      ]) || null,
      pronunciationChange: readDouble(comparisonMap, [
        "pronunciation_change",
        "pronunciationChange",
      ]),
      fluencyChange: readDouble(comparisonMap, ["fluency_change", "fluencyChange"]),
      overallScoreChange: readDouble(comparisonMap, [
        "overall_score_change",
        "overallScoreChange",
      ]),
      trend: readString(comparisonMap, ["trend"]) || null,
      previousAnalyzedAt: previous?.analyzedAt || null,
    };
    comparison.hasComparison = Boolean(
      comparison.pronunciationChange != null ||
        comparison.fluencyChange != null ||
        comparison.overallScoreChange != null ||
        comparison.trend,
    );
    comparison.trendLabel = speechTrendLabel(comparison.trend);
    comparison.trendTone = speechTrendTone(comparison.trend);
    return comparison;
  }

  if (!current || !previous) {
    return null;
  }

  const overallScoreChange = scoreDelta(current.overallScore, previous.overallScore);
  const comparison = {
    comparedToAnalysisId: previous.id || null,
    pronunciationChange: scoreDelta(current.pronunciationScore, previous.pronunciationScore),
    fluencyChange: scoreDelta(current.fluencyScore, previous.fluencyScore),
    overallScoreChange,
    trend: inferTrend(overallScoreChange),
    previousAnalyzedAt: previous.analyzedAt || null,
  };
  comparison.hasComparison = Boolean(
    comparison.pronunciationChange != null ||
      comparison.fluencyChange != null ||
      comparison.overallScoreChange != null ||
      comparison.trend,
  );
  comparison.trendLabel = speechTrendLabel(comparison.trend);
  comparison.trendTone = speechTrendTone(comparison.trend);
  return comparison;
}

export function mapSpeechAnalysisItem(row, { fallbackPatientId = "", fallbackPatientName = "" } = {}) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const raw = asMap(row.raw_ai_output ?? row.rawAiOutput);
  const nestedCurrent = asMap(row.current_analysis);
  const source = nestedCurrent || row;
  const aiNote = asMap(row.ai_progress_note);
  const feedback = aiNote
    ? mapSpeechAiFeedback(aiNote)
    : mapSpeechAiFeedback(raw);
  const comparisonMap = asMap(row.comparison);

  const item = {
    id: readString(source, ["id", "_id"]),
    submissionId: readString(source, ["submission_id", "submissionId"]),
    patientId:
      readString(source, ["patient_id", "patientId"]) ||
      fallbackPatientId ||
      "",
    patientName:
      readString(source, ["patient_name", "patientName"]) ||
      fallbackPatientName ||
      readString(raw || {}, ["patient_name", "patientName"]) ||
      null,
    transcript: readText(source, ["transcript"]),
    pronunciationScore: readDouble(source, ["pronunciation_score", "pronunciationScore"]),
    fluencyScore: readDouble(source, ["fluency_score", "fluencyScore"]),
    overallScore: readDouble(source, ["overall_score", "overallScore"]),
    comparedToAnalysisId:
      readString(source, ["compared_to_analysis_id", "comparedToAnalysisId"]) || null,
    rawAiOutput: raw,
    analyzedAt: readDateIso(source.analyzed_at ?? source.analyzedAt),
    exerciseTitle: readText(source, ["exercise_title", "exerciseTitle"]),
    submissionStatus: readText(source, ["submission_status", "submissionStatus", "status"]),
    audioFileUrl: readText(source, ["audio_file_url", "audioFileUrl", "file_url", "fileUrl"]),
    language:
      readText(source, ["language"]) ||
      readText(raw || {}, ["language"]),
    durationSeconds:
      readDouble(source, ["duration", "duration_seconds", "durationSeconds"]) ??
      readDouble(raw || {}, ["duration"]),
    aiFeedback: feedback,
    comparison: mapSpeechComparison({ comparisonMap }),
  };

  if (!item.id) {
    return null;
  }
  return item;
}

export function mapSpeechProgressPoint(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  return {
    id,
    pronunciationScore: readDouble(row, ["pronunciation_score", "pronunciationScore"]),
    fluencyScore: readDouble(row, ["fluency_score", "fluencyScore"]),
    overallScore: readDouble(row, ["overall_score", "overallScore"]),
    analyzedAt: readDateIso(row.analyzed_at ?? row.analyzedAt),
  };
}

export function mergeSpeechAnalyses(analyses, extra) {
  if (!extra?.id) {
    return analyses;
  }
  const merged = [extra, ...analyses.filter((item) => item.id !== extra.id)];
  merged.sort((a, b) => {
    const aTime = a.analyzedAt ? new Date(a.analyzedAt).getTime() : 0;
    const bTime = b.analyzedAt ? new Date(b.analyzedAt).getTime() : 0;
    return bTime - aTime;
  });
  return merged;
}

export function findPreviousSpeechAnalysis(selected, analyses) {
  const index = analyses.findIndex((item) => item.id === selected?.id);
  if (index < 0 || index + 1 >= analyses.length) {
    return null;
  }
  return analyses[index + 1];
}

export function buildSpeechComparison(selected, analyses) {
  if (!selected) {
    return null;
  }
  if (selected.comparison?.hasComparison) {
    return selected.comparison;
  }

  let previous = null;
  const compareId = selected.comparedToAnalysisId;
  if (compareId) {
    previous = analyses.find((item) => item.id === compareId) || null;
  }
  previous = previous || findPreviousSpeechAnalysis(selected, analyses);
  return mapSpeechComparison({ current: selected, previous });
}

export function resolvePatientName(patientRow, fallbackName = "") {
  return (
    readString(patientRow || {}, ["full_name", "fullName", "name"]) ||
    fallbackName ||
    "Patient"
  );
}

export function isArabicLanguage(language) {
  return (language || "").trim().toLowerCase().startsWith("ar");
}
