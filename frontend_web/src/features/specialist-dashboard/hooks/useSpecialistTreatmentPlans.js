import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadSpecialistScopedTreatmentPlans } from "../../../services/specialistTreatmentPlanService";
import {
  filterVisibleTreatmentPlans,
  getActivePatientIds,
} from "../utils/specialistTreatmentPlanMappers";
import { subscribeSpecialistTreatmentPlanRefresh } from "../utils/specialistTreatmentPlanRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistTreatmentPlans(specialistUserId) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistTreatmentPlanRefresh(reload), [reload]);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadPlans() {
      setIsLoading(true);
      setError(null);

      try {
        const nextPlans = await loadSpecialistScopedTreatmentPlans(specialistUserId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setPlans(nextPlans);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setPlans([]);
        setError(resolveErrorMessage(loadError, "Failed to load treatment plans."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken]);

  const visiblePlans = useMemo(
    () => filterVisibleTreatmentPlans(plans, { filterId, searchQuery }),
    [plans, filterId, searchQuery],
  );

  const activePatientIds = useMemo(() => getActivePatientIds(plans), [plans]);

  if (!specialistUserId) {
    return {
      plans: [],
      visiblePlans: [],
      activePatientIds: new Set(),
      isLoading: false,
      error: "Please sign in to view treatment plans.",
      searchQuery,
      setSearchQuery,
      filterId,
      setFilterId,
      reload,
    };
  }

  return {
    plans,
    visiblePlans,
    activePatientIds,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterId,
    setFilterId,
    reload,
  };
}
