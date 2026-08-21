function formatJsonSummary(value) {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value.map(formatJsonSummary).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = formatJsonSummary(entryValue);
        return formatted ? `${key}: ${formatted}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value).trim();
}

function buildLegacySummaryFallback(raw) {
  if (raw == null) {
    return null;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return formatJsonSummary(JSON.parse(trimmed)) || trimmed;
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof raw === "object") {
    const formatted = formatJsonSummary(raw);
    return formatted || null;
  }
  const text = String(raw).trim();
  return text || null;
}

function tryParseAiSummaryObject(raw) {
  if (raw == null) {
    return null;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function readSummaryString(record, key) {
  if (!record || typeof record !== "object") {
    return null;
  }
  const value = record[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return null;
}

function readSummaryStringArray(record, key) {
  if (!record || typeof record !== "object") {
    return [];
  }
  const value = record[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : null))
    .filter(Boolean);
}

export function normalizeAiReportConfidence(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return null;
  }
  let numeric = Number(value);
  if (numeric > 0 && numeric <= 1) {
    numeric *= 100;
  }
  return Math.round(Math.max(0, Math.min(100, numeric)));
}

export function normalizeAiReportPriority(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return null;
}

const AI_NARRATIVE_SECTION_DEFS = [
  { id: "executive_summary", featured: true },
  { id: "patient_progress_summary" },
  { id: "speech_analysis_summary" },
  { id: "exercise_adherence_summary" },
  { id: "goal_progress_summary" },
];

const AI_LIST_SECTION_DEFS = [
  { id: "clinical_insights", variant: "default" },
  { id: "risks_or_regressions", variant: "warning" },
  { id: "recommendations", variant: "numbered" },
  { id: "next_steps", variant: "default" },
];

/**
 * Parses AI report summary JSON into structured sections for detail rendering.
 * Falls back safely for malformed or legacy summaries.
 */
export function parseAiReportStructuredSummary(raw) {
  const parsed = tryParseAiSummaryObject(raw);
  const emptyFallback = {
    isStructured: false,
    plainTextFallback: null,
    overview: null,
    narrativeSections: [],
    listSections: [],
    contextMetadata: null,
  };

  if (!parsed) {
    return {
      ...emptyFallback,
      plainTextFallback: buildLegacySummaryFallback(raw),
    };
  }

  const narrativeSections = AI_NARRATIVE_SECTION_DEFS
    .map(({ id, featured }) => {
      const content = readSummaryString(parsed, id);
      return content ? { id, content, featured: Boolean(featured) } : null;
    })
    .filter(Boolean);

  const listSections = AI_LIST_SECTION_DEFS
    .map(({ id, variant }) => {
      const items = readSummaryStringArray(parsed, id);
      return items.length > 0 ? { id, items, variant } : null;
    })
    .filter(Boolean);

  const overview = {
    priorityLevel: normalizeAiReportPriority(parsed.priority_level),
    confidencePercent: normalizeAiReportConfidence(parsed.estimated_confidence),
    usedFallback: parsed.used_fallback === true,
    reportType: readSummaryString(parsed, "report_type"),
  };

  const hasStructuredContent = narrativeSections.length > 0
    || listSections.length > 0
    || overview.priorityLevel
    || overview.confidencePercent != null
    || overview.usedFallback;

  if (!hasStructuredContent) {
    return {
      ...emptyFallback,
      plainTextFallback: buildLegacySummaryFallback(raw),
      contextMetadata: parsed.context_metadata ?? null,
    };
  }

  return {
    isStructured: true,
    plainTextFallback: null,
    overview,
    narrativeSections,
    listSections,
    contextMetadata: parsed.context_metadata ?? null,
  };
}

/**
 * Builds AI report detail sections from raw summary JSON.
 * Used by mapAiReportDetail; kept pure for testability.
 */
export function buildAiReportDetailSections(rawSummary, flattenedSummary = null) {
  const aiStructuredSummary = parseAiReportStructuredSummary(rawSummary);
  const fallbackContent = flattenedSummary
    || aiStructuredSummary.plainTextFallback
    || null;

  return {
    aiStructuredSummary,
    sections: aiStructuredSummary.isStructured || !fallbackContent
      ? []
      : [{ title: "AI Summary", content: fallbackContent }],
  };
}
