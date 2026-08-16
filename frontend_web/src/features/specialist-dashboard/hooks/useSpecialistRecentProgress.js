import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadSpecialistRecentProgress } from "../../../services/specialistDashboardService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistRecentProgress(specialistUserId) {
  const { t } = useLocale();
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
        setError(resolveErrorMessage(loadError, t("specialist.dashboard.errors.progressLoadFailed")));
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
  }, [specialistUserId, refreshToken, t]);

  if (!specialistUserId) {
    return {
      progressItems: [],
      isLoading: false,
      error: t("specialist.dashboard.errors.progressSignInRequired"),
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
