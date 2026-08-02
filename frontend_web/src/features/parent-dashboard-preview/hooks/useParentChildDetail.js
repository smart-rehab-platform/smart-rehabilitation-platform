import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getChildren,
  getChildrenProgress,
  getPatientAssignedExercises,
  getPatientProgress,
  getPatientReports,
  getPatientReviews,
  getSessions,
} from "../../../services/parentDashboardService";
import { mergeChildren, mapReviewRowsToFeedbackItems } from "../utils/parentDashboardMappers";
import { mapAssignedExerciseRow, mapChildListItem } from "../utils/parentChildrenUtils";
import { mapReportRowsToHubItems } from "../utils/parentReportsUtils";
import { mapSessionRowsToHubItems } from "../utils/parentSessionsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentChildDetail(parentUserId, childId) {
  const [child, setChild] = useState(null);
  const [assignedExercises, setAssignedExercises] = useState([]);
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(parentUserId && childId));
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!parentUserId || !childId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const [childrenRows, progressRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mergedChildren = mergeChildren(childrenRows, progressRows);
        const matched = mergedChildren.find((item) => item.id === childId);

        if (!matched) {
          setChild(null);
          setAssignedExercises([]);
          setReports([]);
          setSessions([]);
          setReviews([]);
          setNotFound(true);
          return;
        }

        const mappedChild = mapChildListItem(
          childrenRows.find((row) => {
            const id = row?.id ?? row?._id;
            return id === childId;
          }) || matched,
          matched.progressPercent,
        );

        setChild(mappedChild);

        const [
          progressRowsForChild,
          exerciseRows,
          reportRows,
          sessionRows,
          reviewRows,
        ] = await Promise.all([
          getPatientProgress(childId),
          getPatientAssignedExercises(childId),
          getPatientReports(childId),
          getSessions(parentUserId),
          getPatientReviews(childId),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const childNameByPatientId = { [childId]: mappedChild.fullName };
        const filteredSessions = mapSessionRowsToHubItems(sessionRows)
          .filter((session) => session.patientId === childId);

        setAssignedExercises(exerciseRows.map(mapAssignedExerciseRow));
        setReports(mapReportRowsToHubItems(reportRows, childNameByPatientId));
        setSessions(filteredSessions);
        setReviews(mapReviewRowsToFeedbackItems(reviewRows, mappedChild));

        if (Array.isArray(progressRowsForChild) && progressRowsForChild.length > 0) {
          const latestPercent = progressRowsForChild[0]?.improvement_percentage
            ?? progressRowsForChild[0]?.improvementPercentage;
          if (latestPercent != null) {
            setChild((current) => ({
              ...current,
              progressPercent: Number(latestPercent),
            }));
          }
        }
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load child details."));
        }
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
  }, [parentUserId, childId, refreshToken]);

  const hasContent = useMemo(
    () => Boolean(child && !notFound),
    [child, notFound],
  );

  if (!parentUserId) {
    return {
      child: null,
      assignedExercises: [],
      reports: [],
      sessions: [],
      reviews: [],
      isLoading: false,
      error: "Please sign in to view child details.",
      notFound: false,
      hasContent: false,
      refetch,
    };
  }

  if (!childId) {
    return {
      child: null,
      assignedExercises: [],
      reports: [],
      sessions: [],
      reviews: [],
      isLoading: false,
      error: "Child id is required.",
      notFound: true,
      hasContent: false,
      refetch,
    };
  }

  return {
    child,
    assignedExercises,
    reports,
    sessions,
    reviews,
    isLoading,
    error,
    notFound,
    hasContent,
    refetch,
  };
}
