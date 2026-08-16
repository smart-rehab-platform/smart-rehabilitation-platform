import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXERCISE_ALL_CATEGORY_LABEL,
  buildExerciseCreatePayload,
  buildExerciseUpdatePayload,
  buildExerciseCategoryFilters,
  canEditExercise,
  filterExercises,
  validateExerciseEditForm,
} from "./specialistExerciseMappers.js";
import { EXERCISE_VALIDATION_KEYS } from "./specialistExercisesLocalization.js";
import {
  EXERCISE_MEDIA_VALIDATION_KEYS,
  EXERCISE_MEDIA_MAX_BYTES,
  inferExerciseMediaMimeType,
  validateExerciseMediaFile,
  guessExerciseMediaKind,
} from "./specialistExerciseMediaUtils.js";

describe("specialistExerciseMappers", () => {
  const sampleExercises = [
  {
    id: "1",
    title: "Gentle Breath Support",
    category: "Voice & Breathing",
    instructions: "Sit upright and blow gently.",
    description: "Breath exercise",
    language: "en",
    languageLabel: "en",
    createdBy: "spec-1",
  },
  {
    id: "2",
    title: "Emotion Matching",
    category: "Social Communication",
    instructions: "Show 4 emotion cards.",
    description: "Match expressions",
    language: "en",
    languageLabel: "en",
    createdBy: "spec-2",
  },
  ];

  it("buildExerciseCategoryFilters includes All and known order", () => {
  const filters = buildExerciseCategoryFilters(sampleExercises);
  assert.equal(filters[0], EXERCISE_ALL_CATEGORY_LABEL);
  assert.ok(filters.includes("Voice & Breathing"));
  assert.ok(filters.includes("Social Communication"));
  });

  it("filterExercises applies category and search together", () => {
  const filtered = filterExercises(sampleExercises, {
    selectedCategory: "Voice & Breathing",
    searchQuery: "breath",
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "1");
  });

  it("filterExercises matches language code in search", () => {
  const filtered = filterExercises(sampleExercises, {
    searchQuery: "english",
  });
  assert.equal(filtered.length, 2);
  });

  it("canEditExercise allows admin and owning specialist only", () => {
  assert.equal(canEditExercise(sampleExercises[0], { userId: "spec-1", role: "specialist" }), true);
  assert.equal(canEditExercise(sampleExercises[0], { userId: "spec-2", role: "specialist" }), false);
  assert.equal(canEditExercise(sampleExercises[0], { userId: "other", role: "admin" }), true);
  });

  it("buildExerciseUpdatePayload matches backend field names", () => {
  const payload = buildExerciseUpdatePayload({
    categoryId: "cat-1",
    title: "Updated",
    description: "Desc",
    instructions: "Steps",
    language: "ar",
    instructionMediaUrl: "uploads/media.mp4",
  });
  assert.deepEqual(payload, {
    category_id: "cat-1",
    title: "Updated",
    language: "ar",
    description: "Desc",
    instructions: "Steps",
    instruction_media_url: "uploads/media.mp4",
  });
  });

  it("buildExerciseCreatePayload omits empty optional fields like Flutter", () => {
    const minimal = buildExerciseCreatePayload({
      categoryId: "cat-1",
      title: "New Exercise",
      description: "  ",
      instructions: "",
      language: "en",
      instructionMediaUrl: null,
    });
    assert.deepEqual(minimal, {
      category_id: "cat-1",
      title: "New Exercise",
      language: "en",
    });

    const full = buildExerciseCreatePayload({
      categoryId: "cat-1",
      title: "New Exercise",
      description: "Desc",
      instructions: "Steps",
      language: "ar",
      instructionMediaUrl: "/uploads/demo.pdf",
    });
    assert.deepEqual(full, {
      category_id: "cat-1",
      title: "New Exercise",
      language: "ar",
      description: "Desc",
      instructions: "Steps",
      instruction_media_url: "/uploads/demo.pdf",
    });
  });

  it("validateExerciseEditForm returns validation keys", () => {
  assert.equal(validateExerciseEditForm({ categoryId: "", title: "A" }), EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED);
  assert.equal(validateExerciseEditForm({ categoryId: "cat", title: "  " }), EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED);
  assert.equal(validateExerciseEditForm({ categoryId: "cat", title: "A" }), null);
  });
});

describe("specialistExerciseMediaUtils", () => {
  it("infers supported mime types from extension", () => {
    assert.equal(inferExerciseMediaMimeType("demo.mp4", ""), "video/mp4");
    assert.equal(inferExerciseMediaMimeType("notes.pdf", ""), "application/pdf");
  });

  it("rejects unsupported files with validation keys", () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    assert.equal(validateExerciseMediaFile(file), EXERCISE_MEDIA_VALIDATION_KEYS.UNSUPPORTED);
  });

  it("rejects oversized files with validation keys", () => {
    const bytes = new Uint8Array(EXERCISE_MEDIA_MAX_BYTES + 1);
    const file = new File([bytes], "large.mp4", { type: "video/mp4" });
    assert.equal(validateExerciseMediaFile(file), EXERCISE_MEDIA_VALIDATION_KEYS.TOO_LARGE);
  });

  it("accepts supported files within size limit", () => {
    const file = new File(["abc"], "photo.png", { type: "image/png" });
    assert.equal(validateExerciseMediaFile(file), null);
  });

  it("guesses media kinds from url/filename", () => {
    assert.equal(guessExerciseMediaKind("/uploads/demo.mov"), "video");
    assert.equal(guessExerciseMediaKind("/uploads/guide.pdf"), "pdf");
    assert.equal(guessExerciseMediaKind("/uploads/track.mp3"), "audio");
  });
});
