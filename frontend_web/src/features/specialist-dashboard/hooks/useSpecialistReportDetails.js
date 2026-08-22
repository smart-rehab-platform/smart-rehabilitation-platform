import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  discardAiReport,
  exportReportPdf,
  loadReportDetail,
} from "../../../services/specialistReportService";
import { applyReportDetailLocalization } from "../utils/specialistReportsLocalization";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistReportDetails(reportId, isAiReport) {
  const { t, locale } = useLocale();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadDetailFailedError = t("specialist.reports.errors.loadDetailFailed");
  const generatePdfFailedError = t("specialist.reports.errors.generatePdfFailed");
  const discardFailedError = t("specialist.reports.discard.failed");

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
        setError(resolveErrorMessage(loadError, loadDetailFailedError));
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
  }, [reportId, isAiReport, refreshToken, loadDetailFailedError]);

  const localizedDetail = useMemo(
    () => (detail ? applyReportDetailLocalization(detail, { t, locale }) : null),
    [detail, t, locale],
  );

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
      setError(resolveErrorMessage(exportError, generatePdfFailedError));
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [reportId, isAiReport, isExporting, generatePdfFailedError]);

  const discardReport = useCallback(async () => {
    if (!reportId || !isAiReport || isDiscarding) {
      return false;
    }

    setIsDiscarding(true);
    setError(null);

    try {
      await discardAiReport(reportId);
      return true;
    } catch (discardError) {
      setError(resolveErrorMessage(discardError, discardFailedError));
      return false;
    } finally {
      setIsDiscarding(false);
    }
  }, [reportId, isAiReport, isDiscarding, discardFailedError]);

  return {
    detail: localizedDetail,
    isLoading,
    isExporting,
    isDiscarding,
    error,
    reload,
    generatePdf,
    discardReport,
  };
}
