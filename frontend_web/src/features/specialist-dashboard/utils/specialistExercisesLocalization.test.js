import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  EXERCISE_VALIDATION_KEYS,
  applyExerciseListItemLocalization,
  getExerciseCategoryLabel,
  getExerciseLanguageLabel,
  getExerciseLibraryEmptyMessage,
  getExerciseMediaTypeLabel,
  getExerciseValidationMessage,
  resolveExerciseFieldErrors,
} from "./specialistExercisesLocalization.js";
import {
  EXERCISE_MEDIA_VALIDATION_KEYS,
  validateExerciseMediaFile,
} from "./specialistExerciseMediaUtils.js";
import {
  EXERCISE_ALL_CATEGORY_LABEL,
  validateExerciseEditForm,
} from "./specialistExerciseMappers.js";

function tFactory(locale) {
  const messages = locale === "ar" ? ar : en;
  return (key, params) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== "string") {
      return key;
    }
    return Object.entries(params || {}).reduce(
      (result, [name, paramValue]) => result.replace(`{${name}}`, String(paramValue)),
      value,
    );
  };
}

describe("specialistExercisesLocalization", () => {
  it("maps exercise page labels in EN/AR", () => {
    assert.equal(tFactory("en")("specialist.exercises.title"), "Exercise Library");
    assert.equal(tFactory("ar")("specialist.exercises.title"), "مكتبة التمارين");
    assert.equal(tFactory("en")("specialist.exercises.addExercise"), "Add Exercise");
    assert.equal(tFactory("ar")("specialist.exercises.addExercise"), "إضافة تمرين");
  });

  it("maps known exercise categories and preserves unknown categories", () => {
    assert.equal(getExerciseCategoryLabel("Speech Articulation", tFactory("en")), "Speech Articulation");
    assert.equal(getExerciseCategoryLabel("Speech Articulation", tFactory("ar")), "نطق الكلام");
    assert.equal(getExerciseCategoryLabel("Motor Rehabilitation", tFactory("ar")), "إعادة التأهيل الحركي");
    assert.equal(getExerciseCategoryLabel("Custom Clinic Category", tFactory("en")), "Custom Clinic Category");
    assert.equal(getExerciseCategoryLabel("Custom Clinic Category", tFactory("ar")), "Custom Clinic Category");
    assert.equal(getExerciseCategoryLabel(EXERCISE_ALL_CATEGORY_LABEL, tFactory("ar")), "الكل");
  });

  it("maps exercise language labels without changing stored values", () => {
    assert.equal(getExerciseLanguageLabel("en", tFactory("en")), "English");
    assert.equal(getExerciseLanguageLabel("ar", tFactory("ar")), "العربية");
  });

  it("maps media type labels in EN/AR", () => {
    assert.equal(getExerciseMediaTypeLabel("video", tFactory("en")), "Video");
    assert.equal(getExerciseMediaTypeLabel("video", tFactory("ar")), "فيديو");
  });

  it("localizes validation messages while preserving validation keys", () => {
    assert.equal(
      validateExerciseEditForm({ categoryId: "", title: "A" }),
      EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED,
    );
    assert.equal(
      getExerciseValidationMessage(EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED, tFactory("ar")),
      "العنوان مطلوب.",
    );
    assert.deepEqual(
      resolveExerciseFieldErrors(EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED, tFactory("en")),
      { categoryId: "Please select a category." },
    );
  });

  it("returns validation keys from media utils unchanged", () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    assert.equal(validateExerciseMediaFile(file), EXERCISE_MEDIA_VALIDATION_KEYS.UNSUPPORTED);
  });

  it("keeps exercise title and instructions unchanged during list localization", () => {
    const localized = applyExerciseListItemLocalization({
      id: "1",
      title: "Gentle Breath Support",
      category: "Voice & Breathing",
      instructions: "Sit upright and blow gently.",
      language: "en",
    }, { t: tFactory("ar") });

    assert.equal(localized.title, "Gentle Breath Support");
    assert.equal(localized.instructions, "Sit upright and blow gently.");
    assert.equal(localized.category, "Voice & Breathing");
    assert.equal(localized.categoryLabel, "الصوت والتنفس");
  });

  it("localizes empty states in EN/AR", () => {
    assert.equal(
      getExerciseLibraryEmptyMessage({ hasExercises: false, hasVisible: false }, tFactory("en")),
      "No exercises available.",
    );
    assert.equal(
      getExerciseLibraryEmptyMessage({ hasExercises: true, hasVisible: false }, tFactory("ar")),
      "لا توجد تمارين تطابق البحث أو الفئة المحددة.",
    );
  });

  it("falls back to English when translation key is missing", () => {
    assert.equal(getExerciseCategoryLabel("Speech Articulation", null), "Speech Articulation");
    assert.equal(getExerciseValidationMessage(EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED, null), "Title is required.");
  });
});
