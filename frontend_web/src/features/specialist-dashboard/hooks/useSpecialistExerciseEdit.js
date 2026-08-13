import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadExerciseCategories,
  loadSpecialistExerciseById,
  updateSpecialistExercise,
  uploadExerciseInstructionMedia,
} from "../../../services/specialistExerciseService";
import {
  buildExerciseUpdatePayload,
  resolveExerciseFieldErrors,
  validateExerciseEditForm,
} from "../utils/specialistExerciseMappers";
import { notifySpecialistExerciseRefresh } from "../utils/specialistExerciseRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExerciseEdit(exerciseId, enabled = true) {
  const [exercise, setExercise] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState("en");
  const [instructionMediaUrl, setInstructionMediaUrl] = useState("");
  const [originalInstructionMediaUrl, setOriginalInstructionMediaUrl] = useState("");
  const [pendingMediaFile, setPendingMediaFile] = useState(null);
  const [clearInstructionMedia, setClearInstructionMedia] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !exerciseId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setMediaError(null);
      setNotFound(false);
      setForbidden(false);
      setExercise(null);
      setPendingMediaFile(null);
      setClearInstructionMedia(false);
      setUploadProgress(null);

      try {
        const [nextExercise, nextCategories] = await Promise.all([
          loadSpecialistExerciseById(exerciseId),
          loadExerciseCategories(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        if (!nextExercise) {
          setNotFound(true);
          return;
        }

        const loadedMediaUrl = nextExercise.instructionMediaUrl || "";
        setExercise(nextExercise);
        setCategories(nextCategories);
        setCategoryId(nextExercise.categoryId || "");
        setTitle(nextExercise.title || "");
        setDescription(nextExercise.description || "");
        setInstructions(nextExercise.instructions || "");
        setLanguage(nextExercise.language || "en");
        setInstructionMediaUrl(loadedMediaUrl);
        setOriginalInstructionMediaUrl(loadedMediaUrl);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        const message = resolveErrorMessage(loadError, "Failed to load exercise.");
        if (message === "Exercise not found.") {
          setNotFound(true);
          return;
        }
        setError(message);
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
  }, [enabled, exerciseId, refreshToken]);

  const fieldErrors = resolveExerciseFieldErrors(validationMessage);

  const selectMediaFile = useCallback((file, validationError = null) => {
    if (validationError) {
      setMediaError(validationError);
      return;
    }
    setPendingMediaFile(file);
    setClearInstructionMedia(false);
    setMediaError(null);
  }, []);

  const removeMedia = useCallback(() => {
    setPendingMediaFile(null);
    setMediaError(null);
    if (instructionMediaUrl.trim() || originalInstructionMediaUrl.trim()) {
      setClearInstructionMedia(true);
      setInstructionMediaUrl("");
    }
  }, [instructionMediaUrl, originalInstructionMediaUrl]);

  const undoMediaRemoval = useCallback(() => {
    setClearInstructionMedia(false);
    setInstructionMediaUrl(originalInstructionMediaUrl);
    setMediaError(null);
  }, [originalInstructionMediaUrl]);

  const save = useCallback(async () => {
    const validation = validateExerciseEditForm({ categoryId, title });
    if (validation) {
      setValidationMessage(validation);
      return { ok: false, message: validation };
    }

    if (isSaving || isUploading) {
      return { ok: false, message: "Please wait…" };
    }

    setIsSaving(true);
    setError(null);
    setValidationMessage(null);
    setMediaError(null);
    setForbidden(false);

    let nextMediaUrl = clearInstructionMedia ? null : (instructionMediaUrl?.trim() || null);

    try {
      if (pendingMediaFile) {
        setIsUploading(true);
        setUploadProgress(0);
        try {
          nextMediaUrl = await uploadExerciseInstructionMedia(pendingMediaFile, {
            onProgress: (progress) => setUploadProgress(progress),
          });
          setInstructionMediaUrl(nextMediaUrl);
          setPendingMediaFile(null);
          setClearInstructionMedia(false);
        } catch (uploadError) {
          const message = resolveErrorMessage(uploadError, "Failed to upload instructional media.");
          setMediaError(message);
          return { ok: false, message };
        } finally {
          setIsUploading(false);
          setUploadProgress(null);
        }
      }

      const payload = buildExerciseUpdatePayload({
        categoryId,
        title,
        description,
        instructions,
        language,
        instructionMediaUrl: nextMediaUrl,
        clearInstructionMedia: clearInstructionMedia && !nextMediaUrl,
      });

      const updated = await updateSpecialistExercise(exerciseId, payload);
      if (updated) {
        setExercise(updated);
        const savedMediaUrl = updated.instructionMediaUrl || "";
        setInstructionMediaUrl(savedMediaUrl);
        setOriginalInstructionMediaUrl(savedMediaUrl);
      }
      setPendingMediaFile(null);
      setClearInstructionMedia(false);
      notifySpecialistExerciseRefresh();
      return { ok: true };
    } catch (saveError) {
      const message = resolveErrorMessage(saveError, "Failed to save exercise changes.");
      if (message.includes("do not have access") || message.includes("not allowed")) {
        setForbidden(true);
      }
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
    language,
    instructionMediaUrl,
    clearInstructionMedia,
    pendingMediaFile,
    isSaving,
    isUploading,
    exerciseId,
  ]);

  const isBusy = isSaving || isUploading;

  return {
    exercise,
    categories,
    isLoading,
    isSaving,
    isUploading,
    isBusy,
    uploadProgress,
    error,
    mediaError,
    notFound,
    forbidden,
    validationMessage,
    fieldErrors,
    categoryId,
    title,
    description,
    instructions,
    language,
    instructionMediaUrl,
    originalInstructionMediaUrl,
    pendingMediaFile,
    clearInstructionMedia,
    setCategoryId,
    setTitle,
    setDescription,
    setInstructions,
    setLanguage,
    selectMediaFile,
    removeMedia,
    undoMediaRemoval,
    reload,
    save,
  };
}
