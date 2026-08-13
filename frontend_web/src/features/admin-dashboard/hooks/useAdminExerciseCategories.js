import { useCallback, useEffect, useRef, useState } from "react";
import { loadExerciseCategories } from "../../../services/adminExercisesService";
import { mapExerciseCategory } from "../utils/adminExercisesMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminExerciseCategories() {
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

        setCategories(rows.map(mapExerciseCategory).filter(Boolean));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setCategories([]);
        setError(resolveErrorMessage(loadError, "Failed to load exercise categories."));
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
  }, [refreshToken]);

  return {
    categories,
    isLoading,
    error,
    refresh,
  };
}
