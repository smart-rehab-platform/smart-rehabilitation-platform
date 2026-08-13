import { useCallback, useEffect, useRef, useState } from "react";
import { loadAdminReportDetails } from "../../../services/adminReportsService";
import { mapAdminReport } from "../utils/adminReportsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * @param {string|null|undefined} reportId
 * @param {boolean|null|undefined} isAiReport
 */
export function useAdminReportDetails(reportId, isAiReport) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof reportId === "string" ? reportId.trim() : "";
    const hasValidSource = typeof isAiReport === "boolean";
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      if (!normalizedId) {
        setReport(null);
        setError("Report not found.");
        setErrorStatus(404);
        setIsLoading(false);
        return;
      }

      if (!hasValidSource) {
        setReport(null);
        setError("Report source is missing or invalid.");
        setErrorStatus(400);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setErrorStatus(null);

      try {
        const row = await loadAdminReportDetails(normalizedId, isAiReport);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapAdminReport(row, isAiReport);
        if (!mapped) {
          setReport(null);
          setError("Report not found.");
          setErrorStatus(404);
          return;
        }

        setReport(mapped);
        setError(null);
        setErrorStatus(null);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const message = resolveErrorMessage(loadError, "Failed to load report details.");
        const status = typeof loadError?.status === "number" ? loadError.status : null;
        setReport(null);
        setError(message);
        setErrorStatus(status);
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

  return {
    report,
    isLoading,
    error,
    errorStatus,
    refresh,
  };
}
