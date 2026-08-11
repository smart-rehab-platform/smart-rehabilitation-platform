import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpecialistDashboardOverview } from "../../../services/specialistDashboardService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const SIGNED_OUT_ERROR = "Please sign in to view the specialist dashboard.";

export function useSpecialistDashboardOverview(specialistUserId) {
  const [overview, setOverview] = useState(null);
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

    async function loadOverview() {
      setIsLoading(true);
      setError(null);

      try {
        const nextOverview = await loadSpecialistDashboardOverview(specialistUserId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setOverview(nextOverview);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setOverview(null);
        setError(resolveErrorMessage(loadError, "Failed to load dashboard overview."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken]);

  if (!specialistUserId) {
    return {
      overview: null,
      isLoading: false,
      error: SIGNED_OUT_ERROR,
      reload,
    };
  }

  return {
    overview,
    isLoading,
    error,
    reload,
  };
}
