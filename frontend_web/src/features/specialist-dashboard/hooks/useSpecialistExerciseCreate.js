import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpecialistExercise,
  loadExerciseCategories,
  uploadExerciseInstructionMedia,
} from "../../../services/specialistExerciseService";
import {
  buildExerciseCreatePayload,
  resolveExerciseFieldErrors,
  validateExerciseCreateForm,
} from "../utils/specialistExerciseMappers";
import { notifySpecialistExerciseRefresh } from "../utils/specialistExerciseRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExerciseCreate(enabled = true) {
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
  const [language, setLanguage] = useState("en");
  const [pendingMediaFile, setPendingMediaFile] = useState(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

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
        setError(resolveErrorMessage(loadError, "Failed to load categories."));
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
  }, [enabled, refreshToken]);

  const fieldErrors = resolveExerciseFieldErrors(validationMessage);

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
    const validation = validateExerciseCreateForm({ categoryId, title });
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
          const message = resolveErrorMessage(
            uploadError,
            "Failed to upload instructional media.",
          );
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
      });

      const created = await createSpecialistExercise(payload);
      notifySpecialistExerciseRefresh();
      return { ok: true, exercise: created };
    } catch (saveError) {
      const message = resolveErrorMessage(saveError, "Failed to create exercise.");
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
    pendingMediaFile,
    uploadedMediaUrl,
    isSaving,
    isUploading,
  ]);

  const isBusy = isSaving || isUploading;

  return {
    categories,
    isLoading,
    isSaving,
    isUploading,
    isBusy,
    uploadProgress,
    error,
    mediaError,
    validationMessage,
    fieldErrors,
    categoryId,
    title,
    description,
    instructions,
    language,
    pendingMediaFile,
    instructionMediaUrl: uploadedMediaUrl,
    clearInstructionMedia: false,
    setCategoryId,
    setTitle,
    setDescription,
    setInstructions,
    setLanguage,
    selectMediaFile,
    removeMedia,
    undoMediaRemoval: () => {},
    reload,
    save,
  };
}
