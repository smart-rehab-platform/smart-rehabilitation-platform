import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getChildren,
  getChildrenProgress,
  getPatientReviews,
} from "../../../services/parentDashboardService";
import {
  mapReviewRowsToFeedbackItems,
  mergeChildren,
} from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

async function loadChildReviews(child) {
  const reviews = await getPatientReviews(child.id);
  return mapReviewRowsToFeedbackItems(reviews, child);
}

export function useParentFeedback(parentUserId) {
  const [children, setChildren] = useState([]);
  const [reviews, setReviews] = useState([]);
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

    async function loadFeedbackHub() {
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
          setReviews([]);
          return;
        }

        const reviewGroups = await Promise.all(
          mergedChildren.map((child) => loadChildReviews(child)),
        );

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setReviews(reviewGroups.flat());
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load exercise feedback."));
          setReviews([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadFeedbackHub();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken]);

  const reviewCount = useMemo(() => reviews.length, [reviews]);

  if (!parentUserId) {
    return {
      children: [],
      reviews: [],
      reviewCount: 0,
      isLoading: false,
      error: "Please sign in to view exercise feedback.",
      refetch,
    };
  }

  return {
    children,
    reviews,
    reviewCount,
    isLoading,
    error,
    refetch,
  };
}
