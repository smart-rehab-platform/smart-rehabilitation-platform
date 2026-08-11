import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpecialistRecentProgress } from "../../../services/specialistDashboardService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const SIGNED_OUT_ERROR = "Please sign in to view patient progress.";

export function useSpecialistRecentProgress(specialistUserId) {
  const [progressItems, setProgressItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadProgress() {
      setIsLoading(true);
      setError(null);

      try {
        const nextItems = await loadSpecialistRecentProgress(specialistUserId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setProgressItems(nextItems);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setProgressItems([]);
        setError(resolveErrorMessage(loadError, "Failed to load patient progress."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken]);

  if (!specialistUserId) {
    return {
      progressItems: [],
      isLoading: false,
      error: SIGNED_OUT_ERROR,
      reload,
    };
  }

  return {
    progressItems,
    isLoading,
    error,
    reload,
  };
}
