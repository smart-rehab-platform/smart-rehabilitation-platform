import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadSpecialistDashboardOverview } from "../../../services/specialistDashboardService";
import { subscribeSpecialistReviewRefresh } from "../utils/specialistReviewRefresh";
import { subscribeSpecialistSessionRefresh } from "../utils/specialistSessionRefresh";
import { subscribeSpecialistTreatmentPlanRefresh } from "../utils/specialistTreatmentPlanRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistDashboardOverview(specialistUserId) {
  const { t } = useLocale();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistReviewRefresh(reload), [reload]);
  useEffect(() => subscribeSpecialistTreatmentPlanRefresh(reload), [reload]);
  useEffect(() => subscribeSpecialistSessionRefresh(reload), [reload]);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadOverview() {
      setIsLoading(true);
      setError(null);

      try {
        const nextOverview = await loadSpecialistDashboardOverview(specialistUserId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setOverview(nextOverview);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setOverview(null);
        setError(resolveErrorMessage(loadError, t("specialist.dashboard.errors.overviewLoadFailed")));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken, t]);

  if (!specialistUserId) {
    return {
      overview: null,
      isLoading: false,
      error: t("specialist.dashboard.errors.signInRequired"),
      reload,
    };
  }

  return {
    overview,
    isLoading,
    error,
    reload,
  };
}
