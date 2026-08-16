import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getGoalProgress,
  getSubmissionMedia,
  getTreatmentPlanGoals,
  loadAdminPatientDetailsRawBundle,
} from "../../../services/adminPatientDetailsService";
import {
  loadAdminPatientDetailsBundle,
} from "../utils/adminPatientDetailsMappers";
import {
  applyAdminPatientDetailsLocalization,
  getAdminPatientDetailsLabels,
} from "../utils/adminPatientsLocalization.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function normalizePatientId(patientId) {
  return typeof patientId === "string" ? patientId.trim() : "";
}

export function useAdminPatientDetails(patientId) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);
  const normalizedId = normalizePatientId(patientId);
  const hasValidId = Boolean(normalizedId);

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const localizedDetails = useMemo(
    () => applyAdminPatientDetailsLocalization(details, { t, locale }),
    [details, t, locale],
  );

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!hasValidId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetails() {
      setIsLoading(true);
      setFetchError(null);
      setDetails(null);

      try {
        const bundle = await loadAdminPatientDetailsBundle(normalizedId, {
          loadRawBundle: loadAdminPatientDetailsRawBundle,
          getTreatmentPlanGoals,
          getGoalProgress,
          getSubmissionMedia,
        });

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setDetails(bundle);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setDetails(null);
        setFetchError(resolveErrorMessage(loadError, labels.loadFailed));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [hasValidId, normalizedId, refreshToken, labels.loadFailed]);

  return {
    details: hasValidId ? localizedDetails : null,
    isLoading: hasValidId ? isLoading : false,
    error: hasValidId ? fetchError : labels.idRequired,
    refetch,
    labels,
  };
}
