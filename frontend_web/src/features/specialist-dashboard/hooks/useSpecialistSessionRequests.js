import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadSpecialistSessionRequestsInbox } from "../../../services/specialistSessionService";
import {
  filterVisibleSessionRequests,
  getSessionRequestEmptyMessage,
} from "../utils/specialistSessionMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistSessionRequests(enabled) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterId, setFilterId] = useState("pending");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const nextRequests = await loadSpecialistSessionRequestsInbox();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setRequests(nextRequests);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setRequests([]);
        setError(resolveErrorMessage(loadError, "Failed to load session requests."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshToken]);

  const visibleRequests = useMemo(
    () => filterVisibleSessionRequests(requests, filterId),
    [requests, filterId],
  );

  const emptyMessage = useMemo(
    () => getSessionRequestEmptyMessage(filterId, {
      totalCount: requests.length,
      visibleCount: visibleRequests.length,
    }),
    [filterId, requests.length, visibleRequests.length],
  );

  return {
    requests,
    visibleRequests,
    isLoading,
    error,
    filterId,
    setFilterId,
    emptyMessage,
    reload,
  };
}
