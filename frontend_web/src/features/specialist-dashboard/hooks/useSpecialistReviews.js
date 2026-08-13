import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpecialistAllPendingReviews } from "../../../services/specialistReviewService";
import { subscribeSpecialistReviewRefresh } from "../utils/specialistReviewRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const SIGNED_OUT_ERROR = "Please sign in to view pending reviews.";

export function useSpecialistReviews(specialistUserId) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistReviewRefresh(reload), [reload]);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadReviews() {
      setIsLoading(true);
      setError(null);

      try {
        const nextReviews = await loadSpecialistAllPendingReviews(specialistUserId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setReviews(nextReviews);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setReviews([]);
        setError(resolveErrorMessage(loadError, "Failed to load pending reviews."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken]);

  if (!specialistUserId) {
    return {
      reviews: [],
      isLoading: false,
      error: SIGNED_OUT_ERROR,
      reload,
    };
  }

  return {
    reviews,
    isLoading,
    error,
    reload,
  };
}
