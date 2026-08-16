import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { fetchSpecialistPendingReviewRows } from "../../../services/specialistDashboardService";
import { subscribeSpecialistReviewRefresh } from "../utils/specialistReviewRefresh";
import { mapPendingReviewPreview } from "../utils/specialistPreviewMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistPendingReviews(specialistUserId) {
  const { t, locale } = useLocale();
  const [rawRows, setRawRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reviews = useMemo(
    () => mapPendingReviewPreview(rawRows, { limit: 4, t, locale }),
    [rawRows, t, locale],
  );

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
        const rows = await fetchSpecialistPendingReviewRows(specialistUserId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setRawRows(rows);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setRawRows([]);
        setError(resolveErrorMessage(loadError, t("specialist.dashboard.errors.reviewsLoadFailed")));
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
  }, [specialistUserId, refreshToken, t]);

  if (!specialistUserId) {
    return {
      reviews: [],
      isLoading: false,
      error: t("specialist.dashboard.errors.reviewsSignInRequired"),
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
