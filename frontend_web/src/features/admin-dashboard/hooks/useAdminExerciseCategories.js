import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadExerciseCategories } from "../../../services/adminExercisesService";
import {
  applyAdminExerciseCategoriesLocalization,
  getAdminExercisesLabels,
} from "../utils/adminExercisesLocalization.js";
import { mapExerciseCategory } from "../utils/adminExercisesMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminExerciseCategories() {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);
  const [categories, setCategories] = useState([]);
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

    async function loadCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await loadExerciseCategories();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = rows.map(mapExerciseCategory).filter(Boolean);
        setCategories(applyAdminExerciseCategoriesLocalization(mapped, { t, locale }));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setCategories([]);
        setError(resolveErrorMessage(loadError, labels.toast.categoriesLoadFailed));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [labels.toast.categoriesLoadFailed, locale, refreshToken, t]);

  return {
    categories,
    isLoading,
    error,
    refresh,
  };
}
