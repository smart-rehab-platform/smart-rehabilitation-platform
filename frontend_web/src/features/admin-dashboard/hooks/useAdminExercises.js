import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadAdminExercises } from "../../../services/adminExercisesService";
import {
  EXERCISE_ALL_CATEGORY_LABEL,
  buildExerciseCategoryFilters,
  filterExercises,
  mapAdminExercise,
} from "../utils/adminExercisesMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(EXERCISE_ALL_CATEGORY_LABEL);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadExercises() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await loadAdminExercises();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = rows.map(mapAdminExercise).filter(Boolean);
        setExercises(mapped);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setExercises([]);
        setError(resolveErrorMessage(loadError, "Failed to load exercises."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadExercises();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const categoryFilters = useMemo(
    () => buildExerciseCategoryFilters(exercises),
    [exercises],
  );

  const filteredExercises = useMemo(
    () => filterExercises(exercises, { searchQuery, selectedCategory }),
    [exercises, searchQuery, selectedCategory],
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim()
    || selectedCategory !== EXERCISE_ALL_CATEGORY_LABEL,
  );

  return {
    exercises,
    filteredExercises,
    categoryFilters,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    isLoading,
    error,
    refresh,
  };
}
