import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGoalProgress,
  getSubmissionMedia,
  getTreatmentPlanGoals,
  loadAdminPatientDetailsRawBundle,
} from "../../../services/adminPatientDetailsService";
import {
  loadAdminPatientDetailsBundle,
} from "../utils/adminPatientDetailsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function normalizePatientId(patientId) {
  return typeof patientId === "string" ? patientId.trim() : "";
}

export function useAdminPatientDetails(patientId) {
  const normalizedId = normalizePatientId(patientId);
  const hasValidId = Boolean(normalizedId);

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

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
        setFetchError(resolveErrorMessage(loadError, "Failed to load patient details."));
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
  }, [hasValidId, normalizedId, refreshToken]);

  return {
    details: hasValidId ? details : null,
    isLoading: hasValidId ? isLoading : false,
    error: hasValidId ? fetchError : "Patient id is required.",
    refetch,
  };
}
