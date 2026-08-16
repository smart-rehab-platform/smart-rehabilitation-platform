import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistSessionRequestsInbox } from "../../../services/specialistSessionService";
import {
  applySessionRequestLocalization,
  getSessionRequestEmptyMessage,
} from "../utils/specialistSessionsLocalization";
import { filterVisibleSessionRequests } from "../utils/specialistSessionMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistSessionRequests(enabled) {
  const { t, locale } = useLocale();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterId, setFilterId] = useState("pending");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const loadFailedError = t("specialist.sessions.errors.loadRequestsFailed");

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
        setError(resolveErrorMessage(loadError, loadFailedError));
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
  }, [enabled, refreshToken, loadFailedError]);

  const localizedRequests = useMemo(
    () => requests.map((request) => applySessionRequestLocalization(request, { t, locale })),
    [requests, t, locale],
  );

  const visibleRequests = useMemo(
    () => filterVisibleSessionRequests(localizedRequests, filterId),
    [localizedRequests, filterId],
  );

  const emptyMessage = useMemo(
    () => getSessionRequestEmptyMessage(filterId, {
      totalCount: localizedRequests.length,
      visibleCount: visibleRequests.length,
    }, t),
    [filterId, localizedRequests.length, visibleRequests.length, t],
  );

  return {
    requests: localizedRequests,
    visibleRequests,
    isLoading,
    error,
    filterId,
    setFilterId,
    emptyMessage,
    reload,
  };
}
