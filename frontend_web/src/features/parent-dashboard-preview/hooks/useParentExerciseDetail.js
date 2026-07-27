import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAssignedExerciseById,
  getPatientSubmissions,
} from "../../../services/parentDashboardService";
import { buildExerciseDetailViewModel, readString } from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

async function loadExerciseDetailData(assignedExerciseId, patientId) {
  const [assignment, submissionRows] = await Promise.all([
    getAssignedExerciseById(assignedExerciseId),
    patientId ? getPatientSubmissions(patientId) : Promise.resolve([]),
  ]);

  if (!assignment) {
    return { error: "Exercise not found.", assignmentRow: null, submissions: [] };
  }

  const assignmentPatientId = readString(assignment, ["patient_id", "patientId"]);
  if (
    patientId
    && assignmentPatientId
    && assignmentPatientId !== patientId
  ) {
    return {
      error: "This exercise does not belong to the selected child.",
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
        const result = await loadExerciseDetailData(assignedExerciseId, patientId);

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
          setError(resolveErrorMessage(loadError, "Failed to load exercise details."));
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
  }, [assignedExerciseId, patientId, refreshToken]);

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
