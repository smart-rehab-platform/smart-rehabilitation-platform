import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadAdminExercises } from "../../../services/adminExercisesService";
import {
  applyAdminExercisesLocalization,
  buildAdminExerciseCategoryFilterLabels,
  getAdminExercisesLabels,
} from "../utils/adminExercisesLocalization.js";
import {
  EXERCISE_ALL_CATEGORY_LABEL,
  buildExerciseCategoryFilters,
  filterExercises,
  mapAdminExercise,
} from "../utils/adminExercisesMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminExercises() {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);
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

        const mapped = applyAdminExercisesLocalization(
          rows.map(mapAdminExercise).filter(Boolean),
          mapperContext,
        );
        setExercises(mapped);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setExercises([]);
        setError(resolveErrorMessage(loadError, labels.loadFailed));
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
  }, [labels.loadFailed, mapperContext, refreshToken]);

  const categoryFilters = useMemo(
    () => buildExerciseCategoryFilters(exercises),
    [exercises],
  );

  const categoryFilterOptions = useMemo(
    () => buildAdminExerciseCategoryFilterLabels(categoryFilters, mapperContext),
    [categoryFilters, mapperContext],
  );

  const filteredExercises = useMemo(
    () => applyAdminExercisesLocalization(
      filterExercises(exercises, { searchQuery, selectedCategory }),
      mapperContext,
    ),
    [exercises, mapperContext, searchQuery, selectedCategory],
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim()
    || selectedCategory !== EXERCISE_ALL_CATEGORY_LABEL,
  );

  return {
    labels,
    exercises,
    filteredExercises,
    categoryFilters,
    categoryFilterOptions,
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
