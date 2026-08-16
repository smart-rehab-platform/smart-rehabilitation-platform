import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistSessions } from "../../../services/specialistSessionService";
import {
  applySessionListItemLocalization,
  getSessionListEmptyMessage,
} from "../utils/specialistSessionsLocalization";
import {
  filterVisibleSessions,
  getSessionsForDate,
  hasSessionsOnDate,
} from "../utils/specialistSessionMappers";
import { subscribeSpecialistSessionRefresh } from "../utils/specialistSessionRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistSessions(specialistUserId, { initialFilterId = "all" } = {}) {
  const { t, locale } = useLocale();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState(initialFilterId);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const loadFailedError = t("specialist.sessions.errors.loadFailed");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistSessionRefresh(reload), [reload]);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const nextSessions = await loadSpecialistSessions(specialistUserId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setSessions(nextSessions);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setSessions([]);
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
  }, [specialistUserId, refreshToken, loadFailedError]);

  const localizedSessions = useMemo(
    () => sessions.map((session) => applySessionListItemLocalization(session, { t, locale })),
    [sessions, t, locale],
  );

  const visibleSessions = useMemo(
    () => filterVisibleSessions(localizedSessions, { searchQuery, filterId }),
    [localizedSessions, searchQuery, filterId],
  );

  const emptyMessage = useMemo(
    () => getSessionListEmptyMessage({
      hasSessions: localizedSessions.length > 0,
      hasVisible: visibleSessions.length > 0,
    }, t),
    [localizedSessions.length, visibleSessions.length, t],
  );

  const getDaySessions = useCallback(
    (date) => getSessionsForDate(localizedSessions, date),
    [localizedSessions],
  );

  const dayHasSessions = useCallback(
    (date) => hasSessionsOnDate(localizedSessions, date),
    [localizedSessions],
  );

  return {
    sessions: localizedSessions,
    visibleSessions,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterId,
    setFilterId,
    emptyMessage,
    reload,
    getDaySessions,
    dayHasSessions,
  };
}
