import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { fetchAdminCaseRequestById } from "../../../services/adminCaseRequestsService";
import {
  applyAdminCaseRequestDetailLocalization,
  getAdminCaseRequestsLabels,
} from "../utils/adminCaseRequestsLocalization.js";
import { mapAdminCaseRequestDetail } from "../utils/adminCaseRequestsMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminCaseRequestDetails(requestId) {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminCaseRequestsLabels(t), [t]);
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof requestId === "string" ? requestId.trim() : "";
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      if (!normalizedId) {
        setDetail(null);
        setError(labels.notFound);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const row = await fetchAdminCaseRequestById(normalizedId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapAdminCaseRequestDetail(row);
        if (!mapped) {
          setDetail(null);
          setError(labels.notFound);
          return;
        }

        setDetail(applyAdminCaseRequestDetailLocalization(mapped, mapperContext));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setDetail(null);
        setError(resolveErrorMessage(loadError, labels.toast.detailsLoadFailed));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [labels, mapperContext, requestId, refreshToken]);

  return {
    detail,
    isLoading,
    error,
    reload,
    labels,
  };
}
