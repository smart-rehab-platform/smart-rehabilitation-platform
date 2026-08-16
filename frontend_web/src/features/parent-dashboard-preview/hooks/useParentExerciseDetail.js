import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getAssignedExerciseById,
  getPatientSubmissions,
} from "../../../services/parentDashboardService";
import { buildExerciseDetailViewModel, readString } from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

async function loadExerciseDetailData(assignedExerciseId, patientId, t) {
  const [assignment, submissionRows] = await Promise.all([
    getAssignedExerciseById(assignedExerciseId),
    patientId ? getPatientSubmissions(patientId) : Promise.resolve([]),
  ]);

  if (!assignment) {
    return { error: t("parent.hooks.exerciseNotFound"), assignmentRow: null, submissions: [] };
  }

  const assignmentPatientId = readString(assignment, ["patient_id", "patientId"]);
  if (
    patientId
    && assignmentPatientId
    && assignmentPatientId !== patientId
  ) {
    return {
      error: t("parent.hooks.exerciseWrongChild"),
      assignmentRow: null,
      submissions: [],
    };
  }

  return {
    error: null,
    assignmentRow: assignment,
    submissions: submissionRows,
  };
}

export function useParentExerciseDetail(assignedExerciseId, patientId) {
  const { t } = useLocale();
  const [assignmentRow, setAssignmentRow] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(assignedExerciseId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = useCallback(() => {
    if (!assignedExerciseId) {
      return;
    }

    setRefreshToken((value) => value + 1);
  }, [assignedExerciseId]);

  useEffect(() => {
    if (!assignedExerciseId) {
      return undefined;
    }

    let cancelled = false;

    async function loadExerciseDetail() {
      setIsLoading(true);
      setError(null);
      setAssignmentRow(null);
      setSubmissions([]);

      try {
        const result = await loadExerciseDetailData(assignedExerciseId, patientId, t);

        if (cancelled) {
          return;
        }

        if (result.error) {
          setError(result.error);
          return;
        }

        setAssignmentRow(result.assignmentRow);
        setSubmissions(result.submissions);
      } catch (loadError) {
        if (!cancelled) {
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadExerciseDetailFailed")));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadExerciseDetail();

    return () => {
      cancelled = true;
    };
  }, [assignedExerciseId, patientId, refreshToken, t]);

  const viewModel = useMemo(
    () => buildExerciseDetailViewModel(assignmentRow, submissions),
    [assignmentRow, submissions],
  );

  if (!assignedExerciseId) {
    return {
      viewModel: null,
      isLoading: false,
      error: null,
      refetch,
    };
  }

  return {
    viewModel,
    isLoading,
    error,
    refetch,
  };
}
