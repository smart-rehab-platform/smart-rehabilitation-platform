import { useCallback, useEffect, useRef, useState } from "react";
import { loadAdminExerciseDetails } from "../../../services/adminExercisesService";
import { mapAdminExercise } from "../utils/adminExercisesMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminExerciseDetails(exerciseId) {
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof exerciseId === "string" ? exerciseId.trim() : "";
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      if (!normalizedId) {
        setExercise(null);
        setError("Exercise not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const row = await loadAdminExerciseDetails(normalizedId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapAdminExercise(row);
        if (!mapped) {
          setExercise(null);
          setError("Exercise not found.");
          return;
        }

        setExercise(mapped);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setExercise(null);
        setError(resolveErrorMessage(loadError, "Failed to load exercise details."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [exerciseId, refreshToken]);

  return {
    exercise,
    isLoading,
    error,
    refresh,
  };
}
