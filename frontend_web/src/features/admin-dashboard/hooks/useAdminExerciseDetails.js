import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadAdminExerciseDetails } from "../../../services/adminExercisesService";
import {
  applyAdminExerciseLocalization,
  getAdminExercisesLabels,
} from "../utils/adminExercisesLocalization.js";
import { mapAdminExercise } from "../utils/adminExercisesMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminExerciseDetails(exerciseId) {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);
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
        setError(labels.notFound);
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
          setError(labels.notFound);
          return;
        }

        setExercise(applyAdminExerciseLocalization(mapped, mapperContext));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setExercise(null);
        setError(resolveErrorMessage(loadError, labels.loadFailed));
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
  }, [exerciseId, labels.loadFailed, labels.notFound, mapperContext, refreshToken]);

  return {
    exercise,
    isLoading,
    error,
    refresh,
    labels,
  };
}
