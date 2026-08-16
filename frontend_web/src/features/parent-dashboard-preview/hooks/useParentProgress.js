import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
  getPatientImprovement,
  getPatientPerformanceMetrics,
  getPatientProgressDaily,
  getPatientProgressMonthly,
  getPatientProgressWeekly,
} from "../../../services/parentDashboardService";
import { mergeChildren } from "../utils/parentDashboardMappers";
import {
  mapImprovementPercentage,
  mapPerformanceMetrics,
  mapProgressSnapshots,
} from "../utils/parentProgressUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentProgress(parentUserId, requestedChildId) {
  const { t } = useLocale();
  const [children, setChildren] = useState([]);
  const [validChildId, setValidChildId] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [improvementPercentage, setImprovementPercentage] = useState(null);
  const [metrics, setMetrics] = useState({
    totalExercisesCompleted: null,
    averagePerformance: null,
    averageImprovement: null,
  });
  const [isLoadingChildren, setIsLoadingChildren] = useState(Boolean(parentUserId));
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [childrenError, setChildrenError] = useState(null);
  const [progressError, setProgressError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadChildren() {
      setIsLoadingChildren(true);
      setChildrenError(null);

      try {
        const [childrenRows, progressRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const merged = mergeChildren(childrenRows, progressRows);
        setChildren(merged);

        const preferred = requestedChildId && merged.some((child) => child.id === requestedChildId)
          ? requestedChildId
          : merged[0]?.id ?? null;
        setValidChildId(preferred);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setChildrenError(resolveErrorMessage(loadError, t("parent.hooks.loadChildrenFailed")));
          setChildren([]);
          setValidChildId(null);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingChildren(false);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, requestedChildId, refreshToken, t]);

  useEffect(() => {
    if (!validChildId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    let cancelled = false;

    async function loadProgress() {
      setIsLoadingProgress(true);
      setProgressError(null);

      try {
        const [
          dailyRows,
          weeklyRows,
          monthlyRows,
          improvementRow,
          metricsRow,
        ] = await Promise.all([
          getPatientProgressDaily(validChildId),
          getPatientProgressWeekly(validChildId),
          getPatientProgressMonthly(validChildId),
          getPatientImprovement(validChildId),
          getPatientPerformanceMetrics(validChildId),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setDaily(mapProgressSnapshots(dailyRows));
        setWeekly(mapProgressSnapshots(weeklyRows));
        setMonthly(mapProgressSnapshots(monthlyRows));
        setSnapshots(mapProgressSnapshots(weeklyRows));
        setImprovementPercentage(mapImprovementPercentage(improvementRow));
        setMetrics(mapPerformanceMetrics(metricsRow));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setProgressError(resolveErrorMessage(loadError, t("parent.hooks.loadProgressFailed")));
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingProgress(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [validChildId, refreshToken, t]);

  const isLoading = isLoadingChildren || isLoadingProgress;

  if (!parentUserId) {
    return {
      children: [],
      validChildId: null,
      snapshots: [],
      daily: [],
      weekly: [],
      monthly: [],
      improvementPercentage: null,
      metrics: mapPerformanceMetrics(null),
      isLoading: false,
      isLoadingChildren: false,
      isLoadingProgress: false,
      childrenError: t("parent.hooks.signInProgress"),
      progressError: null,
      refetch,
      setValidChildId,
    };
  }

  return {
    children,
    validChildId,
    snapshots,
    daily,
    weekly,
    monthly,
    improvementPercentage,
    metrics,
    isLoading,
    isLoadingChildren,
    isLoadingProgress,
    childrenError,
    progressError,
    refetch,
    setValidChildId,
  };
}
