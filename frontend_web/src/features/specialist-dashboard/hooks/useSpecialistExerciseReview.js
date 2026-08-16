import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  createExerciseReview,
  loadReviewExerciseBundle,
  updateExerciseReview,
} from "../../../services/specialistReviewService";
import { starRatingToPerformanceRating } from "../utils/specialistReviewMappers";
import { notifySpecialistReviewRefresh } from "../utils/specialistReviewRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistExerciseReview(submissionId, specialistUserId) {
  const { t } = useLocale();
  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [starRating, setStarRating] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [requiresRetry, setRequiresRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const loadFailedError = t("specialist.reviews.errors.loadSubmissionFailed");
  const submitFailedError = t("specialist.reviews.errors.submitFailed");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!submissionId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadBundle() {
      setIsLoading(true);
      setError(null);
      setBundle(null);

      try {
        const nextBundle = await loadReviewExerciseBundle(submissionId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setBundle(nextBundle);
        if (nextBundle.existingReview) {
          setStarRating(nextBundle.existingReview.starRating);
          setFeedback(nextBundle.existingReview.feedback || "");
          setRequiresRetry(nextBundle.existingReview.requiresRetry);
        } else {
          setStarRating(3);
          setFeedback("");
          setRequiresRetry(false);
        }
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBundle(null);
        setError(resolveErrorMessage(loadError, loadFailedError));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadBundle();

    return () => {
      cancelled = true;
    };
  }, [submissionId, refreshToken, loadFailedError]);

  const submitReview = useCallback(async () => {
    if (!submissionId || !specialistUserId || isSubmitting) {
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      performanceRating: starRatingToPerformanceRating(starRating),
      feedback: feedback.trim(),
      requiresRetry,
    };

    try {
      if (bundle?.existingReview?.id) {
        await updateExerciseReview(bundle.existingReview.id, payload);
      } else {
        await createExerciseReview(submissionId, {
          specialistId: specialistUserId,
          ...payload,
        });
      }

      notifySpecialistReviewRefresh();
      return true;
    } catch (submitErr) {
      setSubmitError(resolveErrorMessage(submitErr, submitFailedError));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    submissionId,
    specialistUserId,
    isSubmitting,
    starRating,
    feedback,
    requiresRetry,
    bundle,
    submitFailedError,
  ]);

  return {
    bundle,
    isLoading,
    error,
    starRating,
    setStarRating,
    feedback,
    setFeedback,
    requiresRetry,
    setRequiresRetry,
    isSubmitting,
    submitError,
    reload,
    submitReview,
    isUpdate: Boolean(bundle?.existingReview?.id),
  };
}
