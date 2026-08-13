import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptSpecialistCaseRequest,
  fetchSpecialistCaseRequestDetail,
  rejectSpecialistCaseRequest,
  startSpecialistCaseAssessment,
  updateSpecialistAssessmentNotes,
} from "../../../services/specialistCaseRequestService";
import { notifySpecialistCaseRequestRefresh } from "../utils/specialistCaseRequestRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistCaseRequestDetails(specialistUserId, caseRequestId) {
  const [detail, setDetail] = useState(null);
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
        setDetail(next);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setDetail(null);
        setError(resolveErrorMessage(loadError, "Failed to load case request."));
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
  }, [specialistUserId, caseRequestId, refreshToken]);

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
      setDetail(next);
    } catch (loadError) {
      if (loadTokenRef.current !== loadToken) {
        return;
      }
      setError(resolveErrorMessage(loadError, "Failed to load case request."));
    } finally {
      if (loadTokenRef.current === loadToken) {
        setIsRefreshing(false);
      }
    }
  }, [specialistUserId, caseRequestId]);

  const hasActiveMutation = isStartingAssessment || isSavingNotes || isAccepting || isRejecting;

  const startAssessment = useCallback(async () => {
    if (!caseRequestId || hasActiveMutation) {
      return false;
    }
    setIsStartingAssessment(true);
    setActionError(null);
    try {
      const next = await startSpecialistCaseAssessment(caseRequestId);
      setDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "start-assessment" });
      return true;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, "Failed to start assessment."));
      return false;
    } finally {
      setIsStartingAssessment(false);
    }
  }, [caseRequestId, hasActiveMutation]);

  const saveAssessmentNotes = useCallback(async (notes) => {
    if (!caseRequestId || hasActiveMutation) {
      return false;
    }
    setIsSavingNotes(true);
    setActionError(null);
    try {
      const next = await updateSpecialistAssessmentNotes(caseRequestId, notes);
      setDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "assessment-notes" });
      return true;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, "Failed to update assessment notes."));
      return false;
    } finally {
      setIsSavingNotes(false);
    }
  }, [caseRequestId, hasActiveMutation]);

  const acceptCase = useCallback(async () => {
    if (!caseRequestId || hasActiveMutation) {
      return null;
    }
    setIsAccepting(true);
    setActionError(null);
    try {
      const next = await acceptSpecialistCaseRequest(caseRequestId);
      setDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "accept" });
      return next?.patientId || null;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, "Failed to accept case request."));
      return null;
    } finally {
      setIsAccepting(false);
    }
  }, [caseRequestId, hasActiveMutation]);

  const rejectCase = useCallback(async (reason) => {
    if (!caseRequestId || hasActiveMutation) {
      return false;
    }
    setIsRejecting(true);
    setActionError(null);
    try {
      const next = await rejectSpecialistCaseRequest(caseRequestId, reason);
      setDetail(next);
      notifySpecialistCaseRequestRefresh({ caseRequestId, action: "reject" });
      return true;
    } catch (actionErr) {
      setActionError(resolveErrorMessage(actionErr, "Failed to reject case request."));
      return false;
    } finally {
      setIsRejecting(false);
    }
  }, [caseRequestId, hasActiveMutation]);

  if (!specialistUserId) {
    return {
      detail: null,
      isLoading: false,
      isRefreshing: false,
      error: "Please sign in to view this case request.",
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
      error: "Case request not found.",
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
