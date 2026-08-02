import { useCallback, useEffect, useRef, useState } from "react";
import { getTreatmentJourney } from "../../../services/parentDashboardService";
import {
  normalizeJourneyPeriod,
  resolveTreatmentJourneyError,
} from "../utils/parentTreatmentJourneyUtils";

export function useParentTreatmentJourney(patientId) {
  const [journey, setJourney] = useState(null);
  const [period, setPeriodState] = useState("weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const patientIdRef = useRef(patientId);

  const loadTreatmentJourney = useCallback(async (
    targetPatientId,
    targetPeriod,
    options = {},
  ) => {
    const {
      refresh = false,
      periodChange = false,
    } = options;

    if (!targetPatientId) {
      return;
    }

    const normalizedPeriod = normalizeJourneyPeriod(targetPeriod);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (refresh) {
      setIsRefreshing(true);
    } else if (periodChange) {
      setIsPeriodLoading(true);
    } else {
      setIsLoading(true);
    }

    if (!periodChange) {
      setError(null);
    }

    try {
      const nextJourney = await getTreatmentJourney(targetPatientId, normalizedPeriod);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setJourney(nextJourney);
      setPeriodState(nextJourney?.period ?? normalizedPeriod);
      setError(null);
    } catch (loadError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError(resolveTreatmentJourneyError(loadError));
    } finally {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setIsLoading(false);
      setIsRefreshing(false);
      setIsPeriodLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!patientId) {
      requestIdRef.current += 1;
      patientIdRef.current = null;
      setJourney(null);
      setPeriodState("weekly");
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsPeriodLoading(false);
      return undefined;
    }

    const patientChanged = patientIdRef.current !== patientId;
    patientIdRef.current = patientId;

    if (patientChanged) {
      setJourney(null);
      setPeriodState("weekly");
      setError(null);
    }

    loadTreatmentJourney(patientId, "weekly", {
      periodChange: false,
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [patientId, loadTreatmentJourney]);

  const setPeriod = useCallback((nextPeriod) => {
    if (!patientId) {
      return;
    }

    const normalizedPeriod = normalizeJourneyPeriod(nextPeriod);

    if (
      normalizedPeriod === period
      && journey
      && !isLoading
      && !isPeriodLoading
    ) {
      return;
    }

    setPeriodState(normalizedPeriod);
    loadTreatmentJourney(patientId, normalizedPeriod, { periodChange: true });
  }, [
    patientId,
    period,
    journey,
    isLoading,
    isPeriodLoading,
    loadTreatmentJourney,
  ]);

  const retry = useCallback(() => {
    if (!patientId) {
      return;
    }

    loadTreatmentJourney(patientId, period, { periodChange: Boolean(journey) });
  }, [patientId, period, journey, loadTreatmentJourney]);

  const refresh = useCallback(() => {
    if (!patientId) {
      return;
    }

    loadTreatmentJourney(patientId, period, { refresh: true, periodChange: Boolean(journey) });
  }, [patientId, period, journey, loadTreatmentJourney]);

  return {
    journey,
    period,
    isLoading,
    isRefreshing,
    isPeriodLoading,
    error,
    setPeriod,
    retry,
    refresh,
  };
}
