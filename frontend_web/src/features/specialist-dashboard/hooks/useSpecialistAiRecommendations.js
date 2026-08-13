import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptSpecialistAiRecommendation,
  generateSpecialistAiRecommendation,
  loadSpecialistAiRecommendationsBundle,
  rejectSpecialistAiRecommendation,
} from "../../../services/specialistAiRecommendationService";
import { AI_RECOMMENDATION_TYPE } from "../utils/specialistAiRecommendationMappers";
import { notifySpecialistAiRecommendationRefresh } from "../utils/specialistAiRecommendationRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistAiRecommendations(specialistUserId, patientId) {
  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingTypeId, setGeneratingTypeId] = useState(null);
  const [updatingRecommendationId, setUpdatingRecommendationId] = useState(null);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!specialistUserId || !patientId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadBundle() {
      setIsLoading(true);
      setError(null);

      try {
        const nextBundle = await loadSpecialistAiRecommendationsBundle(specialistUserId, patientId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBundle(nextBundle);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBundle(null);
        setError(resolveErrorMessage(loadError, "Failed to load AI recommendations."));
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
  }, [specialistUserId, patientId, refreshToken]);

  const reloadBundleQuietly = useCallback(async () => {
    if (!specialistUserId || !patientId) {
      return null;
    }
    const nextBundle = await loadSpecialistAiRecommendationsBundle(specialistUserId, patientId);
    setBundle(nextBundle);
    setError(null);
    return nextBundle;
  }, [specialistUserId, patientId]);

  const relatedPlanId = bundle?.planId ?? null;

  const generate = useCallback(async (typeId) => {
    if (!specialistUserId || !patientId || isGenerating) {
      return { ok: false, message: null };
    }

    setIsGenerating(true);
    setGeneratingTypeId(typeId);
    setError(null);

    try {
      await generateSpecialistAiRecommendation({
        specialistUserId,
        patientId,
        typeId,
        relatedPlanId,
      });
      await reloadBundleQuietly();
      return { ok: true, message: "AI recommendation generated" };
    } catch (generateError) {
      const message = resolveErrorMessage(generateError, "Failed to generate recommendation.");
      setError(`Failed to generate recommendation: ${message}`);
      return { ok: false, message };
    } finally {
      setIsGenerating(false);
      setGeneratingTypeId(null);
    }
  }, [specialistUserId, patientId, isGenerating, relatedPlanId, reloadBundleQuietly]);

  const generateExerciseSuggestion = useCallback(
    () => generate(AI_RECOMMENDATION_TYPE.exerciseSuggestion),
    [generate],
  );

  const generatePlanAdjustment = useCallback(
    () => generate(AI_RECOMMENDATION_TYPE.planAdjustment),
    [generate],
  );

  const accept = useCallback(async (recommendationId) => {
    if (!specialistUserId || !patientId || !recommendationId || updatingRecommendationId) {
      return { ok: false, message: null };
    }

    setUpdatingRecommendationId(recommendationId);
    setError(null);

    try {
      await acceptSpecialistAiRecommendation(specialistUserId, patientId, recommendationId);
      await reloadBundleQuietly();
      notifySpecialistAiRecommendationRefresh();
      return { ok: true, message: "Recommendation accepted" };
    } catch (acceptError) {
      const message = resolveErrorMessage(acceptError, "Failed to accept recommendation.");
      setError(`Failed to accept recommendation: ${message}`);
      return { ok: false, message };
    } finally {
      setUpdatingRecommendationId(null);
    }
  }, [specialistUserId, patientId, updatingRecommendationId, reloadBundleQuietly]);

  const reject = useCallback(async (recommendationId) => {
    if (!specialistUserId || !patientId || !recommendationId || updatingRecommendationId) {
      return { ok: false, message: null };
    }

    setUpdatingRecommendationId(recommendationId);
    setError(null);

    try {
      await rejectSpecialistAiRecommendation(specialistUserId, patientId, recommendationId);
      await reloadBundleQuietly();
      return { ok: true, message: "Recommendation rejected" };
    } catch (rejectError) {
      const message = resolveErrorMessage(rejectError, "Failed to reject recommendation.");
      setError(`Failed to reject recommendation: ${message}`);
      return { ok: false, message };
    } finally {
      setUpdatingRecommendationId(null);
    }
  }, [specialistUserId, patientId, updatingRecommendationId, reloadBundleQuietly]);

  return {
    bundle,
    recommendations: bundle?.recommendations ?? [],
    isLoading,
    isGenerating,
    generatingTypeId,
    updatingRecommendationId,
    error,
    reload,
    generateExerciseSuggestion,
    generatePlanAdjustment,
    accept,
    reject,
  };
}
