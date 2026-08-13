import { useCallback, useEffect, useRef, useState } from "react";
import {
  exportReportPdf,
  loadReportDetail,
} from "../../../services/specialistReportService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistReportDetails(reportId, isAiReport) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!reportId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);

      try {
        const nextDetail = await loadReportDetail(reportId, isAiReport);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setDetail(nextDetail);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setDetail(null);
        setError(resolveErrorMessage(loadError, "Failed to load report."));
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
  }, [reportId, isAiReport, refreshToken]);

  const generatePdf = useCallback(async () => {
    if (!reportId || isExporting) {
      return false;
    }

    setIsExporting(true);
    setError(null);

    try {
      const nextDetail = await exportReportPdf(reportId, isAiReport);
      setDetail(nextDetail);
      return true;
    } catch (exportError) {
      setError(resolveErrorMessage(exportError, "Failed to generate PDF."));
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [reportId, isAiReport, isExporting]);

  return {
    detail,
    isLoading,
    isExporting,
    error,
    reload,
    generatePdf,
  };
}
