import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  loadAdminAiReports,
  loadAdminRegularReports,
} from "../../../services/adminReportsService";
import {
  applyAdminReportsLocalization,
  buildAdminReportFilterOptions,
  getAdminReportsLabels,
} from "../utils/adminReportsLocalization.js";
import {
  filterAdminReports,
  mapAdminAiReport,
  mapAdminRegularReport,
  mergeAndSortAdminReports,
} from "../utils/adminReportsMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminReports() {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminReportsLabels(t), [t]);
  const filterOptions = useMemo(() => buildAdminReportFilterOptions(t), [t]);
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
          labels.loadFailed,
        );
      }

      if (aiResult.status === "fulfilled") {
        aiRows = aiResult.value;
      } else {
        aiErrorMessage = resolveErrorMessage(
          aiResult.reason,
          labels.loadFailed,
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

      setReports(applyAdminReportsLocalization(
        mergeAndSortAdminReports(mappedRegular, mappedAi),
        mapperContext,
      ));
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
  }, [labels.loadFailed, mapperContext, refreshToken]);

  const filteredReports = useMemo(
    () => applyAdminReportsLocalization(
      filterAdminReports(reports, {
        query,
        filter: selectedFilter,
      }),
      mapperContext,
    ),
    [mapperContext, query, reports, selectedFilter],
  );

  return {
    labels,
    reports,
    filteredReports,
    query,
    setQuery,
    selectedFilter,
    setSelectedFilter,
    filterOptions,
    isLoading,
    isRefreshing,
    error,
    aiError,
    refresh,
  };
}
