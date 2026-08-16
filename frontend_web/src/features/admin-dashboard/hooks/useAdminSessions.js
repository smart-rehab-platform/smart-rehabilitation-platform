import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadAdminSessions } from "../../../services/adminSessionsService";
import {
  applyAdminSessionsLocalization,
  getAdminSessionsLabels,
} from "../utils/adminSessionsLocalization.js";
import {
  filterAdminSessions,
  mapAdminSession,
} from "../utils/adminSessionsMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminSessions() {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminSessionsLabels(t), [t]);
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

        const mapped = applyAdminSessionsLocalization(
          rows.map(mapAdminSession).filter(Boolean),
          mapperContext,
        );
        setSessions(mapped);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSessions([]);
        setError(resolveErrorMessage(loadError, labels.loadFailed));
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
  }, [labels.loadFailed, mapperContext, refreshToken]);

  const filteredSessions = useMemo(
    () => applyAdminSessionsLocalization(
      filterAdminSessions(sessions, { searchQuery, selectedStatus }),
      mapperContext,
    ),
    [mapperContext, searchQuery, selectedStatus, sessions],
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim()
    || selectedStatus,
  );

  return {
    labels,
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
