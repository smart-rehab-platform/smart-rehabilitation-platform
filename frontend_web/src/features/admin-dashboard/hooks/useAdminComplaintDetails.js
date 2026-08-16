import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadAdminComplaintDetails } from "../../../services/adminComplaintsService";
import {
  applyAdminComplaintDetailsLocalization,
  getAdminComplaintsLabels,
} from "../utils/adminComplaintsLocalization.js";
import { mapAdminComplaintDetails } from "../utils/adminComplaintsMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminComplaintDetails(complaintId) {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof complaintId === "string" ? complaintId.trim() : "";
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      if (!normalizedId) {
        setComplaint(null);
        setError(labels.notFound);
        setErrorStatus(404);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setErrorStatus(null);

      try {
        const row = await loadAdminComplaintDetails(normalizedId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapAdminComplaintDetails(row);
        if (!mapped) {
          setComplaint(null);
          setError(labels.notFound);
          setErrorStatus(404);
          return;
        }

        setComplaint(applyAdminComplaintDetailsLocalization(mapped, mapperContext));
        setError(null);
        setErrorStatus(null);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const message = resolveErrorMessage(loadError, labels.loadFailed);
        const status = typeof loadError?.status === "number" ? loadError.status : null;
        setComplaint(null);
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
  }, [complaintId, labels, mapperContext, refreshToken]);

  return {
    complaint,
    isLoading,
    error,
    errorStatus,
    refresh,
    labels,
  };
}
