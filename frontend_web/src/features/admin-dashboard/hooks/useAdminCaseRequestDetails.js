import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAdminCaseRequestById } from "../../../services/adminCaseRequestsService";
import { mapAdminCaseRequestDetail } from "../utils/adminCaseRequestsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminCaseRequestDetails(requestId) {
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
        setError("Case request not found.");
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
          setError("Case request not found.");
          return;
        }

        setDetail(mapped);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setDetail(null);
        setError(resolveErrorMessage(loadError, "Failed to load case request."));
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
  }, [requestId, refreshToken]);

  return {
    detail,
    isLoading,
    error,
    reload,
  };
}
