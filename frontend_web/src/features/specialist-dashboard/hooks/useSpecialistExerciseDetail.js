import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistExerciseById } from "../../../services/specialistExerciseService";
import { applyExerciseListItemLocalization } from "../utils/specialistExercisesLocalization";
import { subscribeSpecialistExerciseRefresh } from "../utils/specialistExerciseRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExerciseDetail(exerciseId, enabled = true) {
  const { t } = useLocale();
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadFailedMessage = t("specialist.exercises.errors.loadExerciseFailed");

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
        const message = resolveErrorMessage(loadError, loadFailedMessage);
        if (message === "Exercise not found." || message === t("specialist.exercises.empty.notFound")) {
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
  }, [enabled, exerciseId, refreshToken, loadFailedMessage, t]);

  const localizedExercise = useMemo(
    () => (exercise ? applyExerciseListItemLocalization(exercise, { t }) : null),
    [exercise, t],
  );

  return {
    exercise: localizedExercise,
    isLoading,
    error,
    notFound,
    reload,
  };
}
