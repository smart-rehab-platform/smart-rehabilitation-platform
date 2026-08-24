/**
 * Pure helpers for Specialist AI report draft editing (Web).
 * Field ids match backend summary JSON / structured parser.
 */

export const AI_REPORT_EDITABLE_NARRATIVE_FIELDS = Object.freeze([
  "executive_summary",
  "patient_progress_summary",
  "speech_analysis_summary",
  "exercise_adherence_summary",
  "goal_progress_summary",
]);

export const AI_REPORT_EDITABLE_LIST_FIELDS = Object.freeze([
  "clinical_insights",
  "risks_or_regressions",
  "recommendations",
  "next_steps",
]);

function readNarrativeFromStructured(structured, fieldId) {
  const section = (structured?.narrativeSections || []).find((item) => item.id === fieldId);
  return section?.content ? String(section.content) : "";
}

function readListFromStructured(structured, fieldId) {
  const section = (structured?.listSections || []).find((item) => item.id === fieldId);
  if (!section?.items?.length) {
    return "";
  }
  return section.items.map((item) => String(item)).join("\n");
}

/**
 * Builds local edit form state from a mapped AI report detail.
 * List fields use one item per line in the textarea.
 */
export function buildAiReportDraftFormState(detail) {
  const structured = detail?.aiStructuredSummary;
  const fallbackText = detail?.sections?.[0]?.content
    || structured?.plainTextFallback
    || detail?.summary
    || "";

  if (structured?.isStructured) {
    const form = {};
    for (const fieldId of AI_REPORT_EDITABLE_NARRATIVE_FIELDS) {
      form[fieldId] = readNarrativeFromStructured(structured, fieldId);
    }
    for (const fieldId of AI_REPORT_EDITABLE_LIST_FIELDS) {
      form[fieldId] = readListFromStructured(structured, fieldId);
    }
    return form;
  }

  const form = {};
  for (const fieldId of AI_REPORT_EDITABLE_NARRATIVE_FIELDS) {
    form[fieldId] = fieldId === "executive_summary" ? String(fallbackText || "") : "";
  }
  for (const fieldId of AI_REPORT_EDITABLE_LIST_FIELDS) {
    form[fieldId] = "";
  }
  return form;
}

export function listFieldTextToArray(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Builds PATCH body for /ai/reports/:id from form state.
 */
export function buildAiReportDraftUpdatePayload(formState) {
  const payload = {};
  for (const fieldId of AI_REPORT_EDITABLE_NARRATIVE_FIELDS) {
    payload[fieldId] = String(formState?.[fieldId] ?? "").trim();
  }
  for (const fieldId of AI_REPORT_EDITABLE_LIST_FIELDS) {
    payload[fieldId] = listFieldTextToArray(formState?.[fieldId]);
  }
  return payload;
}

export function hasAiReportDraftClinicalContent(formState) {
  const payload = buildAiReportDraftUpdatePayload(formState);
  return AI_REPORT_EDITABLE_NARRATIVE_FIELDS.some((fieldId) => payload[fieldId])
    || AI_REPORT_EDITABLE_LIST_FIELDS.some((fieldId) => payload[fieldId].length > 0);
}

export function areAiReportDraftFormsEqual(a, b) {
  const left = a || {};
  const right = b || {};
  const keys = [
    ...AI_REPORT_EDITABLE_NARRATIVE_FIELDS,
    ...AI_REPORT_EDITABLE_LIST_FIELDS,
  ];
  return keys.every((key) => String(left[key] ?? "") === String(right[key] ?? ""));
}

/**
 * Whether an AI report detail (raw mapper or localized) can enter draft edit mode.
 * Uses isAi + !isPdfReady because isAwaitingReview may only exist after localization.
 */
export function canStartAiReportDraftEdit(detail) {
  return Boolean(detail?.isAi && !detail?.isPdfReady);
}
