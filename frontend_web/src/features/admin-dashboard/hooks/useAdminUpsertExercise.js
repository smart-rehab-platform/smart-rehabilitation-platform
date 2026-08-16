import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  createAdminExercise,
  loadAdminExerciseDetails,
  updateAdminExercise,
  uploadAdminExerciseMedia,
} from "../../../services/adminExercisesService";
import {
  EXERCISE_VALIDATION_KEYS,
  getAdminExercisesLabels,
  getExerciseMediaValidationMessage,
  resolveExerciseFieldErrors,
} from "../utils/adminExercisesLocalization.js";
import {
  buildCreateExercisePayload,
  buildUpdateExercisePayload,
  DEFAULT_EXERCISE_LANGUAGE,
  mapAdminExercise,
} from "../utils/adminExercisesMappers";
import {
  EXERCISE_MEDIA_MAX_BYTES,
  EXERCISE_TEXT_MAX,
  EXERCISE_TITLE_MAX,
  validateExerciseMediaFile,
} from "../utils/adminExerciseMediaUtils";
import { EXERCISE_MEDIA_VALIDATION_KEYS } from "../../specialist-dashboard/utils/specialistExerciseMediaUtils.js";
import { useAdminExerciseCategories } from "./useAdminExerciseCategories";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function localizeMediaValidationError(file, t) {
  if (!(file instanceof File)) {
    return getExerciseMediaValidationMessage(EXERCISE_MEDIA_VALIDATION_KEYS.UNABLE_READ, t);
  }

  if (file.size > EXERCISE_MEDIA_MAX_BYTES) {
    return getExerciseMediaValidationMessage(EXERCISE_MEDIA_VALIDATION_KEYS.TOO_LARGE, t);
  }

  const validation = validateExerciseMediaFile(file);
  if (!validation.ok) {
    return getExerciseMediaValidationMessage(EXERCISE_MEDIA_VALIDATION_KEYS.UNSUPPORTED, t);
  }

  return null;
}

function validateFields(values, t) {
  const validationLabels = getAdminExercisesLabels(t);
  const errors = {};
  const title = values.title.trim();

  if (!values.categoryId) {
    Object.assign(errors, resolveExerciseFieldErrors(EXERCISE_VALIDATION_KEYS.CATEGORY_REQUIRED, t));
  }

  if (!title) {
    Object.assign(errors, resolveExerciseFieldErrors(EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED, t));
  } else if (title.length > EXERCISE_TITLE_MAX) {
    errors.title = validationLabels.validation.titleMaxLength(EXERCISE_TITLE_MAX);
  }

  if (values.description.trim().length > EXERCISE_TEXT_MAX) {
    errors.description = validationLabels.validation.descriptionMaxLength(EXERCISE_TEXT_MAX);
  }

  if (values.instructions.trim().length > EXERCISE_TEXT_MAX) {
    errors.instructions = validationLabels.validation.instructionsMaxLength(EXERCISE_TEXT_MAX);
  }

  return errors;
}

export function useAdminUpsertExercise({ mode, exerciseId }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);
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
  const [loadError, setLoadError] = useState(missingExerciseId ? labels.notFound : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          setLoadError(labels.notFound);
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
          setLoadError(resolveErrorMessage(loadErr, labels.loadDetailsFailed));
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
  }, [isEdit, labels.loadDetailsFailed, labels.notFound, normalizedExerciseId, refreshExerciseToken, revokePreviewUrl]);

  useEffect(() => () => {
    revokePreviewUrl();
  }, [revokePreviewUrl]);

  const handleSelectMediaFile = useCallback((file) => {
    const validationMessage = localizeMediaValidationError(file, t);
    if (validationMessage) {
      setMediaError(validationMessage);
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
  }, [revokePreviewUrl, t]);

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
    }, t);

    setFieldErrors(nextFieldErrors);
    setFormError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return { ok: false };
    }

    if (newMediaFile) {
      const mediaValidationMessage = localizeMediaValidationError(newMediaFile, t);
      if (mediaValidationMessage) {
        setMediaError(mediaValidationMessage);
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
        isEdit ? labels.toast.updateFailed : labels.toast.createFailed,
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
    labels,
    language,
    newMediaFile,
    normalizedExerciseId,
    removeExistingMedia,
    t,
    title,
  ]);

  const showExistingMedia = isEdit
    && Boolean(currentMediaUrl)
    && !removeExistingMedia
    && !newMediaFile;

  const isBusy = isSubmitting || isUploading || isLoadingExercise || isLoadingCategories;
  const canSubmit = Boolean(effectiveCategoryId) && title.trim().length > 0 && !isBusy;

  return {
    labels,
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
