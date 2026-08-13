import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadAdminAiReports,
  loadAdminRegularReports,
} from "../../../services/adminReportsService";
import {
  ADMIN_REPORT_FILTERS,
  filterAdminReports,
  mapAdminAiReport,
  mapAdminRegularReport,
  mergeAndSortAdminReports,
} from "../utils/adminReportsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminReports() {
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadTokenRef = useRef(0);
  const refreshRequestedRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);

  const refresh = useCallback(() => {
    refreshRequestedRef.current = true;
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadReports() {
      const isRefresh = refreshRequestedRef.current && hasLoadedOnceRef.current;
      refreshRequestedRef.current = false;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);
      setAiError(null);

      let regularRows = [];
      let aiRows = [];
      let regularFailed = false;
      let regularErrorMessage = null;
      let aiErrorMessage = null;

      const [regularResult, aiResult] = await Promise.allSettled([
        loadAdminRegularReports(),
        loadAdminAiReports(),
      ]);

      if (regularResult.status === "fulfilled") {
        regularRows = regularResult.value;
      } else {
        regularFailed = true;
        regularErrorMessage = resolveErrorMessage(
          regularResult.reason,
          "Failed to load reports.",
        );
      }

      if (aiResult.status === "fulfilled") {
        aiRows = aiResult.value;
      } else {
        aiErrorMessage = resolveErrorMessage(
          aiResult.reason,
          "Failed to load AI reports.",
        );
      }

      if (cancelled || loadTokenRef.current !== loadToken) {
        return;
      }

      if (regularFailed) {
        setError(regularErrorMessage);
        setAiError(aiErrorMessage);
        if (!hasLoadedOnceRef.current) {
          setReports([]);
        }
        return;
      }

      const mappedRegular = (Array.isArray(regularRows) ? regularRows : [])
        .map(mapAdminRegularReport)
        .filter(Boolean);
      const mappedAi = (Array.isArray(aiRows) ? aiRows : [])
        .map(mapAdminAiReport)
        .filter(Boolean);

      setReports(mergeAndSortAdminReports(mappedRegular, mappedAi));
      setError(null);
      setAiError(aiErrorMessage);
      hasLoadedOnceRef.current = true;
    }

    loadReports()
      .finally(() => {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const filteredReports = useMemo(
    () => filterAdminReports(reports, {
      query,
      filter: selectedFilter,
    }),
    [reports, query, selectedFilter],
  );

  return {
    reports,
    filteredReports,
    query,
    setQuery,
    selectedFilter,
    setSelectedFilter,
    filterOptions: ADMIN_REPORT_FILTERS,
    isLoading,
    isRefreshing,
    error,
    aiError,
    refresh,
  };
}
