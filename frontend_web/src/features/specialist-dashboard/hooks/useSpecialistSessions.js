import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadSpecialistSessions } from "../../../services/specialistSessionService";
import {
  filterVisibleSessions,
  getSessionListEmptyMessage,
  getSessionsForDate,
  hasSessionsOnDate,
} from "../utils/specialistSessionMappers";
import { subscribeSpecialistSessionRefresh } from "../utils/specialistSessionRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistSessions(specialistUserId, { initialFilterId = "all" } = {}) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState(initialFilterId);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

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
        setError(resolveErrorMessage(loadError, "Failed to load sessions."));
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
  }, [specialistUserId, refreshToken]);

  const visibleSessions = useMemo(
    () => filterVisibleSessions(sessions, { searchQuery, filterId }),
    [sessions, searchQuery, filterId],
  );

  const emptyMessage = useMemo(
    () => getSessionListEmptyMessage({
      hasSessions: sessions.length > 0,
      hasVisible: visibleSessions.length > 0,
    }),
    [sessions.length, visibleSessions.length],
  );

  const getDaySessions = useCallback(
    (date) => getSessionsForDate(sessions, date),
    [sessions],
  );

  const dayHasSessions = useCallback(
    (date) => hasSessionsOnDate(sessions, date),
    [sessions],
  );

  return {
    sessions,
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
