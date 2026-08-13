export const EXERCISE_ALL_CATEGORY_LABEL = "All";

export const EXERCISE_SEARCH_PLACEHOLDER = "Search by title, category, or instructions...";

export const EXERCISE_EMPTY_DATABASE_MESSAGE = "No exercises available.";

export const EXERCISE_EMPTY_FILTERED_MESSAGE = "No exercises match your search or selected category.";

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
  return parseExerciseLanguage(language) === "ar" ? "Arabic" : "English";
}

export function mapExerciseItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const description = readString(row, ["description"]) || null;
  const instructions = readString(row, ["instructions"]) || null;
  const instructionMediaUrl = readString(row, ["instruction_media_url", "instructionMediaUrl"]) || null;
  const language = parseExerciseLanguage(readString(row, ["language"]));

  return {
    id,
    title: readString(row, ["title", "name"]) || "Exercise",
    category: readString(row, ["category_name", "categoryName", "category"]) || null,
    categoryId: readString(row, ["category_id", "categoryId"]) || null,
    description,
    instructions,
    instructionMediaUrl,
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
      exercise.languageLabel,
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
}) {
  return {
    category_id: categoryId.trim(),
    title: title.trim(),
    language: parseExerciseLanguage(language),
    description: description?.trim() ?? "",
    instructions: instructions?.trim() ?? "",
    instruction_media_url: clearInstructionMedia
      ? ""
      : (instructionMediaUrl?.trim() ?? ""),
  };
}

/** Matches Flutter UpsertExerciseRequest.toCreateJson() — omit empty optionals. */
export function buildExerciseCreatePayload({
  categoryId,
  title,
  description,
  instructions,
  language,
  instructionMediaUrl,
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

  return payload;
}

export function validateExerciseEditForm({ categoryId, title }) {
  if (!categoryId?.trim()) {
    return "Please select a category.";
  }
  if (!title?.trim()) {
    return "Title is required.";
  }
  return null;
}

export const validateExerciseCreateForm = validateExerciseEditForm;

export function resolveExerciseFieldErrors(validationMessage) {
  if (!validationMessage) {
    return {};
  }
  switch (validationMessage) {
    case "Please select a category.":
      return { categoryId: validationMessage };
    case "Title is required.":
      return { title: validationMessage };
    default:
      return { form: validationMessage };
  }
}

export function getExerciseLibraryEmptyMessage({ hasExercises, hasVisible }) {
  if (!hasExercises) {
    return EXERCISE_EMPTY_DATABASE_MESSAGE;
  }
  if (!hasVisible) {
    return EXERCISE_EMPTY_FILTERED_MESSAGE;
  }
  return null;
}
