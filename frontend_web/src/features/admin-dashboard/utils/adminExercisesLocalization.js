import { formatAppDateTime } from "../../../i18n/formatters.js";
import { EXERCISE_ALL_CATEGORY_LABEL } from "./adminExercisesMappers.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import {
  applyExerciseCategoryListLocalization,
  describeLocalizedExerciseMediaSelection,
  describeLocalizedExerciseMediaUrl,
  formatExerciseDisplayDate,
  EXERCISE_VALIDATION_KEYS,
  getExerciseCategoryLabel,
  getExerciseLanguageLabel,
  getExerciseMediaTypeLabel,
  getExerciseMediaValidationMessage,
  getExerciseValidationMessage,
  resolveExerciseFieldErrors,
} from "../../specialist-dashboard/utils/specialistExercisesLocalization.js";

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

export {
  EXERCISE_VALIDATION_KEYS,
  getExerciseCategoryLabel,
  getExerciseLanguageLabel,
  getExerciseMediaTypeLabel,
  getExerciseValidationMessage,
  getExerciseMediaValidationMessage,
  resolveExerciseFieldErrors,
  describeLocalizedExerciseMediaSelection,
  describeLocalizedExerciseMediaUrl,
};

export function getAdminExercisesLabels(t = null) {
  return {
    title: translateKey(t, "admin.exercises.title", "Exercises"),
    subtitle: translateKey(
      t,
      "admin.exercises.subtitle",
      "Browse and manage the platform exercise library.",
    ),
    toolbarAriaLabel: translateKey(t, "admin.exercises.toolbarAriaLabel", "Exercises toolbar"),
    searchAriaLabel: translateKey(t, "admin.exercises.searchAriaLabel", "Search exercises"),
    searchPlaceholder: translateKey(t, "admin.exercises.searchPlaceholder", "Search exercises"),
    categoryFiltersAriaLabel: translateKey(
      t,
      "admin.exercises.categoryFiltersAriaLabel",
      "Exercise category filters",
    ),
    addExercise: translateKey(t, "admin.exercises.addExercise", "Add Exercise"),
    viewDetails: translateKey(t, "admin.exercises.viewDetails", "View Details"),
    edit: translateKey(t, "admin.exercises.edit", "Edit"),
    delete: translateKey(t, "admin.exercises.delete", "Delete"),
    hasMedia: translateKey(t, "admin.exercises.hasMedia", "Has media"),
    loading: translateKey(t, "admin.exercises.loading", "Loading exercises..."),
    empty: translateKey(t, "admin.exercises.empty", "No exercises have been added yet."),
    emptyFiltered: translateKey(
      t,
      "admin.exercises.emptyFiltered",
      "No exercises match your search or filter.",
    ),
    loadFailed: translateKey(t, "admin.exercises.loadFailed", "Failed to load exercises."),
    retry: translateKey(t, "common.retry", "Retry"),
    clearFilters: translateKey(t, "admin.exercises.clearFilters", "Clear filters"),
    back: translateKey(t, "admin.exercises.back", "Back to Exercises"),
    backToDetails: translateKey(t, "admin.exercises.backToDetails", "Back to Exercise Details"),
    detailsTitle: translateKey(t, "admin.exercises.detailsTitle", "Exercise Details"),
    loadingDetails: translateKey(t, "admin.exercises.loadingDetails", "Loading exercise..."),
    notFound: translateKey(t, "admin.exercises.notFound", "Exercise not found."),
    editExercise: translateKey(t, "admin.exercises.editExercise", "Edit Exercise"),
    deleteExercise: translateKey(t, "admin.exercises.deleteExercise", "Delete Exercise"),
    includesMedia: translateKey(t, "admin.exercises.includesMedia", "Includes instruction media"),
    category: translateKey(t, "admin.exercises.category", "Category"),
    description: translateKey(t, "admin.exercises.description", "Description"),
    instructions: translateKey(t, "admin.exercises.instructions", "Instructions"),
    media: translateKey(t, "admin.exercises.media", "Media"),
    language: translateKey(t, "admin.exercises.language", "Language"),
    createdBy: translateKey(t, "admin.exercises.createdBy", "Created By"),
    created: translateKey(t, "admin.exercises.created", "Created"),
    updated: translateKey(t, "admin.exercises.updated", "Updated"),
    noDescription: translateKey(t, "admin.exercises.noDescription", "No description provided."),
    noInstructions: translateKey(t, "admin.exercises.noInstructions", "No instructions provided."),
    noInstructionsAvailable: translateKey(
      t,
      "admin.exercises.noInstructionsAvailable",
      "No instructions available.",
    ),
    noMedia: translateKey(t, "admin.exercises.noMedia", "No media attached."),
    loadDetailsFailed: translateKey(
      t,
      "admin.exercises.loadDetailsFailed",
      "Failed to load exercise details.",
    ),
    form: {
      createTitle: translateKey(t, "admin.exercises.form.createTitle", "Create Exercise"),
      editTitle: translateKey(t, "admin.exercises.form.editTitle", "Edit Exercise"),
      subtitle: translateKey(
        t,
        "admin.exercises.form.subtitle",
        "Add exercise details and optional instruction media.",
      ),
      title: translateKey(t, "admin.exercises.form.title", "Title"),
      titlePlaceholder: translateKey(t, "admin.exercises.form.titlePlaceholder", "Exercise title"),
      category: translateKey(t, "admin.exercises.form.category", "Category"),
      selectCategory: translateKey(t, "admin.exercises.form.selectCategory", "Select a category"),
      description: translateKey(t, "admin.exercises.form.description", "Description"),
      descriptionOptional: translateKey(
        t,
        "admin.exercises.form.descriptionOptional",
        "Description (optional)",
      ),
      descriptionPlaceholder: translateKey(
        t,
        "admin.exercises.form.descriptionPlaceholder",
        "Optional description",
      ),
      instructions: translateKey(t, "admin.exercises.form.instructions", "Instructions"),
      instructionsDetailed: translateKey(
        t,
        "admin.exercises.form.instructionsDetailed",
        "Detailed instructions",
      ),
      instructionsPlaceholder: translateKey(
        t,
        "admin.exercises.form.instructionsPlaceholder",
        "Step-by-step instructions",
      ),
      language: translateKey(t, "admin.exercises.form.language", "Language"),
      mediaSection: translateKey(t, "admin.exercises.form.mediaSection", "Instruction Media"),
      chooseFile: translateKey(t, "admin.exercises.form.chooseFile", "Choose File"),
      replace: translateKey(t, "admin.exercises.form.replace", "Replace"),
      remove: translateKey(t, "admin.exercises.form.remove", "Remove"),
      mediaHelp: translateKey(
        t,
        "admin.exercises.form.mediaHelp",
        "Supported formats: image, audio, PDF, or MP4/MOV video. Maximum size 50 MB.",
      ),
      preview: translateKey(t, "admin.exercises.form.preview", "Preview"),
      cancel: translateKey(t, "common.cancel", "Cancel"),
      save: translateKey(t, "common.save", "Save"),
      saveChanges: translateKey(t, "admin.exercises.form.saveChanges", "Save Changes"),
      create: translateKey(t, "admin.exercises.form.create", "Create"),
      saving: translateKey(t, "admin.exercises.form.saving", "Saving..."),
      creating: translateKey(t, "admin.exercises.form.creating", "Creating..."),
      uploadingMedia: translateKey(t, "admin.exercises.form.uploadingMedia", "Uploading media..."),
      noCategories: translateKey(t, "admin.exercises.form.noCategories", "No categories available"),
    },
    validation: {
      titleMaxLength: (max) => translateKey(
        t,
        "admin.exercises.validation.titleMaxLength",
        "Title must be at most {max} characters.",
        { max },
      ),
      descriptionMaxLength: (max) => translateKey(
        t,
        "admin.exercises.validation.descriptionMaxLength",
        "Description must be at most {max} characters.",
        { max },
      ),
      instructionsMaxLength: (max) => translateKey(
        t,
        "admin.exercises.validation.instructionsMaxLength",
        "Instructions must be at most {max} characters.",
        { max },
      ),
    },
    dialogs: {
      deleteTitle: translateKey(t, "admin.exercises.dialogs.deleteTitle", "Delete Exercise"),
      deleteBody: (title) => translateKey(
        t,
        "admin.exercises.dialogs.deleteBody",
        "Are you sure you want to delete {title}? This action cannot be undone.",
        { title },
      ),
      deleting: translateKey(t, "admin.exercises.dialogs.deleting", "Deleting..."),
      cancel: translateKey(t, "common.cancel", "Cancel"),
      confirm: translateKey(t, "admin.exercises.dialogs.confirm", "Delete"),
    },
    toast: {
      createSuccess: translateKey(t, "admin.exercises.toast.createSuccess", "Exercise created successfully."),
      updateSuccess: translateKey(t, "admin.exercises.toast.updateSuccess", "Exercise updated successfully."),
      deleteSuccess: translateKey(t, "admin.exercises.toast.deleteSuccess", "Exercise deleted successfully."),
      createFailed: translateKey(t, "admin.exercises.toast.createFailed", "Failed to create exercise."),
      updateFailed: translateKey(t, "admin.exercises.toast.updateFailed", "Failed to update exercise."),
      deleteFailed: translateKey(t, "admin.exercises.toast.deleteFailed", "Failed to delete exercise."),
      uploadFailed: translateKey(t, "admin.exercises.toast.uploadFailed", "Failed to upload media."),
      categoriesLoadFailed: translateKey(
        t,
        "admin.exercises.toast.categoriesLoadFailed",
        "Failed to load exercise categories.",
      ),
    },
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function buildAdminExerciseCategoryFilterLabels(categories, context = {}) {
  const { t } = resolveAdminMapperContext(context);

  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((name) => ({
    value: name,
    label: name === EXERCISE_ALL_CATEGORY_LABEL
      ? getExerciseCategoryLabel("All", t)
      : getExerciseCategoryLabel(name, t),
  }));
}

export function formatAdminExerciseDateLabel(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);
  return formatExerciseDisplayDate(value, locale)
    ?? translateKey(t, "parent.common.emptyDisplay", "—");
}

export function formatAdminExerciseDateTimeLabel(value, context = {}) {
  const { t, locale } = resolveAdminMapperContext(context);
  const formatted = formatAppDateTime(value, locale);
  return formatted ?? translateKey(t, "parent.common.emptyDisplay", "—");
}

export function applyAdminExerciseLocalization(exercise, context = {}) {
  if (!exercise) {
    return exercise;
  }

  const { t } = resolveAdminMapperContext(context);

  return {
    ...exercise,
    categoryLabel: exercise.categoryName
      ? getExerciseCategoryLabel(exercise.categoryName, t)
      : null,
    languageLabel: getExerciseLanguageLabel(exercise.language, t),
    createdAtLabel: formatAdminExerciseDateTimeLabel(exercise.createdAt, context),
    updatedAtLabel: formatAdminExerciseDateTimeLabel(exercise.updatedAt, context),
    createdDateLabel: formatAdminExerciseDateLabel(exercise.createdAt, context),
    updatedDateLabel: formatAdminExerciseDateLabel(exercise.updatedAt, context),
  };
}

export function applyAdminExercisesLocalization(exercises, context = {}) {
  if (!Array.isArray(exercises)) {
    return [];
  }

  return exercises.map((exercise) => applyAdminExerciseLocalization(exercise, context));
}

export function applyAdminExerciseCategoriesLocalization(categories, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  return applyExerciseCategoryListLocalization(categories, { t });
}
