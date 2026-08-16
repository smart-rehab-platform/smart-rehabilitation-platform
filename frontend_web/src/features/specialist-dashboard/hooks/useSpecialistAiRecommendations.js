import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  acceptSpecialistAiRecommendation,
  generateSpecialistAiRecommendation,
  loadSpecialistAiRecommendationsBundle,
  rejectSpecialistAiRecommendation,
} from "../../../services/specialistAiRecommendationService";
import { AI_RECOMMENDATION_TYPE } from "../utils/specialistAiRecommendationMappers";
import { notifySpecialistAiRecommendationRefresh } from "../utils/specialistAiRecommendationRefresh";
import { applyAiRecommendationsBundleLocalization } from "../utils/specialistAiRecommendationsLocalization";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistAiRecommendations(specialistUserId, patientId) {
  const { t, locale } = useLocale();
  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingTypeId, setGeneratingTypeId] = useState(null);
  const [updatingRecommendationId, setUpdatingRecommendationId] = useState(null);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadFailedError = t("specialist.aiRecommendations.errors.loadFailed");
  const generateFailedError = t("specialist.aiRecommendations.errors.generateFailed");
  const acceptFailedError = t("specialist.aiRecommendations.errors.acceptFailed");
  const rejectFailedError = t("specialist.aiRecommendations.errors.rejectFailed");
  const generatedToast = t("specialist.aiRecommendations.toast.generated");
  const acceptedToast = t("specialist.aiRecommendations.toast.accepted");
  const rejectedToast = t("specialist.aiRecommendations.toast.rejected");

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
  }, [specialistUserId, patientId, refreshToken, loadFailedError]);

  const localizedBundle = useMemo(
    () => (bundle ? applyAiRecommendationsBundleLocalization(bundle, { t, locale }) : null),
    [bundle, t, locale],
  );

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
      return { ok: true, message: generatedToast };
    } catch (generateError) {
      const message = resolveErrorMessage(generateError, generateFailedError);
      setError(t("specialist.aiRecommendations.errors.generateFailedWithReason", { reason: message }));
      return { ok: false, message };
    } finally {
      setIsGenerating(false);
      setGeneratingTypeId(null);
    }
  }, [
    specialistUserId,
    patientId,
    isGenerating,
    relatedPlanId,
    reloadBundleQuietly,
    generatedToast,
    generateFailedError,
    t,
  ]);

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
      return { ok: true, message: acceptedToast };
    } catch (acceptError) {
      const message = resolveErrorMessage(acceptError, acceptFailedError);
      setError(t("specialist.aiRecommendations.errors.acceptFailedWithReason", { reason: message }));
      return { ok: false, message };
    } finally {
      setUpdatingRecommendationId(null);
    }
  }, [
    specialistUserId,
    patientId,
    updatingRecommendationId,
    reloadBundleQuietly,
    acceptedToast,
    acceptFailedError,
    t,
  ]);

  const reject = useCallback(async (recommendationId) => {
    if (!specialistUserId || !patientId || !recommendationId || updatingRecommendationId) {
      return { ok: false, message: null };
    }

    setUpdatingRecommendationId(recommendationId);
    setError(null);

    try {
      await rejectSpecialistAiRecommendation(specialistUserId, patientId, recommendationId);
      await reloadBundleQuietly();
      return { ok: true, message: rejectedToast };
    } catch (rejectError) {
      const message = resolveErrorMessage(rejectError, rejectFailedError);
      setError(t("specialist.aiRecommendations.errors.rejectFailedWithReason", { reason: message }));
      return { ok: false, message };
    } finally {
      setUpdatingRecommendationId(null);
    }
  }, [
    specialistUserId,
    patientId,
    updatingRecommendationId,
    reloadBundleQuietly,
    rejectedToast,
    rejectFailedError,
    t,
  ]);

  return {
    bundle: localizedBundle,
    recommendations: localizedBundle?.recommendations ?? [],
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
