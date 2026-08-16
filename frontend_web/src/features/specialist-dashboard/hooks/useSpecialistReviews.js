import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistAllPendingReviews } from "../../../services/specialistReviewService";
import { applyPendingReviewLocalization } from "../utils/specialistReviewsLocalization";
import { subscribeSpecialistReviewRefresh } from "../utils/specialistReviewRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistReviews(specialistUserId) {
  const { t, locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const signedOutError = t("specialist.reviews.errors.signInRequired");
  const loadFailedError = t("specialist.reviews.errors.loadFailed");

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
        setError(resolveErrorMessage(loadError, loadFailedError));
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
  }, [specialistUserId, refreshToken, loadFailedError]);

  const localizedReviews = useMemo(
    () => reviews.map((review) => applyPendingReviewLocalization(review, { t, locale })),
    [reviews, t, locale],
  );

  if (!specialistUserId) {
    return {
      reviews: [],
      isLoading: false,
      error: signedOutError,
      reload,
    };
  }

  return {
    reviews: localizedReviews,
    isLoading,
    error,
    reload,
  };
}
