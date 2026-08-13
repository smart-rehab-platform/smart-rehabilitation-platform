import { useCallback, useEffect, useRef, useState } from "react";
import { loadAdminAiCenter } from "../../../services/adminAiCenterService";
import { mapAdminAiCenter } from "../utils/adminAiCenterMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminAiCenter() {
  const [data, setData] = useState(null);
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

    async function loadAiCenter() {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await loadAdminAiCenter();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setData(mapAdminAiCenter(payload));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setData(null);
        setError(resolveErrorMessage(loadError, "Failed to load AI Center."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadAiCenter();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
