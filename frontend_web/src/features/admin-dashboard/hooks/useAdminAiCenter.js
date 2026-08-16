import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadAdminAiCenter } from "../../../services/adminAiCenterService";
import {
  applyAdminAiCenterLocalization,
  getAdminAiCenterLabels,
} from "../utils/adminAiCenterLocalization.js";
import { mapAdminAiCenter } from "../utils/adminAiCenterMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminAiCenter() {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminAiCenterLabels(t), [t]);
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
        setError(resolveErrorMessage(loadError, labels.loadFailed));
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
  }, [labels.loadFailed, refreshToken]);

  const localizedData = useMemo(
    () => (data ? applyAdminAiCenterLocalization(data, mapperContext) : null),
    [data, mapperContext],
  );

  return {
    data: localizedData,
    labels,
    isLoading,
    error,
    refresh,
  };
}
