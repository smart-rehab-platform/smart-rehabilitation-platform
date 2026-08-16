import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  acceptSpecialistCaseRequest,
  fetchSpecialistCaseRequestDetail,
  rejectSpecialistCaseRequest,
  startSpecialistCaseAssessment,
  updateSpecialistAssessmentNotes,
} from "../../../services/specialistCaseRequestService";
import { applyCaseRequestDetailLocalization } from "../utils/specialistCaseRequestMappers";
import { notifySpecialistCaseRequestRefresh } from "../utils/specialistCaseRequestRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistCaseRequestDetails(specialistUserId, caseRequestId) {
  const { t, locale } = useLocale();
  const [baseDetail, setBaseDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);

  const detail = useMemo(
    () => applyCaseRequestDetailLocalization(baseDetail, mapperContext),
    [baseDetail, mapperContext],
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  useEffect(() => {
    if (!specialistUserId || !caseRequestId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);

      try {
        const next = await fetchSpecialistCaseRequestDetail(caseRequestId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBaseDetail(next);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBaseDetail(null);
        setError(resolveErrorMessage(loadError, t("specialist.caseRequests.errors.loadDetailsFailed")));
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
  }, [specialistUserId, caseRequestId, refreshToken, t]);

  const refresh = useCallback(async () => {
    if (!specialistUserId || !caseRequestId) {
      return;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    setIsRefreshing(true);
    setError(null);

    try {
      const next = await fetchSpecialistCaseRequestDetail(caseRequestId);
      if (loadTokenRef.current !== loadToken) {
        return;
      }
      setBaseDetail(next);
    } catch (loadError) {
      if (loadTokenRef.current !== loadToken) {
        return;
      }
      setError(resolveErrorMessage(loadError, t("specialist.caseRequests.errors.loadDetailsFailed")));
    } finally {
      if (loadTokenRef.current === loadToken) {
        setIsRefreshing(false);
      }
    }
  }, [specialistUserId, caseRequestId, t]);

  const hasActiveMutation = isStartingAssessment || isSavingNotes || isAccepting || isRejecting;

  const startAssessment = useCallback(async () => {
    if (!caseRequestId || hasActiveMutation) {
      return false;
    }
    setIsStartingAssessment(true);
    setActionError(null);
    try {
      const next = await startSpecialistCaseAssessment(caseRequestId);
      setBaseDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "start-assessment" });
      return true;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, t("specialist.caseRequests.errors.startAssessmentFailed")));
      return false;
    } finally {
      setIsStartingAssessment(false);
    }
  }, [caseRequestId, hasActiveMutation, t]);

  const saveAssessmentNotes = useCallback(async (notes) => {
    if (!caseRequestId || hasActiveMutation) {
      return false;
    }
    setIsSavingNotes(true);
    setActionError(null);
    try {
      const next = await updateSpecialistAssessmentNotes(caseRequestId, notes);
      setBaseDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "assessment-notes" });
      return true;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, t("specialist.caseRequests.errors.updateNotesFailed")));
      return false;
    } finally {
      setIsSavingNotes(false);
    }
  }, [caseRequestId, hasActiveMutation, t]);

  const acceptCase = useCallback(async () => {
    if (!caseRequestId || hasActiveMutation) {
      return null;
    }
    setIsAccepting(true);
    setActionError(null);
    try {
      const next = await acceptSpecialistCaseRequest(caseRequestId);
      setBaseDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "accept" });
      return next?.patientId || null;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, t("specialist.caseRequests.errors.acceptFailed")));
      return null;
    } finally {
      setIsAccepting(false);
    }
  }, [caseRequestId, hasActiveMutation, t]);

  const rejectCase = useCallback(async (reason) => {
    if (!caseRequestId || hasActiveMutation) {
      return false;
    }
    setIsRejecting(true);
    setActionError(null);
    try {
      const next = await rejectSpecialistCaseRequest(caseRequestId, reason);
      setBaseDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "reject" });
      return true;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, t("specialist.caseRequests.errors.rejectFailed")));
      return false;
    } finally {
      setIsRejecting(false);
    }
  }, [caseRequestId, hasActiveMutation, t]);

  if (!specialistUserId) {
    return {
      detail: null,
      isLoading: false,
      isRefreshing: false,
      error: t("specialist.caseRequests.errors.signInRequired"),
      actionError: null,
      clearActionError,
      isStartingAssessment: false,
      isSavingNotes: false,
      isAccepting: false,
      isRejecting: false,
      hasActiveMutation: false,
      reload,
      refresh,
      startAssessment,
      saveAssessmentNotes,
      acceptCase,
      rejectCase,
    };
  }

  if (!caseRequestId) {
    return {
      detail: null,
      isLoading: false,
      isRefreshing: false,
      error: t("specialist.caseRequests.notFound"),
      actionError: null,
      clearActionError,
      isStartingAssessment: false,
      isSavingNotes: false,
      isAccepting: false,
      isRejecting: false,
      hasActiveMutation: false,
      reload,
      refresh,
      startAssessment,
      saveAssessmentNotes,
      acceptCase,
      rejectCase,
    };
  }

  return {
    detail,
    isLoading,
    isRefreshing,
    error,
    actionError,
    clearActionError,
    isStartingAssessment,
    isSavingNotes,
    isAccepting,
    isRejecting,
    hasActiveMutation,
    reload,
    refresh,
    startAssessment,
    saveAssessmentNotes,
    acceptCase,
    rejectCase,
  };
}
