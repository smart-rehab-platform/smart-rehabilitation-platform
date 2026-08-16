import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistExercises } from "../../../services/specialistExerciseService";
import {
  EXERCISE_ALL_CATEGORY_LABEL,
  buildExerciseCategoryFilters,
  filterExercises,
} from "../utils/specialistExerciseMappers";
import {
  applyExerciseListItemLocalization,
  getExerciseLibraryEmptyMessage,
} from "../utils/specialistExercisesLocalization";
import { subscribeSpecialistExerciseRefresh } from "../utils/specialistExerciseRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExercises(enabled = true) {
  const { t } = useLocale();
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(EXERCISE_ALL_CATEGORY_LABEL);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadFailedMessage = t("specialist.exercises.errors.loadFailed");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistExerciseRefresh(reload), [reload]);

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
        const nextExercises = await loadSpecialistExercises();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setExercises(nextExercises);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setExercises([]);
        setError(resolveErrorMessage(loadError, loadFailedMessage));
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
  }, [enabled, refreshToken, loadFailedMessage]);

  const categoryFilters = useMemo(
    () => buildExerciseCategoryFilters(exercises),
    [exercises],
  );

  const visibleExercises = useMemo(() => {
    const filtered = filterExercises(exercises, { searchQuery, selectedCategory });
    return filtered.map((exercise) => applyExerciseListItemLocalization(exercise, { t }));
  }, [exercises, searchQuery, selectedCategory, t]);

  const emptyMessage = useMemo(
    () => getExerciseLibraryEmptyMessage({
      hasExercises: exercises.length > 0,
      hasVisible: visibleExercises.length > 0,
    }, t),
    [exercises.length, visibleExercises.length, t],
  );

  return {
    exercises,
    visibleExercises,
    categoryFilters,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    emptyMessage,
    reload,
  };
}
