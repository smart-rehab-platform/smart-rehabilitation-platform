import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
  getPatientAssignedExercises,
  getPatientDailyTasks,
  getPatientSubmissions,
  getPatientWeeklyTasks,
} from "../../../services/parentDashboardService";
import {
  mapTaskRowsToHubTasks,
  mergeChildren,
} from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

async function loadChildTaskBundle(child) {
  const [dailyRows, weeklyRows, assignedRows, submissions] = await Promise.all([
    getPatientDailyTasks(child.id),
    getPatientWeeklyTasks(child.id),
    getPatientAssignedExercises(child.id),
    getPatientSubmissions(child.id),
  ]);

  return {
    dailyTasks: mapTaskRowsToHubTasks(dailyRows, submissions, child),
    weeklyTasks: mapTaskRowsToHubTasks(weeklyRows, submissions, child),
    assignedTasks: mapTaskRowsToHubTasks(assignedRows, submissions, child),
  };
}

export function useParentDailyTasks(parentUserId) {
  const { t } = useLocale();
  const [children, setChildren] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(parentUserId));
  const [error, setError] = useState(null);
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

    async function loadDailyTasksHub() {
      setIsLoading(true);
      setError(null);

      try {
        const [childrenRows, progressRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mergedChildren = mergeChildren(childrenRows, progressRows);
        setChildren(mergedChildren);

        if (mergedChildren.length === 0) {
          setDailyTasks([]);
          setWeeklyTasks([]);
          setAssignedTasks([]);
          return;
        }

        const bundles = await Promise.all(
          mergedChildren.map((child) => loadChildTaskBundle(child)),
        );

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setDailyTasks(bundles.flatMap((bundle) => bundle.dailyTasks));
        setWeeklyTasks(bundles.flatMap((bundle) => bundle.weeklyTasks));
        setAssignedTasks(bundles.flatMap((bundle) => bundle.assignedTasks));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadExercisesFailed")));
          setDailyTasks([]);
          setWeeklyTasks([]);
          setAssignedTasks([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDailyTasksHub();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken, t]);

  const tasksByTab = useMemo(() => ({
    daily: dailyTasks,
    weekly: weeklyTasks,
    assigned: assignedTasks,
  }), [dailyTasks, weeklyTasks, assignedTasks]);

  if (!parentUserId) {
    return {
      children: [],
      tasksByTab: { daily: [], weekly: [], assigned: [] },
      isLoading: false,
      error: t("parent.hooks.signInExercises"),
      refetch,
    };
  }

  return {
    children,
    tasksByTab,
    isLoading,
    error,
    refetch,
  };
}
