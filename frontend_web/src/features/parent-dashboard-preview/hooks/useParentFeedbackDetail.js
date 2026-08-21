import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
  getPatientReviews,
} from "../../../services/parentDashboardService";
import {
  mapReviewRowToFeedbackItem,
  mergeChildren,
  readString,
} from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentFeedbackDetail(reviewId, patientId, parentUserId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(reviewId && patientId && parentUserId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!reviewId || !patientId || !parentUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadFeedbackDetail() {
      setIsLoading(true);
      setError(null);
      setReview(null);

      try {
        const [childrenRows, progressRows, reviewRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
          getPatientReviews(patientId),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const child = mergeChildren(childrenRows, progressRows)
          .find((entry) => entry.id === patientId) ?? { id: patientId };

        const reviewRow = Array.isArray(reviewRows)
          ? reviewRows.find((row) => readString(row, ["id", "_id"]) === reviewId)
          : null;

        if (!reviewRow) {
          setError(t("parent.pages.feedback.notFound"));
          return;
        }

        const mapped = mapReviewRowToFeedbackItem(reviewRow, child, mapperOptions);
        if (!mapped) {
          setError(t("parent.pages.feedback.notFound"));
          return;
        }

        setReview(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadFeedbackFailed")));
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadFeedbackDetail();

    return () => {
      cancelled = true;
    };
  }, [reviewId, patientId, parentUserId, refreshToken, mapperOptions, t]);

  if (!reviewId || !patientId) {
    return {
      review: null,
      isLoading: false,
      error: t("parent.pages.feedback.notFound"),
      refetch,
    };
  }

  if (!parentUserId) {
    return {
      review: null,
      isLoading: false,
      error: t("parent.hooks.signInFeedback"),
      refetch,
    };
  }

  return {
    review,
    isLoading,
    error,
    refetch,
  };
}
