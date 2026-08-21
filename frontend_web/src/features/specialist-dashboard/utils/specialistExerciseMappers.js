import { EXERCISE_VALIDATION_KEYS } from "./specialistExercisesLocalization.js";

export const EXERCISE_ALL_CATEGORY_LABEL = "All";

const KNOWN_CATEGORY_ORDER = [
  "Speech Articulation",
  "Fluency",
  "Language Development",
  "Voice & Breathing",
  "Fine Motor Skills",
  "Gross Motor Skills",
  "Sensory Integration",
  "Daily Living Skills",
  "Motor Rehabilitation",
  "Behavioral Skills",
  "Social Communication",
  "Autism Support",
  "Developmental Activities",
  "Learning & Cognitive Skills",
  "Speech Therapy",
];

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

function parseExerciseLanguage(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "en";
  }
  return value.trim().toLowerCase() === "ar" ? "ar" : "en";
}

export function getExerciseLanguageLabel(language) {
  return parseExerciseLanguage(language) === "ar" ? "ar" : "en";
}

export function mapExerciseItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const description = readString(row, ["description"]) || null;
  const instructions = readString(row, ["instructions"]) || null;
  const instructionMediaUrl = readString(row, ["instruction_media_url", "instructionMediaUrl"]) || null;
  const expectedText = readString(row, ["expected_text", "expectedText"]) || null;
  const targetWord = readString(row, ["target_word", "targetWord"]) || null;
  const targetPhoneme = readString(row, ["target_phoneme", "targetPhoneme"]) || null;
  const language = parseExerciseLanguage(readString(row, ["language"]));

  return {
    id,
    title: readString(row, ["title", "name"]) || "Exercise",
    category: readString(row, ["category_name", "categoryName", "category"]) || null,
    categoryId: readString(row, ["category_id", "categoryId"]) || null,
    description,
    instructions,
    instructionMediaUrl,
    expectedText,
    targetWord,
    targetPhoneme,
    language,
    languageLabel: getExerciseLanguageLabel(language),
    createdBy: readString(row, ["created_by", "createdBy"]) || null,
    createdByName: readString(row, ["created_by_name", "createdByName"]) || null,
    previewText: (() => {
      if (instructions) {
        return instructions;
      }
      if (description) {
        return description;
      }
      return null;
    })(),
    hasMedia: Boolean(instructionMediaUrl),
  };
}

export function mapExerciseList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(mapExerciseItem).filter(Boolean);
}

export function mapExerciseCategoryItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  return {
    id,
    name: readString(row, ["name", "title"]) || "Category",
    description: readString(row, ["description"]) || null,
  };
}

export function mapExerciseCategoryList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(mapExerciseCategoryItem).filter(Boolean);
}

export function buildExerciseCategoryFilters(exercises) {
  const fromApi = new Set();
  exercises.forEach((exercise) => {
    const category = exercise.category?.trim();
    if (category) {
      fromApi.add(category);
    }
  });

  const ordered = [EXERCISE_ALL_CATEGORY_LABEL];
  const remainingSet = new Set(fromApi);

  KNOWN_CATEGORY_ORDER.forEach((known) => {
    if (remainingSet.delete(known)) {
      ordered.push(known);
    }
  });

  ordered.push(...Array.from(remainingSet).sort((a, b) => a.localeCompare(b)));
  return ordered;
}

export function filterExercises(exercises, { searchQuery = "", selectedCategory = EXERCISE_ALL_CATEGORY_LABEL } = {}) {
  const query = searchQuery.trim().toLowerCase();

  return exercises.filter((exercise) => {
    if (selectedCategory !== EXERCISE_ALL_CATEGORY_LABEL) {
      const category = exercise.category?.trim() ?? "";
      if (category !== selectedCategory) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    const searchable = [
      exercise.title,
      exercise.category,
      exercise.instructions,
      exercise.description,
      exercise.language,
      exercise.language === "ar" ? "arabic" : "english",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(query);
  });
}

function normalizeCategoryName(category) {
  return category?.trim().toLowerCase() ?? "";
}

const SPEECH_ARTICULATION_CATEGORY = "speech articulation";

export function isSpeechArticulationCategory(categoryName) {
  return normalizeCategoryName(categoryName) === SPEECH_ARTICULATION_CATEGORY;
}

export function resolveExerciseCategoryName(categoryId, categories) {
  if (!categoryId?.trim() || !Array.isArray(categories)) {
    return "";
  }
  const match = categories.find((category) => category.id === categoryId);
  return match?.name?.trim() ?? "";
}

export function getExerciseCategoryIconType(category) {
  const normalized = normalizeCategoryName(category);
  if (
    normalized.includes("articulation")
    || normalized.includes("speech")
    || normalized.includes("voice")
    || normalized.includes("fluency")
  ) {
    return "voice";
  }
  if (normalized.includes("language") || normalized.includes("learning")) {
    return "book";
  }
  if (
    normalized.includes("fine motor")
    || normalized.includes("daily living")
    || normalized.includes("sensory")
  ) {
    return "hand";
  }
  if (normalized.includes("gross motor") || normalized.includes("motor rehabilitation")) {
    return "walk";
  }
  if (
    normalized.includes("behavioral")
    || normalized.includes("social")
    || normalized.includes("autism")
    || normalized.includes("developmental")
  ) {
    return "groups";
  }
  return "fitness";
}

export function getExerciseCategoryTone(category) {
  const normalized = normalizeCategoryName(category);
  if (
    normalized.includes("articulation")
    || normalized.includes("speech")
    || normalized.includes("voice")
  ) {
    return "cyan";
  }
  if (normalized.includes("fluency")) {
    return "accent";
  }
  if (normalized.includes("language") || normalized.includes("learning")) {
    return "blue";
  }
  if (
    normalized.includes("motor")
    || normalized.includes("sensory")
    || normalized.includes("daily")
  ) {
    return "teal";
  }
  if (
    normalized.includes("behavioral")
    || normalized.includes("social")
    || normalized.includes("autism")
    || normalized.includes("developmental")
  ) {
    return "secondary";
  }
  return "warning";
}

export function canEditExercise(exercise, { userId, role }) {
  const normalizedRole = role?.trim().toLowerCase();
  if (normalizedRole === "admin") {
    return true;
  }
  if (normalizedRole !== "specialist") {
    return false;
  }
  const creator = exercise?.createdBy?.trim();
  const current = userId?.trim();
  return Boolean(creator && current && creator === current);
}

export function buildExerciseUpdatePayload({
  categoryId,
  title,
  description,
  instructions,
  language,
  instructionMediaUrl,
  clearInstructionMedia = false,
  expectedText,
  targetWord,
  targetPhoneme,
  isSpeechArticulation = false,
}) {
  const payload = {
    category_id: categoryId.trim(),
    title: title.trim(),
    language: parseExerciseLanguage(language),
    description: description?.trim() ?? "",
    instructions: instructions?.trim() ?? "",
    instruction_media_url: clearInstructionMedia
      ? ""
      : (instructionMediaUrl?.trim() ?? ""),
  };

  if (isSpeechArticulation) {
    payload.expected_text = expectedText?.trim() ?? "";
    payload.target_word = targetWord?.trim() ?? "";
    payload.target_phoneme = targetPhoneme?.trim() ?? "";
  } else {
    payload.expected_text = "";
    payload.target_word = "";
    payload.target_phoneme = "";
  }

  return payload;
}

/** Matches Flutter UpsertExerciseRequest.toCreateJson() — omit empty optionals. */
export function buildExerciseCreatePayload({
  categoryId,
  title,
  description,
  instructions,
  language,
  instructionMediaUrl,
  expectedText,
  targetWord,
  targetPhoneme,
  isSpeechArticulation = false,
}) {
  const payload = {
    category_id: categoryId.trim(),
    title: title.trim(),
    language: parseExerciseLanguage(language),
  };

  const trimmedDescription = description?.trim() ?? "";
  if (trimmedDescription) {
    payload.description = trimmedDescription;
  }

  const trimmedInstructions = instructions?.trim() ?? "";
  if (trimmedInstructions) {
    payload.instructions = trimmedInstructions;
  }

  const trimmedMediaUrl = instructionMediaUrl?.trim() ?? "";
  if (trimmedMediaUrl) {
    payload.instruction_media_url = trimmedMediaUrl;
  }

  if (isSpeechArticulation) {
    const trimmedExpectedText = expectedText?.trim() ?? "";
    if (trimmedExpectedText) {
      payload.expected_text = trimmedExpectedText;
    }

    const trimmedTargetWord = targetWord?.trim() ?? "";
    if (trimmedTargetWord) {
      payload.target_word = trimmedTargetWord;
    }

    const trimmedTargetPhoneme = targetPhoneme?.trim() ?? "";
    if (trimmedTargetPhoneme) {
      payload.target_phoneme = trimmedTargetPhoneme;
    }
  }

  return payload;
}

export function validateExerciseEditForm({
  categoryId,
  title,
  isSpeechArticulation = false,
  expectedText,
}) {
  if (!categoryId?.trim()) {
    return EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED;
  }
  if (!title?.trim()) {
    return EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED;
  }
  if (isSpeechArticulation && !expectedText?.trim()) {
    return EXERCISE_VALIDATION_KEYS.EXPECTED_TEXT_REQUIRED;
  }
  return null;
}

export const validateExerciseCreateForm = validateExerciseEditForm;
