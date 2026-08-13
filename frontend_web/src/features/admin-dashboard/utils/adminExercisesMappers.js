export const EXERCISE_ALL_CATEGORY_LABEL = "All";

export const DEFAULT_EXERCISE_LANGUAGE = "en";

export const ALLOWED_EXERCISE_LANGUAGES = new Set(["en", "ar"]);

/**
 * Preferred chip order from Flutter specialist_exercises_widgets.dart.
 * Filters are always built from live exercise data, not exercise-categories API.
 */
export const KNOWN_EXERCISE_CATEGORY_ORDER = [
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

function normalizeExerciseLanguage(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (normalized === "ar") {
    return "ar";
  }

  if (normalized === "en" || !normalized) {
    return DEFAULT_EXERCISE_LANGUAGE;
  }

  return normalized;
}

export function resolveExerciseLanguageLabel(language) {
  const normalized = normalizeExerciseLanguage(language);

  if (normalized === "ar") {
    return "Arabic";
  }

  if (normalized === "en") {
    return "English";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function resolvePreviewText(instructions, description) {
  if (instructions) {
    return instructions;
  }

  if (description) {
    return description;
  }

  return null;
}

function hasUsableMediaUrl(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Maps a raw exercise API row into the normalized Admin Web exercise model.
 * @param {Record<string, unknown>|null|undefined} row
 */
export function mapAdminExercise(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const title = readString(row, ["title", "name"]) || "Exercise";
  const categoryName = readString(row, ["category_name", "categoryName", "category"]) || null;
  const description = readString(row, ["description"]) || null;
  const instructions = readString(row, ["instructions"]) || null;
  const instructionMediaUrl = readString(row, ["instruction_media_url", "instructionMediaUrl"]) || null;
  const language = normalizeExerciseLanguage(readString(row, ["language"]));
  const languageLabel = resolveExerciseLanguageLabel(language);
  const createdBy = readString(row, ["created_by", "createdBy"]) || null;
  const createdByName = readString(row, ["created_by_name", "createdByName"]) || null;
  const createdAt = readString(row, ["created_at", "createdAt"]) || null;
  const updatedAt = readString(row, ["updated_at", "updatedAt"]) || null;

  return {
    id,
    categoryId: readString(row, ["category_id", "categoryId"]) || null,
    title,
    categoryName,
    description,
    instructions,
    instructionMediaUrl,
    language,
    languageLabel,
    createdBy,
    createdByName,
    createdAt,
    updatedAt,
    previewText: resolvePreviewText(instructions, description),
    hasMedia: hasUsableMediaUrl(instructionMediaUrl),
  };
}

/**
 * Maps a raw exercise category API row.
 * @param {Record<string, unknown>|null|undefined} row
 */
export function mapExerciseCategory(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id", "_id"]);
  const name = readString(row, ["name", "title"]);

  if (!id || !name) {
    return null;
  }

  const description = readString(row, ["description"]) || null;

  return {
    id,
    name,
    description,
  };
}

/**
 * Derives Library category filter chips from loaded exercises.
 * @param {Array<{ categoryName?: string|null }>} exercises
 */
export function buildExerciseCategoryFilters(exercises) {
  const fromExercises = new Set();

  for (const exercise of exercises) {
    const categoryName = typeof exercise?.categoryName === "string"
      ? exercise.categoryName.trim()
      : "";

    if (categoryName) {
      fromExercises.add(categoryName);
    }
  }

  const ordered = [EXERCISE_ALL_CATEGORY_LABEL];

  for (const knownCategory of KNOWN_EXERCISE_CATEGORY_ORDER) {
    if (fromExercises.delete(knownCategory)) {
      ordered.push(knownCategory);
    }
  }

  const remaining = Array.from(fromExercises).sort((left, right) => left.localeCompare(right));
  ordered.push(...remaining);

  return ordered;
}

/**
 * Client-side exercise filtering mirroring Flutter filterExercises behavior.
 * @param {Array<ReturnType<typeof mapAdminExercise>>} exercises
 * @param {{ searchQuery?: string, selectedCategory?: string }} filters
 */
export function filterExercises(exercises, filters = {}) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return [];
  }

  const query = typeof filters.searchQuery === "string"
    ? filters.searchQuery.trim().toLowerCase()
    : "";
  const selectedCategory = typeof filters.selectedCategory === "string"
    ? filters.selectedCategory.trim()
    : EXERCISE_ALL_CATEGORY_LABEL;

  return exercises.filter((exercise) => {
    if (!exercise) {
      return false;
    }

    if (selectedCategory !== EXERCISE_ALL_CATEGORY_LABEL) {
      const categoryName = typeof exercise.categoryName === "string"
        ? exercise.categoryName.trim()
        : "";

      if (categoryName !== selectedCategory) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    const searchable = [
      exercise.title,
      exercise.categoryName,
      exercise.instructions,
      exercise.description,
      exercise.languageLabel,
    ]
      .filter((value) => typeof value === "string" && value.trim())
      .join(" ")
      .toLowerCase();

    return searchable.includes(query);
  });
}

/**
 * Edit permission aligned with Flutter SpecialistExerciseItem.canEditBy.
 * @param {{ createdBy?: string|null }} exercise
 * @param {{ userId?: string|null, role?: string|null }} actor
 */
export function canEditExercise(exercise, actor = {}) {
  const normalizedRole = typeof actor.role === "string"
    ? actor.role.trim().toLowerCase()
    : "";

  if (normalizedRole === "admin") {
    return true;
  }

  if (normalizedRole !== "specialist") {
    return false;
  }

  const creator = typeof exercise?.createdBy === "string" ? exercise.createdBy.trim() : "";
  const currentUserId = typeof actor.userId === "string" ? actor.userId.trim() : "";

  return Boolean(creator && currentUserId && creator === currentUserId);
}

function trimOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePayloadLanguage(language) {
  const normalized = normalizeExerciseLanguage(language);
  return ALLOWED_EXERCISE_LANGUAGES.has(normalized) ? normalized : DEFAULT_EXERCISE_LANGUAGE;
}

/**
 * Builds a create-exercise API payload.
 * Empty optional fields are omitted (Flutter parity).
 * @param {{
 *   categoryId: string,
 *   title: string,
 *   language?: string,
 *   description?: string|null,
 *   instructions?: string|null,
 *   instructionMediaUrl?: string|null,
 * }} input
 */
export function buildCreateExercisePayload(input = {}) {
  const categoryId = trimOptionalString(input.categoryId);
  const title = trimOptionalString(input.title);
  const description = trimOptionalString(input.description);
  const instructions = trimOptionalString(input.instructions);
  const instructionMediaUrl = trimOptionalString(input.instructionMediaUrl);

  const payload = {
    category_id: categoryId,
    title,
    language: normalizePayloadLanguage(input.language),
  };

  if (description) {
    payload.description = description;
  }

  if (instructions) {
    payload.instructions = instructions;
  }

  if (instructionMediaUrl) {
    payload.instruction_media_url = instructionMediaUrl;
  }

  return payload;
}

/**
 * Builds an update-exercise API payload.
 * All fields are always sent; cleared optional strings use "" (Flutter parity).
 * @param {{
 *   categoryId: string,
 *   title: string,
 *   language?: string,
 *   description?: string|null,
 *   instructions?: string|null,
 *   instructionMediaUrl?: string|null,
 *   clearInstructionMedia?: boolean,
 * }} input
 */
export function buildUpdateExercisePayload(input = {}) {
  const categoryId = trimOptionalString(input.categoryId);
  const title = trimOptionalString(input.title);
  const description = trimOptionalString(input.description);
  const instructions = trimOptionalString(input.instructions);
  const instructionMediaUrl = trimOptionalString(input.instructionMediaUrl);
  const clearInstructionMedia = input.clearInstructionMedia === true;

  return {
    category_id: categoryId,
    title,
    language: normalizePayloadLanguage(input.language),
    description,
    instructions,
    instruction_media_url: clearInstructionMedia ? "" : instructionMediaUrl,
  };
}
