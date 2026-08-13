import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadAdminSessions } from "../../../services/adminSessionsService";
import {
  filterAdminSessions,
  mapAdminSession,
} from "../utils/adminSessionsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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

    async function loadSessions() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await loadAdminSessions();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = rows.map(mapAdminSession).filter(Boolean);
        setSessions(mapped);
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

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const filteredSessions = useMemo(
    () => filterAdminSessions(sessions, { searchQuery, selectedStatus }),
    [sessions, searchQuery, selectedStatus],
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim()
    || selectedStatus,
  );

  return {
    sessions,
    filteredSessions,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    hasActiveFilters,
    isLoading,
    error,
    refresh,
  };
}
