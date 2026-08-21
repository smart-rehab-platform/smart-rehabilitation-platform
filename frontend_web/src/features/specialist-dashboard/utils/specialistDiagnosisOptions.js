export const DIAGNOSIS_OPTION_OTHER = "__other__";

/**
 * Frontend-managed common clinical diagnosis titles for specialist selection.
 *
 * Source decision: case_categories are intake/service categories (see database/seed.sql),
 * not confirmed diagnoses — they are intentionally NOT used here.
 *
 * Titles align with platform seed/test diagnosis examples and rehabilitation scope.
 */
export const PREDEFINED_DIAGNOSIS_OPTIONS = [
  { id: "speechDelay", titleEn: "Speech Delay" },
  { id: "speechLanguageDelay", titleEn: "Speech and Language Delay" },
  { id: "languageDelay", titleEn: "Language Delay" },
  { id: "articulationDisorder", titleEn: "Articulation Disorder" },
  { id: "fluencyDisorder", titleEn: "Fluency Disorder" },
  { id: "voiceDisorder", titleEn: "Voice Disorder" },
  { id: "autismSpectrumDisorder", titleEn: "Autism Spectrum Disorder" },
  { id: "developmentalDelay", titleEn: "Developmental Delay" },
  { id: "learningDifficulty", titleEn: "Learning Difficulty" },
  { id: "motorDelay", titleEn: "Motor Delay" },
  { id: "adhd", titleEn: "ADHD" },
];

export function normalizeDiagnosisTitle(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function getDiagnosisOptionLabel(optionId, t) {
  if (optionId === DIAGNOSIS_OPTION_OTHER) {
    return t("specialist.patientDetails.diagnosisOptionOther");
  }
  return t(`specialist.patientDetails.diagnosisOptions.${optionId}`);
}

export function getPredefinedDiagnosisTitle(optionId) {
  const match = PREDEFINED_DIAGNOSIS_OPTIONS.find((option) => option.id === optionId);
  return match?.titleEn ?? "";
}

export function resolveEffectiveDiagnosisTitle(selectedOptionId, customTitle) {
  if (!selectedOptionId) {
    return "";
  }
  if (selectedOptionId === DIAGNOSIS_OPTION_OTHER) {
    return customTitle.trim();
  }
  return getPredefinedDiagnosisTitle(selectedOptionId);
}

export function findMatchingPredefinedOptionId(diagnosisTitle, t) {
  const normalized = normalizeDiagnosisTitle(diagnosisTitle);
  if (!normalized) {
    return null;
  }

  for (const option of PREDEFINED_DIAGNOSIS_OPTIONS) {
    if (normalizeDiagnosisTitle(option.titleEn) === normalized) {
      return option.id;
    }
    const localizedLabel = getDiagnosisOptionLabel(option.id, t);
    if (normalizeDiagnosisTitle(localizedLabel) === normalized) {
      return option.id;
    }
  }

  return null;
}

export function resolveDiagnosisSelectorState(currentDiagnosis, t) {
  if (!currentDiagnosis?.title?.trim()) {
    return {
      selectedOptionId: "",
      customTitle: "",
    };
  }

  const matchedOptionId = findMatchingPredefinedOptionId(currentDiagnosis.title, t);
  if (matchedOptionId) {
    return {
      selectedOptionId: matchedOptionId,
      customTitle: "",
    };
  }

  return {
    selectedOptionId: DIAGNOSIS_OPTION_OTHER,
    customTitle: currentDiagnosis.title.trim(),
  };
}

export function isDiagnosisSelectionUnchanged(
  currentDiagnosis,
  selectedOptionId,
  customTitle,
  description,
  diagnosedAt,
) {
  if (!currentDiagnosis) {
    return false;
  }

  const baselineDescription = currentDiagnosis.description || "";
  const baselineDate = currentDiagnosis.diagnosedAt
    ? formatLocalDateInputValue(currentDiagnosis.diagnosedAt)
    : "";
  const effectiveTitle = resolveEffectiveDiagnosisTitle(selectedOptionId, customTitle);

  return (
    effectiveTitle.trim() === (currentDiagnosis.title || "").trim()
    && description.trim() === baselineDescription.trim()
    && diagnosedAt.trim() === baselineDate
  );
}

export function formatLocalDateInputValue(date = new Date()) {
  const resolved = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(resolved.getTime())) {
    return formatLocalDateInputValue(new Date());
  }
  const year = resolved.getFullYear();
  const month = String(resolved.getMonth() + 1).padStart(2, "0");
  const day = String(resolved.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildInitialDiagnosisFormState(currentDiagnosis) {
  if (!currentDiagnosis) {
    return {
      description: "",
      diagnosedAt: formatLocalDateInputValue(),
    };
  }

  return {
    description: currentDiagnosis.description || "",
    diagnosedAt: currentDiagnosis.diagnosedAt
      ? formatLocalDateInputValue(currentDiagnosis.diagnosedAt)
      : formatLocalDateInputValue(),
  };
}

export function validateDiagnosisSelection(selectedOptionId, customTitle, t) {
  if (!selectedOptionId) {
    return t("specialist.patientDetails.diagnosisSelectRequired");
  }
  if (selectedOptionId === DIAGNOSIS_OPTION_OTHER && !customTitle.trim()) {
    return t("specialist.patientDetails.otherDiagnosisRequired");
  }
  const effectiveTitle = resolveEffectiveDiagnosisTitle(selectedOptionId, customTitle);
  if (!effectiveTitle.trim()) {
    return t("specialist.patientDetails.otherDiagnosisRequired");
  }
  return null;
}
