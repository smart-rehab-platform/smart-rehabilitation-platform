import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  createPatientDiagnosis,
  createPatientNote,
  createSpecialistConversation,
  getPatientFamilyPatternDetails,
  getPatientFamilyPatterns,
  getPatientGuardians,
  getSubmissionMedia,
  getTreatmentPlanGoals,
  getGoalProgress,
  loadSpecialistPatientDetailsBundle,
  loadSpecialistPatients,
} from "../../../services/specialistPatientService";
import {
  applyPatientDetailsLocalization,
  getPatientFamilyPatternErrorMessage,
  getPatientLoadErrorMessage,
  getPatientMessageParentErrorMessage,
} from "../utils/specialistPatientsLocalization.js";
import {
  buildPatientDetailsBundle,
  buildRecentSubmissionsWithMedia,
  fetchGoalsWithProgress,
  mapFamilyPatternDetails,
  mapFamilyPatternInsight,
  mapPatientGuardian,
  pickPrimaryGuardian,
  selectActiveTreatmentPlan,
} from "../utils/specialistPatientMappers";
import { subscribeSpecialistReviewRefresh } from "../utils/specialistReviewRefresh";
import { subscribeSpecialistTreatmentPlanRefresh } from "../utils/specialistTreatmentPlanRefresh";
import { subscribeSpecialistAiRecommendationRefresh } from "../utils/specialistAiRecommendationRefresh";
import { subscribeSpecialistAssignedExerciseRefresh } from "../utils/specialistAssignedExerciseRefresh";
import { subscribeSpecialistGoalsRefresh } from "../utils/specialistGoalsRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistPatientDetails(patientId, specialistUserId) {
  const { t, locale } = useLocale();
  const [baseDetails, setBaseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);
  const [familyPattern, setFamilyPattern] = useState(null);
  const [familyPatternDetails, setFamilyPatternDetails] = useState(null);
  const [isLoadingFamilyPattern, setIsLoadingFamilyPattern] = useState(false);
  const [familyPatternError, setFamilyPatternError] = useState(null);
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);

  const details = useMemo(
    () => applyPatientDetailsLocalization(baseDetails, mapperContext),
    [baseDetails, mapperContext],
  );

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistReviewRefresh(refetch), [refetch]);
  useEffect(() => subscribeSpecialistTreatmentPlanRefresh(refetch), [refetch]);
  useEffect(() => subscribeSpecialistAiRecommendationRefresh(refetch), [refetch]);
  useEffect(() => subscribeSpecialistAssignedExerciseRefresh(refetch), [refetch]);
  useEffect(() => subscribeSpecialistGoalsRefresh(refetch), [refetch]);

  const loadFamilyPattern = useCallback(async (id) => {
    setIsLoadingFamilyPattern(true);
    setFamilyPatternError(null);
    try {
      const row = await getPatientFamilyPatterns(id);
      setFamilyPattern(mapFamilyPatternInsight(row));
    } catch (loadError) {
      setFamilyPattern(null);
      setFamilyPatternError(
        resolveErrorMessage(loadError, getPatientFamilyPatternErrorMessage(t)),
      );
    } finally {
      setIsLoadingFamilyPattern(false);
    }
  }, [t]);

  const loadFamilyPatternRef = useRef(loadFamilyPattern);
  loadFamilyPatternRef.current = loadFamilyPattern;

  useEffect(() => {
    if (!patientId || !specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetails() {
      setIsLoading(true);
      setError(null);
      setBaseDetails(null);
      setFamilyPattern(null);
      setFamilyPatternError(null);

      try {
        const assignedRows = await loadSpecialistPatients(specialistUserId);
        const assignedIds = new Set(
          assignedRows.map((row) => String(row?.id || row?._id || "").trim()).filter(Boolean),
        );

        if (!assignedIds.has(patientId)) {
          throw new Error("Patient not found or not assigned to you.");
        }

        const rawBundle = await loadSpecialistPatientDetailsBundle(patientId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const activePlan = selectActiveTreatmentPlan(rawBundle.treatmentPlanRows);
        const goals = activePlan?.id
          ? await fetchGoalsWithProgress(
            activePlan.id,
            getTreatmentPlanGoals,
            getGoalProgress,
          )
          : [];

        const recentSubmissions = await buildRecentSubmissionsWithMedia(
          rawBundle.submissionRows,
          getSubmissionMedia,
        );

        const bundle = await buildPatientDetailsBundle(
          { ...rawBundle, recentSubmissions },
          goals,
        );

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setBaseDetails(bundle);
        await loadFamilyPatternRef.current(patientId);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBaseDetails(null);
        setError(getPatientLoadErrorMessage(loadError, t));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [patientId, specialistUserId, refreshToken]);

  const addNote = useCallback(async (noteText) => {
    if (!patientId) {
      return false;
    }

    setIsSavingNote(true);
    try {
      await createPatientNote(patientId, noteText);
      refetch();
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingNote(false);
    }
  }, [patientId, refetch]);

  const addDiagnosis = useCallback(async (payload) => {
    if (!patientId) {
      return { ok: false, message: getPatientLoadErrorMessage(new Error("missing patient"), t) };
    }

    setIsSavingDiagnosis(true);
    try {
      await createPatientDiagnosis(patientId, payload);
      refetch();
      return { ok: true };
    } catch (saveError) {
      return {
        ok: false,
        message: resolveErrorMessage(saveError, t("specialist.patientDetails.saveDiagnosisFailed")),
      };
    } finally {
      setIsSavingDiagnosis(false);
    }
  }, [patientId, refetch, t]);

  const openMessageParent = useCallback(async () => {
    if (!patientId || !specialistUserId || isOpeningConversation) {
      return null;
    }

    setIsOpeningConversation(true);
    try {
      const guardianRows = await getPatientGuardians(patientId);
      const guardians = guardianRows.map(mapPatientGuardian).filter(Boolean);
      const parent = pickPrimaryGuardian(guardians);
      if (!parent) {
        throw new Error("No parent is linked to this patient yet.");
      }

      const conversation = await createSpecialistConversation({
        patientId,
        parentId: parent.parentId,
        specialistId: specialistUserId,
      });

      return conversation.id;
    } finally {
      setIsOpeningConversation(false);
    }
  }, [patientId, specialistUserId, isOpeningConversation]);

  const loadFamilyPatternDetailsPanel = useCallback(async () => {
    if (!patientId) {
      return null;
    }
    const row = await getPatientFamilyPatternDetails(patientId);
    const mapped = mapFamilyPatternDetails(row);
    setFamilyPatternDetails(mapped);
    return mapped;
  }, [patientId]);

  if (!patientId || !specialistUserId) {
    return {
      details: null,
      isLoading: false,
      error: null,
      isSavingNote: false,
      isSavingDiagnosis: false,
      familyPattern: null,
      familyPatternDetails: null,
      isLoadingFamilyPattern: false,
      familyPatternError: null,
      isOpeningConversation: false,
      refetch,
      addNote,
      addDiagnosis,
      openMessageParent,
      loadFamilyPatternDetailsPanel,
      retryFamilyPattern: () => loadFamilyPattern(patientId),
    };
  }

  return {
    details,
    isLoading,
    error,
    isSavingNote,
    isSavingDiagnosis,
    familyPattern,
    familyPatternDetails,
    isLoadingFamilyPattern,
    familyPatternError,
    isOpeningConversation,
    refetch,
    addNote,
    addDiagnosis,
    openMessageParent,
    loadFamilyPatternDetailsPanel,
    retryFamilyPattern: () => loadFamilyPattern(patientId),
    getMessageParentError: (messageError) => getPatientMessageParentErrorMessage(messageError, t),
  };
}
