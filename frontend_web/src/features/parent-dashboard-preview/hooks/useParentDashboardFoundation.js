import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
  getPatientDailyTasks,
  getPatientImprovement,
  getPatientReports,
  getPatientReviews,
  getPatientSubmissions,
  getSessions,
} from "../../../services/parentDashboardService";
import {
  buildChildViewModel,
  buildLatestUpdatesViewModel,
  mergeChildren,
} from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentDashboardFoundation(parentUserId) {
  const { t, locale } = useLocale();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [childPayload, setChildPayload] = useState(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(Boolean(parentUserId));
  const [isLoadingHero, setIsLoadingHero] = useState(false);
  const [foundationError, setFoundationError] = useState(null);
  const [heroError, setHeroError] = useState(null);
  const [tasksError, setTasksError] = useState(null);
  const [childRefreshToken, setChildRefreshToken] = useState(0);
  const childLoadTokenRef = useRef(0);

  const selectedChild = useMemo(
    () => children.find((entry) => entry.id === selectedChildId) ?? null,
    [children, selectedChildId],
  );

  const childViewModel = useMemo(() => {
    if (
      !selectedChild
      || !selectedChildId
      || !childPayload
      || childPayload.patientId !== selectedChildId
    ) {
      return {
        heroViewModel: null,
        exercises: [],
        summary: null,
        latestReport: null,
        recentFeedback: null,
        reportsError: null,
        reviewsError: null,
      };
    }

    const viewModel = buildChildViewModel({
      child: selectedChild,
      improvement: childPayload.improvement,
      dailyTasks: childPayload.dailyTasks,
      submissions: childPayload.submissions,
      sessions,
      patientId: selectedChildId,
    }, { t, locale });

    const updates = buildLatestUpdatesViewModel({
      reports: childPayload.reports,
      reviews: childPayload.reviews,
    }, { t, locale });

    return {
      heroViewModel: viewModel.hero,
      exercises: viewModel.exercises,
      summary: viewModel.summary,
      latestReport: updates.latestReport,
      recentFeedback: updates.recentFeedback,
      reportsError: childPayload.reportsError,
      reviewsError: childPayload.reviewsError,
    };
  }, [selectedChild, selectedChildId, childPayload, sessions, t, locale]);

  const resetChildScopedData = useCallback(() => {
    setIsLoadingHero(true);
    setHeroError(null);
    setTasksError(null);
    setChildPayload(null);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    let cancelled = false;

    async function loadFoundation() {
      setIsLoadingChildren(true);
      setFoundationError(null);

      try {
        const [childrenRows, progressRows, sessionRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
          getSessions(parentUserId),
        ]);

        if (cancelled) {
          return;
        }

        const mergedChildren = mergeChildren(childrenRows, progressRows);
        setChildren(mergedChildren);
        setSessions(sessionRows);

        if (mergedChildren.length === 0) {
          setSelectedChildId(null);
          setChildPayload(null);
          setIsLoadingHero(false);
          return;
        }

        resetChildScopedData();
        setSelectedChildId(mergedChildren[0]?.id ?? null);
      } catch (error) {
        if (!cancelled) {
          setFoundationError(
            resolveErrorMessage(error, "Failed to load children for the dashboard."),
          );
          setChildren([]);
          setSelectedChildId(null);
          setChildPayload(null);
          setIsLoadingHero(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingChildren(false);
        }
      }
    }

    loadFoundation();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, resetChildScopedData]);

  useEffect(() => {
    if (!parentUserId || !selectedChildId || !selectedChild) {
      return undefined;
    }

    const loadToken = childLoadTokenRef.current + 1;
    childLoadTokenRef.current = loadToken;

    let cancelled = false;

    async function loadChildData() {
      setIsLoadingHero(true);
      setHeroError(null);
      setTasksError(null);
      setChildPayload(null);

      const updatesPromise = Promise.allSettled([
        getPatientReports(selectedChildId),
        getPatientReviews(selectedChildId),
      ]);

      let improvement = null;
      let dailyTasks = [];
      let submissions = [];
      let coreError = null;

      try {
        [improvement, dailyTasks, submissions] = await Promise.all([
          getPatientImprovement(selectedChildId),
          getPatientDailyTasks(selectedChildId),
          getPatientSubmissions(selectedChildId),
        ]);
      } catch (error) {
        coreError = resolveErrorMessage(error, "Failed to load child dashboard data.");
      }

      const [reportsSettled, reviewsSettled] = await updatesPromise;

      if (cancelled || childLoadTokenRef.current !== loadToken) {
        return;
      }

      const reports = reportsSettled.status === "fulfilled" ? reportsSettled.value : [];
      const reviews = reviewsSettled.status === "fulfilled" ? reviewsSettled.value : [];
      const reportsError = reportsSettled.status === "rejected"
        ? resolveErrorMessage(reportsSettled.reason, "Failed to load patient reports.")
        : null;
      const reviewsError = reviewsSettled.status === "rejected"
        ? resolveErrorMessage(reviewsSettled.reason, "Failed to load patient reviews.")
        : null;

      if (coreError) {
        setHeroError(coreError);
        setTasksError(coreError);
      }

      setChildPayload({
        patientId: selectedChildId,
        improvement,
        dailyTasks,
        submissions,
        reports,
        reviews,
        reportsError,
        reviewsError,
      });

      if (childLoadTokenRef.current === loadToken) {
        setIsLoadingHero(false);
      }
    }

    loadChildData();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, selectedChildId, selectedChild, childRefreshToken]);

  const selectChild = useCallback((childId) => {
    childLoadTokenRef.current += 1;
    resetChildScopedData();
    setSelectedChildId(childId);
  }, [resetChildScopedData]);

  const refreshSelectedChild = useCallback(() => {
    if (!selectedChildId) {
      return;
    }

    setChildRefreshToken((value) => value + 1);
  }, [selectedChildId]);

  const dailyTasks = useMemo(() => {
    if (
      !selectedChildId
      || !childPayload
      || childPayload.patientId !== selectedChildId
    ) {
      return [];
    }

    return childPayload.dailyTasks ?? [];
  }, [selectedChildId, childPayload]);

  if (!parentUserId) {
    return {
      children: [],
      selectedChildId: null,
      selectChild,
      refreshSelectedChild,
      heroViewModel: null,
      exercises: [],
      summary: null,
      latestReport: null,
      recentFeedback: null,
      reportsError: null,
      reviewsError: null,
      sessions: [],
      dailyTasks: [],
      isLoadingChildren: false,
      isLoadingHero: false,
      foundationError: "Please sign in to view the parent dashboard.",
      heroError: null,
      tasksError: null,
    };
  }

  return {
    children,
    selectedChildId,
    selectChild,
    refreshSelectedChild,
    heroViewModel: childViewModel.heroViewModel,
    exercises: childViewModel.exercises,
    summary: childViewModel.summary,
    latestReport: childViewModel.latestReport,
    recentFeedback: childViewModel.recentFeedback,
    reportsError: childViewModel.reportsError,
    reviewsError: childViewModel.reviewsError,
    sessions,
    dailyTasks,
    isLoadingChildren,
    isLoadingHero,
    foundationError,
    heroError,
    tasksError,
  };
}
