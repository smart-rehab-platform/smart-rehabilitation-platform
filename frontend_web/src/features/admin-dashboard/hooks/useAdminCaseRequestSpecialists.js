import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  assignSpecialistToCaseRequest,
  fetchMatchingSpecialists,
} from "../../../services/adminCaseRequestsService";
import {
  isStalePendingAssignmentError,
  mapMatchingSpecialist,
} from "../utils/adminCaseRequestsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminCaseRequestSpecialists(requestId) {
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [assignmentError, setAssignmentError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const selectedSpecialist = useMemo(
    () => specialists.find((specialist) => specialist.id === selectedSpecialistId) ?? null,
    [specialists, selectedSpecialistId],
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof requestId === "string" ? requestId.trim() : "";
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadSpecialists() {
      if (!normalizedId) {
        setSpecialists([]);
        setSelectedSpecialistId(null);
        setError("Case request not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAssignmentError(null);

      try {
        const rows = await fetchMatchingSpecialists(normalizedId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = rows.map(mapMatchingSpecialist).filter(Boolean);
        setSpecialists(mapped);
        setSelectedSpecialistId((current) => (
          current && mapped.some((specialist) => specialist.id === current) ? current : null
        ));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSpecialists([]);
        setSelectedSpecialistId(null);
        setError(resolveErrorMessage(loadError, "Failed to load matching specialists."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadSpecialists();

    return () => {
      cancelled = true;
    };
  }, [requestId, refreshToken]);

  const selectSpecialist = useCallback((specialistId) => {
    if (isAssigning) {
      return;
    }

    const normalized = typeof specialistId === "string" ? specialistId.trim() : "";
    if (!normalized || !specialists.some((specialist) => specialist.id === normalized)) {
      return;
    }

    setSelectedSpecialistId(normalized);
    setAssignmentError(null);
  }, [isAssigning, specialists]);

  const assignSelectedSpecialist = useCallback(async () => {
    const normalizedId = typeof requestId === "string" ? requestId.trim() : "";
    const specialistId = selectedSpecialistId?.trim();

    if (!normalizedId) {
      return { ok: false, message: "Case request not found." };
    }

    if (!specialistId) {
      return { ok: false, message: "Select a specialist to continue." };
    }

    if (isAssigning) {
      return { ok: false, message: "Assignment already in progress." };
    }

    setIsAssigning(true);
    setAssignmentError(null);

    try {
      await assignSpecialistToCaseRequest(normalizedId, specialistId);
      return { ok: true, message: "Specialist assigned successfully." };
    } catch (assignError) {
      const message = resolveErrorMessage(assignError, "Failed to assign specialist. Please try again.");
      setAssignmentError(message);

      if (isStalePendingAssignmentError(message)) {
        return { ok: false, stale: true, message };
      }

      return { ok: false, message };
    } finally {
      setIsAssigning(false);
    }
  }, [isAssigning, requestId, selectedSpecialistId]);

  return {
    specialists,
    selectedSpecialist,
    selectedSpecialistId,
    isLoading,
    isAssigning,
    error,
    assignmentError,
    reload,
    selectSpecialist,
    assignSelectedSpecialist,
    clearAssignmentError: () => setAssignmentError(null),
  };
}
