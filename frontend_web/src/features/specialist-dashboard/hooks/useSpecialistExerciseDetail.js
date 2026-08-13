import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpecialistExerciseById } from "../../../services/specialistExerciseService";
import { subscribeSpecialistExerciseRefresh } from "../utils/specialistExerciseRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExerciseDetail(exerciseId, enabled = true) {
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistExerciseRefresh(reload), [reload]);

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
      setNotFound(false);
      setExercise(null);

      try {
        const nextExercise = await loadSpecialistExerciseById(exerciseId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        if (!nextExercise) {
          setNotFound(true);
          return;
        }
        setExercise(nextExercise);
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

  return {
    exercise,
    isLoading,
    error,
    notFound,
    reload,
  };
}
