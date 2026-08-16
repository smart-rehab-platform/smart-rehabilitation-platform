import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getReportById } from "../../../services/parentDashboardService";
import { mapReportRowToHubItem } from "../utils/parentReportsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentReportDetail(reportId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(reportId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!reportId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadReportDetail() {
      setIsLoading(true);
      setError(null);

      try {
        const row = await getReportById(reportId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapReportRowToHubItem(row, null, mapperOptions);
        if (!mapped) {
          setReport(null);
          setError(t("parent.hooks.reportNotFound"));
          return;
        }

        setReport(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setReport(null);
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadReportDetailFailed")));
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadReportDetail();

    return () => {
      cancelled = true;
    };
  }, [reportId, refreshToken, mapperOptions, t]);

  if (!reportId) {
    return {
      report: null,
      isLoading: false,
      error: t("parent.hooks.reportNotFound"),
      refetch,
    };
  }

  return {
    report,
    isLoading,
    error,
    refetch,
  };
}
