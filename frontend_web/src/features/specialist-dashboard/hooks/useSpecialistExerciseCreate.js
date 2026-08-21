import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  createSpecialistExercise,
  loadExerciseCategories,
  uploadExerciseInstructionMedia,
} from "../../../services/specialistExerciseService";
import {
  buildExerciseCreatePayload,
  isSpeechArticulationCategory,
  resolveExerciseCategoryName,
  validateExerciseCreateForm,
} from "../utils/specialistExerciseMappers";
import {
  getExerciseMediaValidationMessage,
  getExerciseValidationMessage,
  resolveExerciseFieldErrors,
} from "../utils/specialistExercisesLocalization";
import { notifySpecialistExerciseRefresh } from "../utils/specialistExerciseRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExerciseCreate(enabled = true) {
  const { t } = useLocale();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [expectedText, setExpectedText] = useState("");
  const [targetWord, setTargetWord] = useState("");
  const [targetPhoneme, setTargetPhoneme] = useState("");
  const [language, setLanguage] = useState("en");
  const [pendingMediaFile, setPendingMediaFile] = useState(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadCategoriesFailedMessage = t("specialist.exercises.errors.loadCategoriesFailed");
  const pleaseWaitMessage = t("specialist.exercises.pleaseWait");
  const uploadFailedMessage = t("specialist.exercises.errors.uploadFailed");
  const createFailedMessage = t("specialist.exercises.errors.createFailed");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const nextCategories = await loadExerciseCategories();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setCategories(nextCategories);
        setCategoryId((current) => {
          if (current) {
            return current;
          }
          return nextCategories[0]?.id || "";
        });
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setCategories([]);
        setError(resolveErrorMessage(loadError, loadCategoriesFailedMessage));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshToken, loadCategoriesFailedMessage]);

  const fieldErrors = useMemo(
    () => resolveExerciseFieldErrors(validationMessage, t),
    [validationMessage, t],
  );

  const selectMediaFile = useCallback((file, validationError = null) => {
    if (validationError) {
      setMediaError(validationError);
      return;
    }
    setPendingMediaFile(file);
    setUploadedMediaUrl("");
    setMediaError(null);
  }, []);

  const removeMedia = useCallback(() => {
    setPendingMediaFile(null);
    setUploadedMediaUrl("");
    setMediaError(null);
  }, []);

  const save = useCallback(async () => {
    const categoryName = resolveExerciseCategoryName(categoryId, categories);
    const isSpeechArticulation = isSpeechArticulationCategory(categoryName);
    const validation = validateExerciseCreateForm({
      categoryId,
      title,
      isSpeechArticulation,
      expectedText,
    });
    if (validation) {
      setValidationMessage(validation);
      return { ok: false, message: getExerciseValidationMessage(validation, t) };
    }

    if (isSaving || isUploading) {
      return { ok: false, message: pleaseWaitMessage };
    }

    setIsSaving(true);
    setError(null);
    setValidationMessage(null);
    setMediaError(null);

    let nextMediaUrl = uploadedMediaUrl?.trim() || null;

    try {
      if (pendingMediaFile) {
        setIsUploading(true);
        setUploadProgress(0);
        try {
          nextMediaUrl = await uploadExerciseInstructionMedia(pendingMediaFile, {
            onProgress: (progress) => setUploadProgress(progress),
          });
          setUploadedMediaUrl(nextMediaUrl);
          setPendingMediaFile(null);
        } catch (uploadError) {
          const message = resolveErrorMessage(uploadError, uploadFailedMessage);
          setMediaError(message);
          return { ok: false, message };
        } finally {
          setIsUploading(false);
          setUploadProgress(null);
        }
      }

      const payload = buildExerciseCreatePayload({
        categoryId,
        title,
        description,
        instructions,
        language,
        instructionMediaUrl: nextMediaUrl,
        expectedText,
        targetWord,
        targetPhoneme,
        isSpeechArticulation,
      });

      const created = await createSpecialistExercise(payload);
      notifySpecialistExerciseRefresh();
      return { ok: true, exercise: created };
    } catch (saveError) {
      const message = resolveErrorMessage(saveError, createFailedMessage);
      setError(message);
      return { ok: false, message };
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [
    categoryId,
    title,
    description,
    instructions,
    expectedText,
    targetWord,
    targetPhoneme,
    categories,
    language,
    pendingMediaFile,
    uploadedMediaUrl,
    isSaving,
    isUploading,
    t,
    pleaseWaitMessage,
    uploadFailedMessage,
    createFailedMessage,
  ]);

  const isBusy = isSaving || isUploading;
  const localizedMediaError = mediaError
    ? (getExerciseMediaValidationMessage(mediaError, t) || mediaError)
    : null;

  return {
    categories,
    isLoading,
    isSaving,
    isUploading,
    isBusy,
    uploadProgress,
    error,
    mediaError: localizedMediaError,
    validationMessage,
    fieldErrors,
    categoryId,
    title,
    description,
    instructions,
    expectedText,
    targetWord,
    targetPhoneme,
    language,
    pendingMediaFile,
    instructionMediaUrl: uploadedMediaUrl,
    clearInstructionMedia: false,
    setCategoryId,
    setTitle,
    setDescription,
    setInstructions,
    setExpectedText,
    setTargetWord,
    setTargetPhoneme,
    setLanguage,
    selectMediaFile,
    removeMedia,
    undoMediaRemoval: () => {},
    reload,
    save,
  };
}
