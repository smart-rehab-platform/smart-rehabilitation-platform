import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  deactivateAssignedExercise,
  getAssignedExerciseById,
  getAssignedExerciseSubmissions,
} from "../../../services/specialistAssignedExerciseService";
import { notifySpecialistAssignedExerciseRefresh } from "../utils/specialistAssignedExerciseRefresh";
import {
  mapAssignedExerciseDetail,
  mapPatientSubmission,
} from "../utils/specialistPatientMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSpecialistAssignedExerciseDetail(assignedExerciseId, enabled = true) {
  const { t, locale } = useLocale();
  const [assignment, setAssignment] = useState(null);
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const deactivatingRef = useRef(false);

  const loadFailedMessage = t("specialist.assignedExerciseDetails.loadFailed");
  const notFoundMessage = t("specialist.assignedExerciseDetails.notFound");
  const deactivateFailedMessage = t("specialist.assignedExerciseDetails.deactivateFailed");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !assignedExerciseId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      setAssignment(null);
      setLatestSubmission(null);

      try {
        const row = await getAssignedExerciseById(assignedExerciseId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        if (!row) {
          setNotFound(true);
          return;
        }

        const mappedAssignment = mapAssignedExerciseDetail(row, { t, locale });
        if (!mappedAssignment) {
          setNotFound(true);
          return;
        }
        setAssignment(mappedAssignment);

        try {
          const submissionRows = await getAssignedExerciseSubmissions(assignedExerciseId);
          if (cancelled || loadTokenRef.current !== loadToken) {
            return;
          }
          const first = Array.isArray(submissionRows) && submissionRows.length > 0
            ? submissionRows[0]
            : null;
          setLatestSubmission(
            first
              ? mapPatientSubmission(first, t("specialist.assignedExerciseDetails.submissionMedia"), {
                t,
                locale,
              })
              : null,
          );
        } catch {
          if (!cancelled && loadTokenRef.current === loadToken) {
            setLatestSubmission(null);
          }
        }
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        const message = resolveErrorMessage(loadError, loadFailedMessage);
        const status = loadError?.response?.status;
        if (
          status === 404
          || message === notFoundMessage
          || /not found/i.test(message)
        ) {
          setNotFound(true);
          return;
        }
        setError(message);
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    assignedExerciseId,
    enabled,
    locale,
    loadFailedMessage,
    notFoundMessage,
    refreshToken,
    t,
  ]);

  const applyDeactivatedRow = useCallback(() => {
    setAssignment((current) => (
      current
        ? {
          ...current,
          isActive: false,
        }
        : current
    ));
  }, []);

  const deactivate = useCallback(async () => {
    if (!assignedExerciseId || deactivatingRef.current) {
      return { ok: false };
    }
    if (assignment && !assignment.isActive) {
      return { ok: true, alreadyInactive: true };
    }

    deactivatingRef.current = true;
    setIsDeactivating(true);
    setDeactivateError(null);

    try {
      await deactivateAssignedExercise(assignedExerciseId);
      applyDeactivatedRow();
      notifySpecialistAssignedExerciseRefresh();
      return { ok: true };
    } catch (deactivateErr) {
      const message = resolveErrorMessage(deactivateErr, deactivateFailedMessage);
      setDeactivateError(message);
      return { ok: false, error: message };
    } finally {
      deactivatingRef.current = false;
      setIsDeactivating(false);
    }
  }, [
    applyDeactivatedRow,
    assignedExerciseId,
    assignment,
    deactivateFailedMessage,
  ]);

  const localizedAssignment = useMemo(() => {
    if (!assignment) {
      return null;
    }
    return {
      ...assignment,
      statusLabel: assignment.isActive
        ? t("specialist.patientDetails.exerciseStatus.active")
        : t("specialist.patientDetails.exerciseStatus.inactive"),
    };
  }, [assignment, t]);

  return {
    assignment: localizedAssignment,
    latestSubmission,
    isLoading,
    error,
    notFound,
    isDeactivating,
    deactivateError,
    reload,
    deactivate,
  };
}
