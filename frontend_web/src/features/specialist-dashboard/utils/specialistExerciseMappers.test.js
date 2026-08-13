import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXERCISE_ALL_CATEGORY_LABEL,
  buildExerciseCategoryFilters,
  buildExerciseCreatePayload,
  buildExerciseUpdatePayload,
  canEditExercise,
  filterExercises,
  validateExerciseEditForm,
} from "./specialistExerciseMappers.js";

describe("specialistExerciseMappers", () => {
  const sampleExercises = [
  {
    id: "1",
    title: "Gentle Breath Support",
    category: "Voice & Breathing",
    instructions: "Sit upright and blow gently.",
    description: "Breath exercise",
    language: "en",
    languageLabel: "English",
    createdBy: "spec-1",
  },
  {
    id: "2",
    title: "Emotion Matching",
    category: "Social Communication",
    instructions: "Show 4 emotion cards.",
    description: "Match expressions",
    language: "en",
    languageLabel: "English",
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

  it("filterExercises matches language label in search", () => {
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

  it("validateExerciseEditForm enforces category and title", () => {
  assert.equal(validateExerciseEditForm({ categoryId: "", title: "A" }), "Please select a category.");
  assert.equal(validateExerciseEditForm({ categoryId: "cat", title: "  " }), "Title is required.");
  assert.equal(validateExerciseEditForm({ categoryId: "cat", title: "A" }), null);
  });
});
