import { formatAppDate } from "../../../i18n/formatters.js";
import {
  EXERCISE_MEDIA_VALIDATION_KEYS,
  guessExerciseMediaKind,
} from "./specialistExerciseMediaUtils.js";

export const EXERCISE_VALIDATION_KEYS = {
  CATEGORY_REQUIRED: "categoryRequired",
  TITLE_REQUIRED: "titleRequired",
};

const EXERCISE_CATEGORY_KEY_BY_NAME = {
  "speech articulation": "specialist.exercises.category.speechArticulation",
  fluency: "specialist.exercises.category.fluency",
  "language development": "specialist.exercises.category.languageDevelopment",
  "voice & breathing": "specialist.exercises.category.voiceAndBreathing",
  "fine motor skills": "specialist.exercises.category.fineMotorSkills",
  "gross motor skills": "specialist.exercises.category.grossMotorSkills",
  "sensory integration": "specialist.exercises.category.sensoryIntegration",
  "daily living skills": "specialist.exercises.category.dailyLivingSkills",
  "motor rehabilitation": "specialist.exercises.category.motorRehabilitation",
  "behavioral skills": "specialist.exercises.category.behavioralSkills",
  "social communication": "specialist.exercises.category.socialCommunication",
  "autism support": "specialist.exercises.category.autismSupport",
  "developmental activities": "specialist.exercises.category.developmentalActivities",
  "learning & cognitive skills": "specialist.exercises.category.learningAndCognitiveSkills",
  "speech therapy": "specialist.exercises.category.speechTherapy",
};

const EN_EXERCISE_CATEGORY_LABEL = {
  "speech articulation": "Speech Articulation",
  fluency: "Fluency",
  "language development": "Language Development",
  "voice & breathing": "Voice & Breathing",
  "fine motor skills": "Fine Motor Skills",
  "gross motor skills": "Gross Motor Skills",
  "sensory integration": "Sensory Integration",
  "daily living skills": "Daily Living Skills",
  "motor rehabilitation": "Motor Rehabilitation",
  "behavioral skills": "Behavioral Skills",
  "social communication": "Social Communication",
  "autism support": "Autism Support",
  "developmental activities": "Developmental Activities",
  "learning & cognitive skills": "Learning & Cognitive Skills",
  "speech therapy": "Speech Therapy",
};

const MEDIA_TYPE_LABEL_KEYS = {
  image: "specialist.exercises.media.type.image",
  video: "specialist.exercises.media.type.video",
  audio: "specialist.exercises.media.type.audio",
  pdf: "specialist.exercises.media.type.pdf",
  file: "specialist.exercises.media.type.file",
};

const MEDIA_VALIDATION_KEY_MAP = {
  [EXERCISE_MEDIA_VALIDATION_KEYS.UNABLE_READ]: "specialist.exercises.media.validation.unableReadFile",
  [EXERCISE_MEDIA_VALIDATION_KEYS.UNSUPPORTED]: "specialist.exercises.media.validation.unsupportedType",
  [EXERCISE_MEDIA_VALIDATION_KEYS.TOO_LARGE]: "specialist.exercises.media.validation.fileTooLarge",
};

const VALIDATION_KEY_MAP = {
  [EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED]: "specialist.exercises.validation.selectCategory",
  [EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED]: "specialist.exercises.validation.titleRequired",
};

const EN_VALIDATION_MESSAGE = {
  [EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED]: "Please select a category.",
  [EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED]: "Title is required.",
};

const EN_MEDIA_VALIDATION_MESSAGE = {
  [EXERCISE_MEDIA_VALIDATION_KEYS.UNABLE_READ]: "Unable to read the selected file.",
  [EXERCISE_MEDIA_VALIDATION_KEYS.UNSUPPORTED]:
    "Unsupported media type. Use image, audio, PDF, or MP4/MOV video.",
  [EXERCISE_MEDIA_VALIDATION_KEYS.TOO_LARGE]: "File is too large. Maximum size is 50 MB.",
};

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

function normalizeExerciseCategoryName(name) {
  return typeof name === "string" ? name.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

export function getExerciseCategoryLabel(categoryName, t = null) {
  if (categoryName === "All") {
    return translateKey(t, "specialist.exercises.filters.all", "All");
  }

  const normalized = normalizeExerciseCategoryName(categoryName);
  if (!normalized) {
    return categoryName || "";
  }

  const key = EXERCISE_CATEGORY_KEY_BY_NAME[normalized];
  if (key) {
    return translateKey(t, key, EN_EXERCISE_CATEGORY_LABEL[normalized]);
  }

  return categoryName.trim();
}

export function getExerciseLanguageLabel(language, t = null) {
  const normalized = typeof language === "string" ? language.trim().toLowerCase() : "";
  if (normalized === "ar") {
    return translateKey(t, "common.arabic", "Arabic");
  }
  return translateKey(t, "common.english", "English");
}

export function getExerciseMediaTypeLabel(kind, t = null) {
  const normalized = typeof kind === "string" ? kind.trim().toLowerCase() : "file";
  const key = MEDIA_TYPE_LABEL_KEYS[normalized] || MEDIA_TYPE_LABEL_KEYS.file;
  const fallback = normalized === "pdf"
    ? "PDF"
    : normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return translateKey(t, key, fallback);
}

export function getExerciseValidationMessage(key, t = null) {
  const messageKey = VALIDATION_KEY_MAP[key];
  if (messageKey) {
    return translateKey(t, messageKey, EN_VALIDATION_MESSAGE[key]);
  }
  return key || "";
}

export function getExerciseMediaValidationMessage(key, t = null) {
  const messageKey = MEDIA_VALIDATION_KEY_MAP[key];
  if (messageKey) {
    return translateKey(t, messageKey, EN_MEDIA_VALIDATION_MESSAGE[key]);
  }
  return key || "";
}

export function resolveExerciseFieldErrors(validationKey, t = null) {
  if (!validationKey) {
    return {};
  }

  switch (validationKey) {
    case EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED:
      return { categoryId: getExerciseValidationMessage(validationKey, t) };
    case EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED:
      return { title: getExerciseValidationMessage(validationKey, t) };
    default:
      return { form: getExerciseValidationMessage(validationKey, t) || validationKey };
  }
}

export function getExerciseLibraryEmptyMessage({ hasExercises, hasVisible }, t = null) {
  if (!hasExercises) {
    return translateKey(t, "specialist.exercises.empty.none", "No exercises available.");
  }
  if (!hasVisible) {
    return translateKey(
      t,
      "specialist.exercises.empty.filtered",
      "No exercises match your search or selected category.",
    );
  }
  return null;
}

export function applyExerciseListItemLocalization(exercise, { t = null } = {}) {
  if (!exercise) {
    return exercise;
  }

  return {
    ...exercise,
    categoryLabel: getExerciseCategoryLabel(exercise.category, t),
    languageLabel: getExerciseLanguageLabel(exercise.language, t),
  };
}

export function applyExerciseCategoryListLocalization(categories, { t = null } = {}) {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category) => ({
    ...category,
    displayName: getExerciseCategoryLabel(category.name, t),
  }));
}

export function describeLocalizedExerciseMediaSelection(file, t = null) {
  if (!(file instanceof File)) {
    return null;
  }

  const kind = guessExerciseMediaKind(`${file.name} ${file.type ?? ""}`);
  return {
    filename: file.name,
    kind,
    typeLabel: getExerciseMediaTypeLabel(kind, t),
    sizeLabel: formatExerciseMediaFileSize(file.size),
  };
}

export function describeLocalizedExerciseMediaUrl(url, t = null) {
  const kind = guessExerciseMediaKind(url);
  const filename = getExerciseMediaFilename(url);
  return {
    filename,
    kind,
    typeLabel: getExerciseMediaTypeLabel(kind, t),
  };
}

function getExerciseMediaFilename(source) {
  if (typeof source !== "string" || !source.trim()) {
    return null;
  }
  const trimmed = source.trim();
  const withoutQuery = trimmed.split("?")[0];
  const parts = withoutQuery.split("/");
  const basename = parts[parts.length - 1];
  return basename || trimmed;
}

export function formatExerciseMediaFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes) || bytes < 0) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatExerciseDisplayDate(value, locale = "en") {
  if (!value) {
    return null;
  }
  return formatAppDate(value, locale);
}
