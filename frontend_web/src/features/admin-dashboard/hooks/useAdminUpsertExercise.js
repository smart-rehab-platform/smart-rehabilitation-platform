import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAdminExercise,
  loadAdminExerciseDetails,
  updateAdminExercise,
  uploadAdminExerciseMedia,
} from "../../../services/adminExercisesService";
import {
  buildCreateExercisePayload,
  buildUpdateExercisePayload,
  DEFAULT_EXERCISE_LANGUAGE,
  mapAdminExercise,
} from "../utils/adminExercisesMappers";
import {
  EXERCISE_TEXT_MAX,
  EXERCISE_TITLE_MAX,
  validateExerciseMediaFile,
} from "../utils/adminExerciseMediaUtils";
import { useAdminExerciseCategories } from "./useAdminExerciseCategories";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function validateFields(values) {
  const errors = {};
  const title = values.title.trim();

  if (!values.categoryId) {
    errors.categoryId = "Please select a category.";
  }

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > EXERCISE_TITLE_MAX) {
    errors.title = `Title must be at most ${EXERCISE_TITLE_MAX} characters.`;
  }

  if (values.description.trim().length > EXERCISE_TEXT_MAX) {
    errors.description = `Description must be at most ${EXERCISE_TEXT_MAX} characters.`;
  }

  if (values.instructions.trim().length > EXERCISE_TEXT_MAX) {
    errors.instructions = `Instructions must be at most ${EXERCISE_TEXT_MAX} characters.`;
  }

  return errors;
}

export function useAdminUpsertExercise({ mode, exerciseId }) {
  const isEdit = mode === "edit";
  const normalizedExerciseId = typeof exerciseId === "string" ? exerciseId.trim() : "";

  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refresh: refreshCategories,
  } = useAdminExerciseCategories();

  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState(DEFAULT_EXERCISE_LANGUAGE);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [currentMediaUrl, setCurrentMediaUrl] = useState(null);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [newMediaPreviewUrl, setNewMediaPreviewUrl] = useState(null);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const missingExerciseId = isEdit && !normalizedExerciseId;
  const [isLoadingExercise, setIsLoadingExercise] = useState(isEdit && !missingExerciseId);
  const [loadError, setLoadError] = useState(missingExerciseId ? "Exercise not found." : null);  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshExerciseToken, setRefreshExerciseToken] = useState(0);

  const submitLockRef = useRef(false);
  const previewUrlRef = useRef(null);

  const refreshExercise = useCallback(() => {
    setRefreshExerciseToken((value) => value + 1);
  }, []);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isEdit || !normalizedExerciseId) {
      return undefined;
    }

    let cancelled = false;
    async function loadExercise() {
      setIsLoadingExercise(true);
      setLoadError(null);
      setFormError(null);

      try {
        const row = await loadAdminExerciseDetails(normalizedExerciseId);
        if (cancelled) {
          return;
        }

        const exercise = mapAdminExercise(row);
        if (!exercise) {
          setLoadError("Exercise not found.");
          return;
        }

        setCategoryId(exercise.categoryId || "");
        setLanguage(exercise.language || DEFAULT_EXERCISE_LANGUAGE);
        setTitle(exercise.title || "");
        setDescription(exercise.description || "");
        setInstructions(exercise.instructions || "");
        setCurrentMediaUrl(exercise.instructionMediaUrl || null);
        setRemoveExistingMedia(false);
        setNewMediaFile(null);
        revokePreviewUrl();
        setNewMediaPreviewUrl(null);
        setMediaError(null);
        setFieldErrors({});
      } catch (loadErr) {
        if (!cancelled) {
          setLoadError(resolveErrorMessage(loadErr, "Failed to load exercise."));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingExercise(false);
        }
      }
    }

    loadExercise();

    return () => {
      cancelled = true;
    };
  }, [isEdit, normalizedExerciseId, refreshExerciseToken, revokePreviewUrl]);

  useEffect(() => () => {
    revokePreviewUrl();
  }, [revokePreviewUrl]);

  const handleSelectMediaFile = useCallback((file) => {
    const validation = validateExerciseMediaFile(file);
    if (!validation.ok) {
      setMediaError(validation.message);
      return;
    }

    setMediaError(null);
    setRemoveExistingMedia(false);
    setNewMediaFile(file);

    revokePreviewUrl();
    const kind = file.name.toLowerCase();
    if (
      kind.endsWith(".jpg")
      || kind.endsWith(".jpeg")
      || kind.endsWith(".png")
      || kind.endsWith(".webp")
    ) {
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setNewMediaPreviewUrl(previewUrl);
    } else {
      setNewMediaPreviewUrl(null);
    }
  }, [revokePreviewUrl]);

  const handleRemoveNewMedia = useCallback(() => {
    setNewMediaFile(null);
    setMediaError(null);
    revokePreviewUrl();
    setNewMediaPreviewUrl(null);
  }, [revokePreviewUrl]);

  const handleRemoveExistingMedia = useCallback(() => {
    setRemoveExistingMedia(true);
    setNewMediaFile(null);
    setMediaError(null);
    revokePreviewUrl();
    setNewMediaPreviewUrl(null);
  }, [revokePreviewUrl]);

  const effectiveCategoryId = categoryId || (!isEdit && categories[0]?.id) || "";

  const submit = useCallback(async () => {
    if (submitLockRef.current || isSubmitting || isUploading) {
      return { ok: false };
    }

    const nextFieldErrors = validateFields({
      categoryId: effectiveCategoryId,
      title,
      description,
      instructions,
    });

    setFieldErrors(nextFieldErrors);
    setFormError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return { ok: false };
    }

    if (newMediaFile) {
      const mediaValidation = validateExerciseMediaFile(newMediaFile);
      if (!mediaValidation.ok) {
        setMediaError(mediaValidation.message);
        return { ok: false };
      }
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      let instructionMediaUrl = currentMediaUrl;
      let clearInstructionMedia = false;

      if (newMediaFile) {
        setIsUploading(true);
        instructionMediaUrl = await uploadAdminExerciseMedia(newMediaFile);
        clearInstructionMedia = false;
        setIsUploading(false);
      } else if (removeExistingMedia) {
        instructionMediaUrl = null;
        clearInstructionMedia = true;
      }

      if (isEdit) {
        const payload = buildUpdateExercisePayload({
          categoryId: effectiveCategoryId,
          title,
          language,
          description,
          instructions,
          instructionMediaUrl,
          clearInstructionMedia,
        });

        await updateAdminExercise(normalizedExerciseId, payload);
      } else {
        const payload = buildCreateExercisePayload({
          categoryId: effectiveCategoryId,
          title,
          language,
          description,
          instructions,
          instructionMediaUrl: instructionMediaUrl || null,
        });

        await createAdminExercise(payload);
      }

      return { ok: true };
    } catch (submitError) {
      setFormError(resolveErrorMessage(
        submitError,
        isEdit ? "Failed to update exercise." : "Failed to create exercise.",
      ));
      return { ok: false };
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }, [
    currentMediaUrl,
    description,
    effectiveCategoryId,
    instructions,
    isEdit,
    isSubmitting,
    isUploading,
    language,
    newMediaFile,
    normalizedExerciseId,
    removeExistingMedia,
    title,
  ]);
  const showExistingMedia = isEdit
    && Boolean(currentMediaUrl)
    && !removeExistingMedia
    && !newMediaFile;

  const isBusy = isSubmitting || isUploading || isLoadingExercise || isLoadingCategories;
  const canSubmit = Boolean(effectiveCategoryId) && title.trim().length > 0 && !isBusy;

  return {
    isEdit,
    categories,
    isLoadingCategories,
    categoriesError,
    refreshCategories,
    categoryId: effectiveCategoryId,
    setCategoryId,
    language,
    setLanguage,
    title,
    setTitle,
    description,
    setDescription,
    instructions,
    setInstructions,
    currentMediaUrl,
    newMediaFile,
    newMediaPreviewUrl,
    removeExistingMedia,
    showExistingMedia,
    mediaError,
    fieldErrors,
    formError,
    isLoadingExercise,
    loadError,
    isSubmitting,
    isUploading,
    isBusy,
    canSubmit,
    refreshExercise,
    handleSelectMediaFile,
    handleRemoveNewMedia,
    handleRemoveExistingMedia,
    submit,
  };
}
