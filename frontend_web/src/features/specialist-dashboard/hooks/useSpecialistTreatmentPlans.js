import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistScopedTreatmentPlans } from "../../../services/specialistTreatmentPlanService";
import { filterVisibleTreatmentPlans, getActivePatientIds } from "../utils/specialistTreatmentPlanMappers";
import { applyTreatmentPlanListItemLocalization } from "../utils/specialistTreatmentPlansLocalization";
import { subscribeSpecialistTreatmentPlanRefresh } from "../utils/specialistTreatmentPlanRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistTreatmentPlans(specialistUserId) {
  const { t, locale } = useLocale();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadFailedMessage = t("specialist.treatmentPlans.errors.loadFailed");
  const signInRequiredMessage = t("specialist.treatmentPlans.errors.signInRequired");

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
        setError(resolveErrorMessage(loadError, loadFailedMessage));
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
  }, [specialistUserId, refreshToken, loadFailedMessage]);

  const visiblePlans = useMemo(() => {
    const filtered = filterVisibleTreatmentPlans(plans, { filterId, searchQuery });
    return filtered.map((plan) => applyTreatmentPlanListItemLocalization(plan, { t, locale }));
  }, [plans, filterId, searchQuery, t, locale]);

  const activePatientIds = useMemo(() => getActivePatientIds(plans), [plans]);

  if (!specialistUserId) {
    return {
      plans: [],
      visiblePlans: [],
      activePatientIds: new Set(),
      isLoading: false,
      error: signInRequiredMessage,
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
